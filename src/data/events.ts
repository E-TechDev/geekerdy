export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketLink: string;
  description: string;
}

export const events: Event[] = [
  {
    id: '1',
    title: '6IXTEEN FLAVOUR Tour Kickoff',
    date: '2024-06-15',
    time: '20:00',
    venue: 'The Underground',
    location: 'Lagos, Nigeria',
    ticketLink: 'https://tickets.example.com/event1',
    description: 'Join Gee Kerdy for the launch of the 6IXTEEN FLAVOUR tour.',
  },
  {
    id: '2',
    title: 'Neon Nights Festival',
    date: '2024-07-20',
    time: '21:00',
    venue: 'City Arena',
    location: 'Abuja, Nigeria',
    ticketLink: 'https://tickets.example.com/event2',
    description: 'Featured performance at the annual Neon Nights Festival.',
  },
  // Add more events...
];