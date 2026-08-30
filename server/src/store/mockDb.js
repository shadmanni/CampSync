// In-Memory Database Store for CampusSync Prototype & Development

/** Auction deadlines are relative to boot so countdowns are always live. */
const hoursFromNow = (n) => new Date(Date.now() + n * 3600 * 1000).toISOString();

export const mockDb = {
  users: [
    {
      id: "u-101",
      email: "alex.tech@college.edu",
      name: "Alex Rivera",
      department: "Computer Science",
      hostel: "Block B",
      isVerified: true
    },
    {
      id: "u-102",
      email: "sarah.design@college.edu",
      name: "Sarah Chen",
      department: "Design & Media",
      hostel: "Block A",
      isVerified: true
    }
  ],

  // Module 1: CampusConnect Posts
  posts: [
    {
      id: "post-1",
      authorId: "u-101",
      authorName: "Alex Rivera",
      isAnonymous: false,
      title: "Best resources for Advanced Algorithms midterm next week?",
      content: "Does anyone have past year question banks or summary slides for Graph Theory & Dynamic Programming? Happy to share my project notes in return!",
      category: "Academic",
      upvotes: 24,
      comments: [
        { id: "c-1", authorName: "Prof. Miller", content: "Check the course drive under Unit 3 archive.", createdAt: "2 hours ago" },
        { id: "c-2", authorName: "Anonymous Student", content: "Sent you a DM with the GitHub repo link!", createdAt: "1 hour ago" }
      ],
      createdAt: "4 hours ago"
    },
    {
      id: "post-2",
      authorId: "u-102",
      authorName: "Confessed Student",
      isAnonymous: true,
      title: "Lost Sony Noise Cancelling Headphones in Central Library 2nd Floor",
      content: "Left black WH-1000XM4 headphones on table #14 near the silent reading area around 3 PM today. Please reach out if submitted to lost & found!",
      category: "Lost & Found",
      upvotes: 18,
      comments: [
        { id: "c-3", authorName: "Library Guard", content: "A pair was deposited at the main desk at 4:30 PM. Bring student ID to claim.", createdAt: "30 mins ago" }
      ],
      createdAt: "5 hours ago"
    },
    {
      id: "post-3",
      authorId: "u-102",
      authorName: "Meera Raghavan",
      isAnonymous: false,
      title: "Mess menu poll: should Thursday dinner rotate weekly?",
      content: "The Block C mess committee is collecting opinions before the Friday meeting. Drop a comment with your preference and your block.",
      category: "General",
      tag: "Block C",
      upvotes: 67,
      comments: [
        { id: "c-4", authorName: "Rohit Kulkarni", content: "Rotate it. Same paneer every Thursday for two years now.", createdAt: "3 hours ago" }
      ],
      createdAt: "7 hours ago"
    },
    {
      id: "post-4",
      authorId: "u-101",
      authorName: "Alex Rivera",
      isAnonymous: true,
      title: "Genuinely struggling with placement season anxiety",
      content: "Everyone around me seems to have it figured out. If anyone else feels behind, you are not alone, and the counselling centre Wednesday slot actually helped me.",
      category: "Confessions",
      tag: "Anonymous",
      upvotes: 132,
      comments: [
        { id: "c-5", authorName: "Anonymous Student", content: "Needed to read this today. Thank you for posting it.", createdAt: "1 hour ago" }
      ],
      createdAt: "9 hours ago"
    },
    {
      id: "post-5",
      authorId: "u-102",
      authorName: "Rohit Kulkarni",
      isAnonymous: false,
      title: "Free seat in the ECE study group, Fridays 6 PM, Room 214",
      content: "We work through the previous week problem set together. Open to any year, no commitment, just show up.",
      category: "Academic",
      tag: "ECE Dept",
      upvotes: 29,
      comments: [],
      createdAt: "11 hours ago"
    },
    {
      id: "post-6",
      authorId: "u-101",
      authorName: "Kabir Thakur",
      isAnonymous: false,
      title: "Wi-Fi in Block D has been dropping every evening after 9 PM",
      content: "Raised a ticket four days ago, no response yet. If it is happening in your block too, comment so we can escalate it together.",
      category: "General",
      tag: "Block D",
      upvotes: 88,
      comments: [
        { id: "c-6", authorName: "Ananya Pillai", content: "Same in Block B. Filed a ticket on Monday.", createdAt: "6 hours ago" }
      ],
      createdAt: "1 day ago"
    }
  ],

  // Module 2: CampusBid Marketplace Items
  items: [
    {
      id: "item-1",
      sellerId: "u-101",
      sellerName: "Alex Rivera",
      title: "Engineering Mathematics Textbook (8th Ed) + Formula Chart",
      description: "Mint condition, minimal pencil highlights. Includes bonus handwritten formula summary sheets.",
      startingPrice: 400,
      currentBid: 650,
      highestBidderName: "Priya S.",
      bidCount: 5,
      status: "ACTIVE",
      expiresAt: "In 3 hours",
      category: "Books"
    },
    {
      id: "item-2",
      sellerId: "u-102",
      sellerName: "Sarah Chen",
      title: "Ergonomic Mesh Study Chair (Adjustable Height)",
      description: "Used for 1 semester. Very comfortable for long study sessions. Pickup from Hostel Block A.",
      startingPrice: 1200,
      currentBid: 1850,
      highestBidderName: "Rohan M.",
      bidCount: 8,
      status: "ACTIVE",
      expiresAt: "In 6 hours",
      category: "Furniture"
    },
    {
      id: "item-3",
      sellerId: "u-102",
      sellerName: "Devika Nair",
      title: "Casio FX-991EX Scientific Calculator",
      description: "Exam-approved model. Battery replaced last month, original slip case included.",
      startingPrice: 600,
      currentBid: 780,
      highestBidderName: "Imran Q.",
      bidCount: 3,
      status: "ACTIVE",
      expiresAt: "In 1 hour",
      endsAt: hoursFromNow(1),
      category: "Electronics"
    },
    {
      id: "item-4",
      sellerId: "u-101",
      sellerName: "Karthik Menon",
      title: "Hercules Roadeo Cycle, Recently Serviced",
      description: "Both tyres new, gears tuned last week. Selling because I am graduating this semester.",
      startingPrice: 3000,
      currentBid: 4400,
      highestBidderName: "Sana B.",
      bidCount: 12,
      status: "ACTIVE",
      expiresAt: "In 20 hours",
      endsAt: hoursFromNow(20),
      category: "Transport"
    },
    {
      id: "item-5",
      sellerId: "u-102",
      sellerName: "Ananya Pillai",
      title: "Drafting Kit + A2 Drawing Board",
      description: "First-year engineering graphics set. Board has one small dent on a corner, otherwise fine.",
      startingPrice: 500,
      currentBid: 500,
      highestBidderName: "No bids yet",
      bidCount: 0,
      status: "ACTIVE",
      expiresAt: "In 30 hours",
      endsAt: hoursFromNow(30),
      category: "Other"
    },
    {
      id: "item-6",
      sellerId: "u-101",
      sellerName: "Imran Qureshi",
      title: "Mini Fridge, 45 L, Hostel Legal",
      description: "Runs quiet, cleaned and defrosted. Collect from Block C before the 20th.",
      startingPrice: 2200,
      currentBid: 2950,
      highestBidderName: "Meera R.",
      bidCount: 6,
      status: "ACTIVE",
      expiresAt: "In 12 hours",
      endsAt: hoursFromNow(12),
      category: "Electronics"
    }
  ],

  // Module 3: CampusRide & Events
  rides: [
    {
      id: "ride-1",
      driverId: "u-101",
      driverName: "Alex Rivera",
      origin: "Main Campus Gate",
      destination: "City Center Metro Station",
      departureTime: "Today at 5:30 PM",
      totalSeats: 4,
      availableSeats: 2,
      pricePerSeat: 80,
      passengers: ["Priya S.", "David K."]
    },
    {
      id: "ride-2",
      driverId: "u-102",
      driverName: "Sarah Chen",
      origin: "North Hostel Complex",
      destination: "Airport Terminal 2",
      departureTime: "Tomorrow at 7:00 AM",
      totalSeats: 3,
      availableSeats: 1,
      pricePerSeat: 250,
      passengers: ["Kabir T.", "Ananya P."]
    },
    {
      id: "ride-3",
      driverId: "u-101",
      driverName: "Vikram Desai",
      origin: "Block C Parking",
      destination: "Railway Junction",
      departureTime: "Friday at 4:15 PM",
      totalSeats: 4,
      availableSeats: 4,
      pricePerSeat: 120,
      passengers: []
    },
    {
      id: "ride-4",
      driverId: "u-102",
      driverName: "Neha Iyer",
      origin: "Main Campus Gate",
      destination: "Phoenix Mall",
      departureTime: "Saturday at 11:00 AM",
      totalSeats: 3,
      availableSeats: 2,
      pricePerSeat: 60,
      passengers: ["Rohit K."]
    }
  ],

  events: [
    {
      id: "event-1",
      title: "Hackathon 2026 Pitch Night & Mixer",
      description: "Join us at the Innovation Lab! Showcase project ideas, find teammates, and grab free pizza.",
      venue: "Auditorium Hall B",
      dateTime: "Friday, 6:00 PM",
      attendeesCount: 86,
      category: "Tech & Innovation"
    },
    {
      id: "event-2",
      title: "Inter-Hostel Football Final",
      description: "Block B vs Block D. Bring your block colours and something to shout with.",
      venue: "Main Ground",
      dateTime: "Saturday, 4:30 PM",
      attendeesCount: 240,
      category: "Sports"
    },
    {
      id: "event-3",
      title: "Open Mic and Acoustic Night",
      description: "Fifteen slots, first come first served. Sign-up sheet goes in the comments.",
      venue: "Amphitheatre",
      dateTime: "Sunday, 7:00 PM",
      attendeesCount: 118,
      category: "Culture"
    },
    {
      id: "event-4",
      title: "Resume Clinic with the Placement Cell",
      description: "Bring a printed copy. Twenty-minute one-on-one reviews, walk-ins welcome.",
      venue: "Seminar Room 3",
      dateTime: "Wednesday, 2:00 PM",
      attendeesCount: 54,
      category: "Career"
    }
  ],

  // Module 4: CampusNearby Deals
  deals: [
    {
      id: "deal-1",
      title: "Flat 20% OFF on all Coffee & Meal Combos",
      businessName: "Campus Bistro & Cafe",
      isPartner: true,
      discountPercent: 20,
      code: "CAMPUS20",
      category: "Food & Drinks",
      distance: "0.2 km from Main Library",
      validUntil: "Valid till end of month"
    },
    {
      id: "deal-2",
      title: "Student Discount: 15% OFF Printing & Binding",
      businessName: "TechPrint Hub",
      isPartner: true,
      discountPercent: 15,
      code: "PRINT15",
      category: "Services",
      distance: "Opposite Hostel Gate 2",
      validUntil: "Valid every day"
    },
    {
      id: "deal-3",
      title: "Buy One Get One on Filter Coffee before 10 AM",
      businessName: "Sunrise Tea Stall",
      isPartner: false,
      discountPercent: 50,
      code: "EARLYBIRD",
      category: "Food & Drinks",
      distance: "400 m, near Gate 3",
      validUntil: "Weekdays only"
    },
    {
      id: "deal-4",
      title: "Half Price on your First Month of Membership",
      businessName: "Iron Yard Fitness",
      isPartner: true,
      discountPercent: 50,
      code: "FRESHSTART",
      category: "Fitness",
      distance: "1.1 km from North Gate",
      validUntil: "New members only"
    },
    {
      id: "deal-5",
      title: "25% OFF Haircuts on production of a Student ID",
      businessName: "The Barber Room",
      isPartner: false,
      discountPercent: 25,
      code: "STUDENT25",
      category: "Services",
      distance: "700 m, Market Road",
      validUntil: "Mon to Thu"
    },
    {
      id: "deal-6",
      title: "Free Delivery to Hostel Gates on orders over Rs 199",
      businessName: "Green Bowl Kitchen",
      isPartner: true,
      discountPercent: 10,
      code: "HOSTELFREE",
      category: "Food & Drinks",
      distance: "1.4 km, delivers to campus",
      validUntil: "Till 31 December"
    }
  ]
};
