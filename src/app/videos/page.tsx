import type { Metadata } from 'next';
import VideosPage from '@/components/VideosPage';

export const metadata: Metadata = {
  title: 'Videos | Gee Kerdy',
  description: 'Watch music videos, live performances, and official visual releases from Gee Kerdy.',
};

export default function Videos() {
  return <VideosPage />;
}
