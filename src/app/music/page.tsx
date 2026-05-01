import type { Metadata } from 'next';
import MusicPage from '@/components/MusicPage';

export const metadata: Metadata = {
  title: 'Music | Gee Kerdy',
  description: 'Browse the latest songs, albums, and streaming links from Gee Kerdy.',
};

export default function Music() {
  return <MusicPage />;
}
