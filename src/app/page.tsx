import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'Gee Kerdy | 6IXTEEN FLAVOUR',
  description: 'The official site for Gee Kerdy, home of futuristic music, visuals, and events.',
};

export default function Home() {
  return <HomePage />;
}
