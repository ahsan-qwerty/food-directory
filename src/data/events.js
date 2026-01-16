// Events and Exhibitions data

export const events = [
  {
    id: 1,
    name: 'Pakistan Food & Hospitality Expo 2026',
    slug: 'pakistan-food-hospitality-expo-2026',
    location: 'Expo Centre, Karachi',
    date: '2026-03-15 to 2026-03-17',
    start_date: '2026-03-15',
    end_date: '2026-03-17',
    description: 'The Pakistan Food & Hospitality Expo is the country\'s largest trade fair dedicated to the food and beverage industry. This year\'s event will showcase the finest Pakistani food products and connect local manufacturers with international buyers. The expo features live demonstrations, networking sessions, and business matching opportunities.',
    participatingCompanyIds: [1, 2, 3, 5, 7, 8],
    image: '/events/expo-2026.jpg',
    highlights: [
      'Over 200 exhibitors from across Pakistan',
      'International buyer delegations from 30+ countries',
      'Live cooking demonstrations by celebrity chefs',
      'B2B matchmaking sessions',
      'Export opportunity seminars'
    ]
  },
  {
    id: 2,
    name: 'International Rice Conference 2026',
    slug: 'international-rice-conference-2026',
    location: 'Pearl Continental Hotel, Lahore',
    date: '2026-04-20 to 2026-04-22',
    start_date: '2026-04-20',
    end_date: '2026-04-22',
    description: 'An exclusive conference bringing together rice exporters, traders, and international buyers. This three-day event focuses on Pakistan\'s Basmati and Non-Basmati rice varieties, quality standards, export procedures, and market trends. Participants will have the opportunity to establish direct business relationships and explore export opportunities.',
    participatingCompanyIds: [1, 5],
    image: '/events/rice-conference.jpg',
    highlights: [
      'Focus on Pakistani Basmati excellence',
      'Export market analysis and trends',
      'Quality certification workshops',
      'Direct buyer-seller meetings',
      'Government export incentive briefings'
    ]
  },
  {
    id: 3,
    name: 'Organic & Healthy Foods Summit 2026',
    slug: 'organic-healthy-foods-summit-2026',
    location: 'Serena Hotel, Islamabad',
    date: '2026-05-10 to 2026-05-11',
    start_date: '2026-05-10',
    end_date: '2026-05-11',
    description: 'A premier summit dedicated to organic farming, healthy food products, and sustainable agriculture practices in Pakistan. This event brings together organic food producers, certification bodies, retailers, and health-conscious consumers to promote organic food production and consumption in Pakistan.',
    participatingCompanyIds: [2, 3, 4],
    image: '/events/organic-summit.jpg',
    highlights: [
      'Organic certification guidance',
      'Sustainable farming practices',
      'Health and nutrition seminars',
      'Organic product showcase',
      'Export opportunities for organic products'
    ]
  },
  {
    id: 4,
    name: 'Seafood & Fisheries Expo 2026',
    slug: 'seafood-fisheries-expo-2026',
    location: 'Port Grand, Karachi',
    date: '2026-06-05 to 2026-06-07',
    start_date: '2026-06-05',
    end_date: '2026-06-07',
    description: 'Pakistan\'s premier seafood trade exhibition featuring fresh and frozen seafood products, processing equipment, and cold chain solutions. The expo connects Pakistani seafood exporters with international buyers and provides insights into global seafood market trends and quality requirements.',
    participatingCompanyIds: [6],
    image: '/events/seafood-expo.jpg',
    highlights: [
      'Fresh & frozen seafood displays',
      'EU export compliance workshops',
      'Cold chain technology demonstrations',
      'International buyer meetings',
      'Sustainable fishing practices seminars'
    ]
  },
  {
    id: 5,
    name: 'Bakery & Confectionery Trade Fair 2026',
    slug: 'bakery-confectionery-fair-2026',
    location: 'Packages Mall Convention Center, Lahore',
    date: '2026-07-15 to 2026-07-16',
    start_date: '2026-07-15',
    end_date: '2026-07-16',
    description: 'A specialized trade fair for bakery and confectionery products, featuring the latest trends in baked goods, confectionery, and food service equipment. This event is ideal for manufacturers, distributors, and retailers in the bakery and confectionery sector.',
    participatingCompanyIds: [7, 8],
    image: '/events/bakery-fair.jpg',
    highlights: [
      'Latest bakery equipment and technology',
      'Traditional and modern confectionery showcase',
      'Halal certification guidance',
      'Packaging innovations',
      'Retail and export opportunities'
    ]
  }
];

// Helper functions
export function getEventById(id) {
  return events.find(e => e.id === parseInt(id));
}

export function getEventBySlug(slug) {
  return events.find(e => e.slug === slug);
}

export function getAllEvents() {
  return events;
}

export function getUpcomingEvents() {
  const now = new Date();
  return events.filter(e => new Date(e.start_date) >= now);
}

export function getEventParticipants(eventId) {
  const event = getEventById(eventId);
  if (!event) return [];
  
  // This will be replaced with a proper import when used in API routes
  return event.participatingCompanyIds;
}
