import type { Metadata } from 'next';
import GalleryPage from '@/components/GalleryPage';

export const metadata: Metadata = {
  title: 'Gallery | Gee Kerdy',
  description: 'Explore the visual gallery featuring Gee Kerdy’s performances, studio moments, and art.',
};

export default function Gallery() {
  return <GalleryPage />;
}
