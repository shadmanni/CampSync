import { MessagesSquare, Gavel, CarFront, MapPinned } from 'lucide-react';

/**
 * The four modules, in navigation order.
 *
 * Single source of truth for tab order, colour identity and copy — the navbar,
 * mobile tab bar, landing showcase and page transitions all read from here, so
 * adding a fifth module is a one-line change.
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
    short: 'Bid',
    icon: Gavel,
    accent: 'accent-coral',
    color: 'var(--coral)',
    tagline: 'Buy and sell, on campus',
    blurb:
      'Textbooks, cycles, chairs, calculators. Live auctions with real-time highest-bid tracking, so nobody has to haggle in a group chat.',
    highlights: ['Live highest bid', 'Quick-raise increments', 'Verified sellers only'],
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
      'Split the fare to the station or the airport, and find what is happening this week. Seat counts update on every device the instant one is taken.',
    highlights: ['Live seat counter', 'Split fares', 'Event RSVPs'],
  },
  {
    id: 'nearby',
    label: 'CampusNearby',
    short: 'Nearby',
    icon: MapPinned,
    accent: 'accent-sky',
    color: 'var(--sky)',
    tagline: 'Deals around the gate',
    blurb:
      'Student pricing at the places within walking distance, from official partners and from whoever found the deal first.',
    highlights: ['Partner-verified offers', 'Distance from campus', 'One-tap code copy'],
  },
];

export const MODULE_IDS = MODULES.map((m) => m.id);

export const getModule = (id) => MODULES.find((m) => m.id === id) || MODULES[0];
