import { MessagesSquare, Gavel, Sparkles, CheckSquare, CarFront, MapPinned } from 'lucide-react';

/**
 * The six dashboard modules, in navigation order.
 * Single source of truth for tab order, colour identity and copy.
 */
export const MODULES = [
  {
    id: 'connect',
    label: 'CampusConnect',
    short: 'Connect',
    icon: MessagesSquare,
    accent: 'accent-violet',
    color: 'var(--violet)',
    tagline: 'The campus feed, verified',
    blurb:
      'Ask, answer and organise with people who actually go here. Post named or anonymous — either way the account behind it is a real student.',
    highlights: ['Named or anonymous', 'Department & hostel filters', 'Threaded replies'],
  },
  {
    id: 'bid',
    label: 'CampusBid',
    short: 'Marketplace',
    icon: Gavel,
    accent: 'accent-coral',
    color: 'var(--coral)',
    tagline: 'Buy, sell & bid on campus',
    blurb:
      'Textbooks, cycles, chairs, calculators and event passes. Direct second-hand sales and live auctions with outbid protection.',
    highlights: ['Direct sale + Live auction', 'Condition tagging', 'Outbid protection'],
  },
  {
    id: 'skills',
    label: 'CampusSkills',
    short: 'Skills',
    icon: Sparkles,
    accent: 'accent-amber',
    color: '#f59e0b',
    tagline: 'Peer skill exchange & tutoring',
    blurb:
      'Find 1-on-1 tutoring in DSA, coding, UI design, music, photography, and languages from fellow verified students.',
    highlights: ['Offer & Request filters', 'Hourly rates / Peer exchange', 'Direct contact'],
  },
  {
    id: 'tasks',
    label: 'CampusTasks',
    short: 'Tasks & Gigs',
    icon: CheckSquare,
    accent: 'accent-emerald',
    color: '#10b981',
    tagline: 'Micro-tasks & paid campus errands',
    blurb:
      'Need printouts collected, luggage moved, or packages picked up from the gate? Post a task with a reward or earn cash assisting peers.',
    highlights: ['Cash rewards (₹50-₹250)', 'Atomic task claims', 'Campus pickup & drop'],
  },
  {
    id: 'ride',
    label: 'CampusRide',
    short: 'Ride',
    icon: CarFront,
    accent: 'accent-mint',
    color: 'var(--mint)',
    tagline: 'Carpools & campus events',
    blurb:
      'Split the fare to the station or airport, and find campus club events. Seat counts update on every device atomically.',
    highlights: ['Live seat counter', 'Split fares', 'Anti-overbooking guard'],
  },
  {
    id: 'nearby',
    label: 'CampusNearby',
    short: 'Deals',
    icon: MapPinned,
    accent: 'accent-sky',
    color: 'var(--sky)',
    tagline: 'Deals around the gate',
    blurb:
      'Student discounts at cafes, print shops, and stores within walking distance with promo codes and partner badges.',
    highlights: ['Partner-verified offers', 'Distance from campus', 'One-tap code copy'],
  },
];

export const MODULE_IDS = MODULES.map((m) => m.id);

export const getModule = (id) => MODULES.find((m) => m.id === id) || MODULES[0];
