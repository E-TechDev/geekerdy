import type { Metadata } from 'next';
import EventsPage from '@/components/EventsPage';

export const metadata: Metadata = {
  title: 'Events | Gee Kerdy',
  description: 'Find upcoming shows, ticket details, and countdowns for Gee Kerdy events.',
};

export default function Events() {
  return <EventsPage />;
}
