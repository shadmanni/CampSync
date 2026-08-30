/**
 * Comprehensive Automated API & Concurrency Test Suite for CampusSync Server
 * Tests all REST endpoints, Rate-Limiting, Downvotes, and Race Condition Concurrency Guards.
 */

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000";

let jwtToken = "";
let createdPostId = "";
let testItemId = "";
let testRideId = "";

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

async function runTests() {
  console.log(`\n🧪 ========================================================`);
  console.log(`   RUNNING CAMPUSSYNC BACKEND & CONCURRENCY TEST SUITE`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`========================================================\n`);

  // 1. HEALTH CHECK
  console.log("[1] Testing Health Endpoint");
  const health = await request("/");
  assert(health.status === 200, "GET / returned HTTP 200");
  assert(health.data.status === "Online", "Status is Online");

  // 2. AUTHENTICATION & RATE LIMITING
  console.log("\n[2] Testing Authentication, Email Verification & Lockout Protection");
  
  // Non-college email should be rejected
  const badAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "user@gmail.com" }
  });
  assert(badAuth.status === 400, "Non-college email correctly rejected with HTTP 400");

  // Valid college email should succeed
  const goodAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "test.student@college.edu" }
  });
  assert(goodAuth.status === 200, "Valid @college.edu email accepted with HTTP 200");

  // Immediate resend should hit rate limit cooldown
  const spamAuth = await request("/api/auth/request-otp", {
    method: "POST",
    body: { email: "test.student@college.edu" }
  });
  assert(spamAuth.status === 429, "Immediate resend rejected by OTP cooldown rate-limiter (HTTP 429)");

  // Wrong OTP attempt
  const wrongOtp = await request("/api/auth/verify-otp", {
    method: "POST",
    body: { email: "test.student@college.edu", otp: "000000" }
  });
  assert(wrongOtp.status === 400, "Incorrect OTP rejected with attempts remaining warning");

  // Valid OTP verification
  const verifyRes = await request("/api/auth/verify-otp", {
    method: "POST",
    body: { email: "test.student@college.edu", otp: "123456" }
  });
  assert(verifyRes.status === 200, "Correct OTP issued valid JWT token");
  jwtToken = verifyRes.data.token;
  assert(Boolean(jwtToken), "JWT Token extracted successfully");

  // Test authenticated /me endpoint
  const meRes = await request("/api/auth/me");
  assert(meRes.status === 200 && meRes.data.user.email === "test.student@college.edu", "GET /api/auth/me returns authenticated user profile");

  // 3. CAMPUSCONNECT (POSTS, COMMENTS, UPVOTES & DOWNVOTES)
  console.log("\n[3] Testing CampusConnect Module (Posts, Comments, Upvote/Downvote)");
  const postRes = await request("/api/connect/posts", {
    method: "POST",
    body: {
      title: "Automated Integration Test Post",
      content: "Verifying backend discussions, threading, and voting counters.",
      category: "Academic",
      isAnonymous: false
    }
  });
  assert(postRes.status === 201, "POST /api/connect/posts created new post (HTTP 201)");
  createdPostId = postRes.data.id;

  // Upvote test
  const upvoteRes = await request(`/api/connect/posts/${createdPostId}/upvote`, { method: "POST" });
  assert(upvoteRes.status === 200 && upvoteRes.data.upvotes === 2, "POST /api/connect/posts/:id/upvote incremented score to 2");

  // Downvote test (Requirement 4)
  const downvoteRes = await request(`/api/connect/posts/${createdPostId}/downvote`, { method: "POST" });
  assert(downvoteRes.status === 200 && downvoteRes.data.upvotes === 1, "POST /api/connect/posts/:id/downvote decremented score back to 1");

  // Comment test
  const commentRes = await request(`/api/connect/posts/${createdPostId}/comments`, {
    method: "POST",
    body: { content: "Great test discussion!" }
  });
  assert(commentRes.status === 201, "POST /api/connect/posts/:id/comments added threaded comment");

  // 4. CAMPUSBID MARKETPLACE & CONCURRENCY RACE CONDITION TEST
  console.log("\n[4] Testing CampusBid Marketplace & Atomic Concurrency Guard (Requirement 1 & 5)");
  const itemCreate = await request("/api/bid/items", {
    method: "POST",
    body: {
      title: "TI-84 Graphing Calculator",
      description: "Mint condition calculator for engineering courses.",
      startingPrice: 500,
      category: "Electronics"
    }
  });
  assert(itemCreate.status === 201, "POST /api/bid/items created auction item with starting bid ₹500");
  testItemId = itemCreate.data.id;

  // CONCURRENT RACE CONDITION TEST: Two students bid ₹600 simultaneously
  console.log("  ⚡ Firing 2 simultaneous concurrent bids for ₹600 via Promise.all...");
  const [bidAttempt1, bidAttempt2] = await Promise.all([
    request(`/api/bid/items/${testItemId}/bid`, { method: "POST", body: { amount: 600, bidderName: "Student Alpha" } }),
    request(`/api/bid/items/${testItemId}/bid`, { method: "POST", body: { amount: 600, bidderName: "Student Beta" } })
  ]);

  const winningBids = [bidAttempt1, bidAttempt2].filter(r => r.status === 200);
  const rejectedBids = [bidAttempt1, bidAttempt2].filter(r => r.status === 409 || r.status === 400);

  assert(winningBids.length === 1, "Exactly ONE concurrent bid succeeded with HTTP 200");
  assert(rejectedBids.length === 1, "The competing concurrent bid was rejected with HTTP 409 Conflict");
  console.log(`     Winning Bidder: ${winningBids[0].data.highestBidderName} | Current Bid: ₹${winningBids[0].data.currentBid}`);

  // Lower bid attempt rejection
  const lowerBid = await request(`/api/bid/items/${testItemId}/bid`, {
    method: "POST",
    body: { amount: 550, bidderName: "Late Student" }
  });
  assert(lowerBid.status === 409 || lowerBid.status === 400, "Under-bid lower than current bid properly rejected");

  // 5. CAMPUSRIDE CARPOOL & CONCURRENT OVERBOOKING TEST
  console.log("\n[5] Testing CampusRide Carpool & Concurrent Overbooking Guard (Requirement 1 & 5)");
  const rideCreate = await request("/api/ride/rides", {
    method: "POST",
    body: {
      origin: "Library Gate",
      destination: "Railway Station",
      departureTime: "8:00 PM",
      totalSeats: 1, // Only 1 seat left!
      pricePerSeat: 40
    }
  });
  assert(rideCreate.status === 201 && rideCreate.data.availableSeats === 1, "POST /api/ride/rides created carpool with only 1 available seat");
  testRideId = rideCreate.data.id;

  // CONCURRENT RACE CONDITION TEST: Two students try to book the last remaining seat at the exact same instant
  console.log("  ⚡ Firing 2 simultaneous concurrent ride bookings for the last 1 seat via Promise.all...");
  const [joinAttempt1, joinAttempt2] = await Promise.all([
    request(`/api/ride/rides/${testRideId}/join`, { method: "POST", body: { passengerName: "Passenger Alpha", seatsCount: 1 } }),
    request(`/api/ride/rides/${testRideId}/join`, { method: "POST", body: { passengerName: "Passenger Beta", seatsCount: 1 } })
  ]);

  const winningJoins = [joinAttempt1, joinAttempt2].filter(r => r.status === 200);
  const rejectedJoins = [joinAttempt1, joinAttempt2].filter(r => r.status === 409 || r.status === 400);

  assert(winningJoins.length === 1, "Exactly ONE passenger booked the final seat");
  assert(rejectedJoins.length === 1, "Overbooking prevented: second passenger was safely rejected with HTTP 409");

  // 6. CAMPUSNEARBY & EVENTS
  console.log("\n[6] Testing CampusNearby & Events");
  const dealsRes = await request("/api/nearby/deals");
  assert(dealsRes.status === 200 && Array.isArray(dealsRes.data), "GET /api/nearby/deals returned active partner discounts");

  const eventsRes = await request("/api/ride/events");
  assert(eventsRes.status === 200 && Array.isArray(eventsRes.data), "GET /api/ride/events returned campus events");

  // SUMMARY REPORT
  console.log(`\n========================================================`);
  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`========================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
