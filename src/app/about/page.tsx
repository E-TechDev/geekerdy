import type { Metadata } from 'next';
import AboutPage from '@/components/AboutPage';

export const metadata: Metadata = {
  title: 'About | Gee Kerdy',
  description: 'Learn the story behind Gee Kerdy and the 6IXTEEN FLAVOUR movement.',
};

export default function About() {
  return <AboutPage />;
}
