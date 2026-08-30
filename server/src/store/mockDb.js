// In-Memory Database Store for CampusSync Prototype & Development

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
    }
  ]
};
