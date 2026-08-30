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
    },
    {
      id: "u-103",
      email: "rohan.music@college.edu",
      name: "Rohan Verma",
      department: "Mechanical Engineering",
      hostel: "Block C",
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

  // Module 2: CampusBid & Student Marketplace Items
  items: [
    {
      id: "item-1",
      sellerId: "u-101",
      sellerName: "Alex Rivera",
      title: "Coldplay Campus Tour VIP Pass (Early Bird)",
      description: "Original verified e-ticket for Saturday night campus concert. Selling via auction.",
      startingPrice: 1500,
      currentBid: 2400,
      highestBidderName: "Priya S.",
      bidCount: 7,
      status: "ACTIVE",
      listingType: "AUCTION",
      condition: "Brand New",
      contactInfo: "alex.tech@college.edu | Block B Room 204",
      expiresAt: "In 3 hours",
      category: "Tickets"
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
      listingType: "AUCTION",
      condition: "Like New",
      contactInfo: "sarah.design@college.edu | Block A Room 108",
      expiresAt: "In 6 hours",
      category: "Furniture"
    },
    {
      id: "item-3",
      sellerId: "u-101",
      sellerName: "Alex Rivera",
      title: "Engineering Mathematics Textbook (8th Ed) + Handwritten Notes",
      description: "Mint condition textbook with clear notes for Calculus and Differential Equations. Fixed price direct sale.",
      startingPrice: 350,
      currentBid: 350,
      highestBidderName: "No bids yet",
      bidCount: 0,
      status: "ACTIVE",
      listingType: "FIXED_PRICE",
      condition: "Good",
      contactInfo: "alex.tech@college.edu | WhatsApp: +91-9876543210",
      expiresAt: "Available",
      category: "Books"
    },
    {
      id: "item-4",
      sellerId: "u-103",
      sellerName: "Rohan Verma",
      title: "Logitech MX Master 3S Wireless Mouse (Graphite)",
      description: "Works flawlessly. Comes with USB-C cable and original box. Great for coding and editing.",
      startingPrice: 3200,
      currentBid: 3200,
      highestBidderName: "No bids yet",
      bidCount: 0,
      status: "ACTIVE",
      listingType: "FIXED_PRICE",
      condition: "Like New",
      contactInfo: "rohan.music@college.edu | Block C Room 312",
      expiresAt: "Available",
      category: "Electronics"
    }
  ],

  // Module 3: Skill-Sharing Network (Offer & Request)
  skills: [
    {
      id: "skill-1",
      userId: "u-101",
      userName: "Alex Rivera",
      userDepartment: "Computer Science",
      userHostel: "Block B",
      title: "Data Structures, Algorithms & LeetCode Prep Tutoring",
      description: "Cracked Google & Microsoft intern interviews. Offering 1-on-1 coaching in Dynamic Programming, Graphs, and System Design basics.",
      category: "Tech & Coding",
      type: "OFFER",
      pricing: "₹250/hr",
      contact: "alex.tech@college.edu | Discord: alex_dev#4021",
      createdAt: new Date().toISOString()
    },
    {
      id: "skill-2",
      userId: "u-102",
      userName: "Sarah Chen",
      userDepartment: "Design & Media",
      userHostel: "Block A",
      title: "Figma UI/UX Design & Portfolio Review",
      description: "Experienced freelance designer. I can teach you Figma design systems, mobile app wireframing, or give detailed critiques on your portfolio.",
      category: "Design & Media",
      type: "OFFER",
      pricing: "Free Peer Exchange / ₹200/session",
      contact: "sarah.design@college.edu | Instagram: @sarah_creatives",
      createdAt: new Date().toISOString()
    },
    {
      id: "skill-3",
      userId: "u-103",
      userName: "Rohan Verma",
      userDepartment: "Mechanical Engineering",
      userHostel: "Block C",
      title: "Acoustic & Electric Guitar Lessons (Beginner to Intermediate)",
      description: "Lead guitarist of Campus Rock Band. Learn chords, fingerstyle, tabs, and solo improvisation.",
      category: "Music & Arts",
      type: "OFFER",
      pricing: "₹150/lesson (45 mins)",
      contact: "rohan.music@college.edu | WhatsApp: +91-9988776655",
      createdAt: new Date().toISOString()
    },
    {
      id: "skill-4",
      userId: "u-102",
      userName: "Sarah Chen",
      userDepartment: "Design & Media",
      userHostel: "Block A",
      title: "Need help with Python Data Science assignment & NumPy",
      description: "Looking for a 2-hour tutoring session to understand Pandas dataframes and Matplotlib plotting before Friday's lab submission.",
      category: "Tech & Coding",
      type: "REQUEST",
      pricing: "Offering ₹300 or free UI design help in return",
      contact: "sarah.design@college.edu | Block A Room 108",
      createdAt: new Date().toISOString()
    }
  ],

  // Module 4: Micro-Task Marketplace (Campus Gigs & Errands)
  tasks: [
    {
      id: "task-1",
      creatorId: "u-102",
      creatorName: "Sarah Chen",
      creatorHostel: "Block A",
      title: "Collect 50-page Spiral Binding Printout from Central Library",
      description: "PDF is already sent to the print shop. Just need someone to collect the spiral bound copy and drop it off at Block A security desk.",
      reward: 80,
      category: "Printout & Stationary",
      pickupLocation: "Central Library Print Counter",
      dropLocation: "Hostel Block A Front Desk",
      status: "OPEN",
      assignedToId: null,
      assignedToName: null,
      deadline: "Today before 6:00 PM",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-2",
      creatorId: "u-101",
      creatorName: "Alex Rivera",
      creatorHostel: "Block B",
      title: "Heavy Luggage & Study Desk Shift to 3rd Floor",
      description: "Need help carrying a study desk and 2 heavy suitcases from ground floor lobby to Room 304.",
      reward: 200,
      category: "Luggage & Moving",
      pickupLocation: "Block B Ground Lobby",
      dropLocation: "Block B Room 304",
      status: "OPEN",
      assignedToId: null,
      assignedToName: null,
      deadline: "Tomorrow morning 10:00 AM",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-3",
      creatorId: "u-103",
      creatorName: "Rohan Verma",
      creatorHostel: "Block C",
      title: "Pick up Amazon parcel from Main Campus Gate",
      description: "Delivery OTP will be shared. Urgent medicine/electronics parcel.",
      reward: 60,
      category: "Courier & Parcel",
      pickupLocation: "Main Security Gate",
      dropLocation: "Block C Room 312",
      status: "ASSIGNED",
      assignedToId: "u-101",
      assignedToName: "Alex Rivera",
      deadline: "Within 1 hour",
      createdAt: new Date().toISOString()
    }
  ],

  // Module 5: CampusRide & Events
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
      passengers: ["Priya S.", "David K."],
      createdAt: new Date().toISOString()
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
      passengers: ["Kabir T.", "Ananya P."],
      createdAt: new Date().toISOString()
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
      category: "Tech & Innovation",
      createdAt: new Date().toISOString()
    }
  ],

  // Module 6: CampusNearby Deals & Discounts
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
      title: "10% Student Discount on Laptops & Accessories",
      businessName: "Campus Tech Store",
      isPartner: true,
      discountPercent: 10,
      code: "STUDENT10",
      category: "Electronics",
      distance: "Academic Block 1 Ground Floor",
      validUntil: "Valid throughout semester"
    }
  ]
};
