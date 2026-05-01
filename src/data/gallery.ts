export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: '1',
    src: '/images/gallery/1.svg',
    alt: 'Gee Kerdy performing live',
    category: 'Live',
  },
  {
    id: '2',
    src: '/images/gallery/2.svg',
    alt: 'Studio session',
    category: 'Studio',
  },
  {
    id: '3',
    src: '/images/gallery/3.svg',
    alt: 'Behind the scenes',
    category: 'BTS',
  },
  // Add more images...
];