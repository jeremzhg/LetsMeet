
export const organizationsData = [
  {
    name: "Summit Planners International",
    email: "contact@summitplanners.com",
    hashedPassword: "password123",
    details: "A world-renowned organization specializing in global tech and business summits."
  },
  {
    name: "Global Tech Exhibitions",
    email: "info@techxpo.org",
    hashedPassword: "password123",
    details: "Hosting the largest technology and innovation exhibitions worldwide."
  },
  {
    name: "EcoFuture Conferences",
    email: "hello@ecofuture.net",
    hashedPassword: "password123",
    details: "Dedicated to organizing events focused on sustainability and green energy."
  }
];

export const corporationsData = [
  // Tech & Software
  { name: "NovaTech Solutions", email: "contact@novatech.com", details: "Pioneering AI-driven cloud solutions for modern enterprises.", category: "Tech" },
  { name: "Quantum Computing Inc.", email: "info@quantumci.com", details: "Developing next-generation quantum hardware.", category: "Tech" },

  // Finance & Banking
  { name: "Aria Financial Group", email: "contact@ariafinance.com", details: "International investment banking and wealth management.", category: "Finance" },
  { name: "NextGen Capital", email: "invest@nextgen.vc", details: "Venture capital firm focused on early-stage startups.", category: "Finance" },

  // Healthcare & BioTech
  { name: "MediCore Healthcare", email: "contact@medicore.com", details: "Leading provider of hospital equipment and medical devices.", category: "Healthcare" },
  { name: "BioGenix Labs", email: "research@biogenix.com", details: "Advanced gene therapy and pharmaceutical research.", category: "Healthcare" },

  // Education
  { name: "EduSpark Learning", email: "contact@eduspark.edu", details: "E-learning platforms and interactive courses.", category: "Education" },
  { name: "Global Scholar Alliance", email: "info@globalscholar.org", details: "Connecting universities with international students.", category: "Education" },
  
  // Gaming & Entertainment
  { name: "PixelForge Studios", email: "press@pixelforge.com", details: "AAA game development studio.", category: "Gaming" },
  { name: "Esports Arena Global", email: "contact@esportsarena.gg", details: "Organizer of major esports tournaments.", category: "Gaming" },

  // Retail & Consumer
  { name: "Urban Lifestyle Group", email: "contact@urbanlifestyle.com", details: "Fashion, apparel, and lifestyle brands.", category: "Retail" },
  { name: "FreshMart Groceries", email: "info@freshmart.com", details: "National chain of organic grocery stores.", category: "Retail" },

  // Energy & Environment
  { name: "Solaris Energy", email: "contact@solarisenergy.com", details: "Manufacturer of high-efficiency solar panels.", category: "Energy" },
  { name: "WindPower Dynamics", email: "info@windpower.com", details: "Offshore wind farm construction and maintenance.", category: "Energy" },

  // Automotive & Logistics
  { name: "AeroDyne Motors", email: "contact@aerodyne.com", details: "Electric vehicle manufacturer and autonomous driving tech.", category: "Automotive" },
  { name: "Global Freight Systems", email: "info@globalfreight.com", details: "International shipping and supply chain management.", category: "Logistics" },

  // Real Estate
  { name: "Skyline Properties", email: "contact@skyline.com", details: "Commercial real estate development and management.", category: "Real Estate" },
  { name: "Urban Living Spaces", email: "info@urbanliving.com", details: "Luxury residential developments in metropolitan areas.", category: "Real Estate" },
].map(c => ({ ...c, hashedPassword: "password123", isClaimed: Math.random() > 0.5 }));

