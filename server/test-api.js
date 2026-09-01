/**
 * Comprehensive Automated API & Concurrency Test Suite for CampusSync Server
 * Tests all 7 Core Pillars:
 * 1. College Auth & Rate-Limiting & JWT
 * 2. CampusConnect Discussions & Comments & Voting
 * 3. CampusBid & Marketplace (Fixed Price & Live Auction Bidding)
 * 4. CampusSkills (Skill-Sharing Network: Offer & Request)
 * 5. CampusTasks (Micro-Tasks & Campus Gigs with Atomic Assignment)
 * 6. CampusRide (Carpooling & Atomic Anti-Overbooking Concurrency Guard)
 * 7. CampusNearby (Local Student Deals & Campus Events)
 */

import http from "http";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000";

let jwtToken = "";
let createdPostId = "";
let testItemId = "";
let testRideId = "";
let testSkillId = "";
let testTaskId = "";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (jwtToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${jwtToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

async function ensureServerRunning() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.ok) return null;
  } catch (e) {
    // Server is not running, import and start in-process
    console.log("⚡ Starting CampusSync Server in-process for test execution...");
    const { app, server } = await import("./src/server.js");
    await new Promise(r => setTimeout(r, 1500));
    return server;
  }
  return null;
}

async function runTests() {
  console.log(`\n🧪 ========================================================`);
  console.log(`   RUNNING CAMPUSSYNC 7-PILLAR BACKEND & CONCURRENCY TEST SUITE`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`========================================================\n`);

  // 1. HEALTH & METADATA
  console.log("[1] Testing Root & Health Endpoints");
  const root = await request("/");
  assert(root.status === 200, "GET / returned HTTP 200");
  assert(root.data.status === "Online", "Server Status is Online");
  assert(root.data.modules.includes("CampusSkills"), "Metadata contains CampusSkills module");
  assert(root.data.modules.includes("CampusTasks"), "Metadata contains CampusTasks module");

  const health = await request("/api/health");
  assert(health.status === 200 && health.data.status === "healthy", "GET /api/health returned healthy");

  // 2. AUTHENTICATION & RATE LIMITING
  console.log("\n[2] Testing Authentication, OTP Verification & Rate Limiting");
  
  // Non-college email should be rejected
  const badAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "student@gmail.com" }
  });
  assert(badAuth.status === 400, "Non-college email correctly rejected with HTTP 400");

  // Valid college email should succeed
  const goodAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "anshuman.student@learner.manipal.edu" }
  });
  assert(goodAuth.status === 200, "Valid @learner.manipal.edu email accepted with HTTP 200");

  // Immediate resend should hit rate limit cooldown (60s)
  const spamAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "anshuman.student@learner.manipal.edu" }
  });
  assert(spamAuth.status === 429, "Immediate OTP resend rejected by cooldown rate-limiter (HTTP 429)");

  // Invalid OTP check
  const wrongOtp = await request("/api/auth/verify-otp", {
    method: "POST",
    body: { email: "anshuman.student@learner.manipal.edu", otp: "000000" }
  });
  assert(wrongOtp.status === 400, "Incorrect OTP rejected with error warning");

  // Valid OTP verification
  const verifyRes = await request("/api/auth/verify-otp", {
    method: "POST",
    body: { email: "anshuman.student@learner.manipal.edu", otp: "123456" }
  });
  assert(verifyRes.status === 200, "Correct OTP issued valid JWT token");
  jwtToken = verifyRes.data.token;
  assert(Boolean(jwtToken), "JWT Token extracted successfully");

  const meRes = await request("/api/auth/me");
  assert(meRes.status === 200 && meRes.data.user.email === "anshuman.student@learner.manipal.edu", "GET /api/auth/me returns authenticated user");

  // 3. CAMPUSCONNECT (COMMUNITY FEED, UPVOTES, COMMENTS)
  console.log("\n[3] Testing CampusConnect Module (Discussions, Threading, Voting)");
  const postRes = await request("/api/connect/posts", {
    method: "POST",
    body: {
      title: "Best coding clubs and open-source communities on campus?",
      content: "Looking for active tech groups working on web apps and AI projects.",
      category: "Academic",
      isAnonymous: false
    }
  });
  assert(postRes.status === 201, "POST /api/connect/posts created new post (HTTP 201)");
  createdPostId = postRes.data.id;

  const upvoteRes = await request(`/api/connect/posts/${createdPostId}/upvote`, { method: "POST" });
  assert(upvoteRes.status === 200 && upvoteRes.data.upvotes === 2, "POST /api/connect/posts/:id/upvote incremented score to 2");

  const downvoteRes = await request(`/api/connect/posts/${createdPostId}/downvote`, { method: "POST" });
  assert(downvoteRes.status === 200 && downvoteRes.data.upvotes === 1, "POST /api/connect/posts/:id/downvote decremented score back to 1");

  const commentRes = await request(`/api/connect/posts/${createdPostId}/comments`, {
    method: "POST",
    body: { content: "Join the Developer Student Club at Block B Lab 3!" }
  });
  assert(commentRes.status === 201, "POST /api/connect/posts/:id/comments added comment");

  // 4. CAMPUSBID & STUDENT MARKETPLACE
  console.log("\n[4] Testing CampusBid & Second-Hand Marketplace (Fixed Price & Auction)");
  const itemCreate = await request("/api/bid/items", {
    method: "POST",
    body: {
      title: "Concert VIP Front-Row Pass",
      description: "Original campus music festival pass.",
      startingPrice: 500,
      category: "Tickets",
      listingType: "AUCTION",
      condition: "Brand New",
      contactInfo: "test@college.edu"
    }
  });
  assert(itemCreate.status === 201, "POST /api/bid/items created auction item");
  testItemId = itemCreate.data.id;

  // Concurrent bidding race condition test
  console.log("  ⚡ Firing 2 simultaneous concurrent bids for ₹600 via Promise.all...");
  const [bidAttempt1, bidAttempt2] = await Promise.all([
    request(`/api/bid/items/${testItemId}/bid`, { method: "POST", body: { amount: 600, bidderName: "Student Alpha" } }),
    request(`/api/bid/items/${testItemId}/bid`, { method: "POST", body: { amount: 600, bidderName: "Student Beta" } })
  ]);

  const winningBids = [bidAttempt1, bidAttempt2].filter(r => r.status === 200);
  const rejectedBids = [bidAttempt1, bidAttempt2].filter(r => r.status === 409 || r.status === 400);

  assert(winningBids.length === 1, "Concurrency guard: Exactly ONE concurrent bid succeeded with HTTP 200");
  assert(rejectedBids.length === 1, "Concurrency guard: Competing bid was safely rejected with HTTP 409 Conflict");

  // Fixed Price Item listing test
  const fixedItem = await request("/api/bid/items", {
    method: "POST",
    body: {
      title: "Computer Networks Tanenbaum 5th Edition",
      description: "Clean second-hand textbook.",
      startingPrice: 300,
      category: "Books",
      listingType: "FIXED_PRICE",
      condition: "Like New",
      contactInfo: "WhatsApp: 9988776655"
    }
  });
  assert(fixedItem.status === 201 && fixedItem.data.listingType === "FIXED_PRICE", "POST /api/bid/items created fixed-price second-hand listing");

  // 5. CAMPUSSKILLS (SKILL-SHARING NETWORK)
  console.log("\n[5] Testing CampusSkills Module (Offer & Request Skills)");
  const skillsList = await request("/api/skills");
  assert(skillsList.status === 200 && Array.isArray(skillsList.data), "GET /api/skills returned skill listings");

  const skillCreate = await request("/api/skills", {
    method: "POST",
    body: {
      title: "React & Node.js Web Development Tutoring",
      description: "Learn full-stack web development, REST APIs, and deployment in 4 practical sessions.",
      category: "Tech & Coding",
      type: "OFFER",
      pricing: "₹200/hr",
      contact: "anshuman.student@college.edu | Hostel Block B"
    }
  });
  assert(skillCreate.status === 201, "POST /api/skills created skill offer (HTTP 201)");
  testSkillId = skillCreate.data.id;

  const skillGet = await request(`/api/skills/${testSkillId}`);
  assert(skillGet.status === 200 && skillGet.data.title.includes("React"), "GET /api/skills/:id retrieved created skill");

  // 6. CAMPUSTASKS (MICRO-TASKS & CAMPUS GIGS)
  console.log("\n[6] Testing CampusTasks Module (Micro-Tasks & Atomic Assignment)");
  const tasksList = await request("/api/tasks");
  assert(tasksList.status === 200 && Array.isArray(tasksList.data), "GET /api/tasks returned active task listings");

  const taskCreate = await request("/api/tasks", {
    method: "POST",
    body: {
      title: "Pick up Lab Report Printouts from Stationary Shop",
      description: "Need 20-page color printout picked from Gate 1 print shop and delivered to Hostel Block A.",
      reward: 70,
      category: "Printout & Stationary",
      pickupLocation: "Gate 1 Print Shop",
      dropLocation: "Hostel Block A Room 102",
      deadline: "Today by 5:00 PM"
    }
  });
  assert(taskCreate.status === 201, "POST /api/tasks created new micro-task with ₹70 reward");
  testTaskId = taskCreate.data.id;

  // Concurrent Task Acceptance Race Condition Test
  console.log("  ⚡ Firing 2 simultaneous concurrent task accept requests via Promise.all...");
  const [accept1, accept2] = await Promise.all([
    request(`/api/tasks/${testTaskId}/accept`, { method: "POST", body: { assignedToName: "Runner 1" } }),
    request(`/api/tasks/${testTaskId}/accept`, { method: "POST", body: { assignedToName: "Runner 2" } })
  ]);

  const winningAccepts = [accept1, accept2].filter(r => r.status === 200);
  const rejectedAccepts = [accept1, accept2].filter(r => r.status === 409 || r.status === 400);

  assert(winningAccepts.length === 1, "Concurrency guard: Exactly ONE student claimed the task");
  assert(rejectedAccepts.length === 1, "Concurrency guard: Second student was rejected with HTTP 409 (Task already assigned)");

  // Complete task test
  const completeRes = await request(`/api/tasks/${testTaskId}/complete`, { method: "POST" });
  assert(completeRes.status === 200 && completeRes.data.task.status === "COMPLETED", "POST /api/tasks/:id/complete marked task as COMPLETED");

  // 7. CAMPUSRIDE & EVENTS (CARPOOLING & OVERBOOKING GUARD)
  console.log("\n[7] Testing CampusRide Carpool & Anti-Overbooking Concurrency Guard");
  const rideCreate = await request("/api/ride/rides", {
    method: "POST",
    body: {
      origin: "Main Gate",
      destination: "Airport Terminal 1",
      departureTime: "Tomorrow 6:00 AM",
      totalSeats: 1, // Only 1 seat
      pricePerSeat: 150
    }
  });
  assert(rideCreate.status === 201 && rideCreate.data.availableSeats === 1, "POST /api/ride/rides created ride with 1 available seat");
  testRideId = rideCreate.data.id;

  console.log("  ⚡ Firing 2 simultaneous concurrent seat bookings for the last 1 seat via Promise.all...");
  const [join1, join2] = await Promise.all([
    request(`/api/ride/rides/${testRideId}/join`, { method: "POST", body: { passengerName: "Student 1", seatsCount: 1 } }),
    request(`/api/ride/rides/${testRideId}/join`, { method: "POST", body: { passengerName: "Student 2", seatsCount: 1 } })
  ]);

  const winningJoins = [join1, join2].filter(r => r.status === 200);
  const rejectedJoins = [join1, join2].filter(r => r.status === 409 || r.status === 400);

  assert(winningJoins.length === 1, "Anti-overbooking guard: Exactly ONE passenger booked the final seat");
  assert(rejectedJoins.length === 1, "Anti-overbooking guard: Second passenger safely rejected with HTTP 409");

  // 8. CAMPUSNEARBY DEALS & EVENTS
  console.log("\n[8] Testing CampusNearby Deals & Campus Events");
  const dealsRes = await request("/api/nearby/deals");
  assert(dealsRes.status === 200 && dealsRes.data.length >= 3, "GET /api/nearby/deals returned student discounts & promo codes");

  const eventsRes = await request("/api/ride/events");
  assert(eventsRes.status === 200 && Array.isArray(eventsRes.data), "GET /api/ride/events returned campus events");

  // FINAL SUMMARY
  console.log(`\n========================================================`);
  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`========================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Boot server if not already running and execute
async function main() {
  await ensureServerRunning();
  // Small pause for socket & DB init
  await new Promise(r => setTimeout(r, 500));
  await runTests();
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