export const eventsData = [
  // Tech & Startups
  { title: "Global AI Summit 2025", details: "The largest gathering of artificial intelligence researchers and industry leaders to discuss the future of AGI and machine learning.", country: "USA", city: "San Francisco", expectedParticipants: 5000 },
  { title: "Web3 & Crypto Expo", details: "Exploring the latest trends in decentralized finance, blockchain technology, and digital assets.", country: "UAE", city: "Dubai", expectedParticipants: 3500 },
  { title: "Cyber Security World Conference", details: "Top-tier professionals discussing the evolving landscape of cyber threats and defense mechanisms.", country: "UK", city: "London", expectedParticipants: 4000 },
  { title: "SaaS Founders Masterclass", details: "Exclusive network event for software-as-a-service entrepreneurs seeking scaling strategies.", country: "Canada", city: "Toronto", expectedParticipants: 800 },
  { title: "Data Science Forum", details: "Deep dive into big data analytics, predictive modeling, and data engineering.", country: "Germany", city: "Berlin", expectedParticipants: 2000 },

  // Finance & Business
  { title: "Future of Fintech & Banking", details: "How digital transformation is reshaping traditional banking and retail investing.", country: "Singapore", city: "Singapore", expectedParticipants: 3000 },
  { title: "Venture Capital Symposium", details: "Connecting early-stage startups with global investors and VC funds.", country: "USA", city: "New York", expectedParticipants: 1500 },
  { title: "Global Economic Forum 2024", details: "Macroeconomic trends, international trade policies, and global market outlook.", country: "Switzerland", city: "Zurich", expectedParticipants: 2500 },
  { title: "Real Estate Investment Expo", details: "Showcasing prime global properties and investment opportunities to high-net-worth individuals.", country: "Australia", city: "Sydney", expectedParticipants: 1200 },

  // Healthcare & Science
  { title: "International Medical Congress", details: "Presenting the latest breakthroughs in medical science, pharmaceuticals, and patient care.", country: "France", city: "Paris", expectedParticipants: 4500 },
  { title: "BioTech Innovations Forum", details: "Genomics, customized medicine, and the future of healthcare technology.", country: "USA", city: "Boston", expectedParticipants: 2200 },
  { title: "Global Health Challenge", details: "Addressing disparities in global healthcare access and pandemic preparedness.", country: "South Africa", city: "Cape Town", expectedParticipants: 1800 },

  // Environment & Energy
  { title: "Renewable Energy Summit", details: "Innovations in solar, wind, and alternative energy sources.", country: "Denmark", city: "Copenhagen", expectedParticipants: 3000 },
  { title: "Climate Action Global Pact", details: "Leaders formulating actionable strategies for reducing global carbon emissions.", country: "Norway", city: "Oslo", expectedParticipants: 2000 },
  { title: "Green Automotives Expo", details: "The future of electric vehicles, battery tech, and autonomous driving.", country: "Japan", city: "Tokyo", expectedParticipants: 3800 },

  // Gaming, Media & Entertainment
  { title: "Esports World Championship", details: "The final showdown of top esports teams competing across multiple game titles.", country: "South Korea", city: "Seoul", expectedParticipants: 10000 },
  { title: "Digital Arts & Creators Fair", details: "A celebration of digital artistry, animation, streaming, and content creation.", country: "USA", city: "Los Angeles", expectedParticipants: 6000 },
  { title: "GameDev Connect", details: "Workshops, panels, and networking for indie and AAA game developers.", country: "Sweden", city: "Stockholm", expectedParticipants: 2500 },

  // Retail & E-commerce
  { title: "E-Commerce Logistics Conference", details: "Optimizing supply chain, warehouse management, and last-mile delivery.", country: "Netherlands", city: "Amsterdam", expectedParticipants: 1800 },
  { title: "Future of Retail Expo", details: "Showcasing innovations in omnichannel retail and consumer behavior tracking.", country: "UK", city: "Manchester", expectedParticipants: 2200 },

  // Education & Learning
  { title: "EdTech Global", details: "Digital tools shaping modern classrooms and continuing education.", country: "India", city: "Bengaluru", expectedParticipants: 4000 },
  { title: "International Universities Fair", details: "Connecting prospective students with leading global educational institutions.", country: "Brazil", city: "São Paulo", expectedParticipants: 5000 }
].map(e => ({
  ...e,
  status: 'completed',
  date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // random past date
}));

export const packagesData = [
  { title: "Platinum Title Sponsor", cost: 50000, details: "Premium branding across all stages, VIP lounge access, and opening keynote spot." },
  { title: "Gold Exhibition Partner", cost: 25000, details: "Prime booth location, logo on all marketing materials, and 10 VIP passes." },
  { title: "Silver Networking Sponsor", cost: 10000, details: "Branding at networking dinners, standard booth, and 5 basic passes." },
  { title: "Bronze Lanyard Sponsor", cost: 5000, details: "Company logo present on all attendee lanyards and badges." },
  { title: "Digital Marketing Partner", cost: 2500, details: "Logo placement on the event website and dedicated email blast." }
];
