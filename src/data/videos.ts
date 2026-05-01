export interface Video {
  id: string;
  title: string;
  embedUrl: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  category: 'music-videos' | 'live-performances' | 'freestyles' | 'behind-scenes';
}

export const videos: Video[] = [
  {
    id: '1',
    title: '6IXTEEN Vibe - Official Music Video',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/thumbnails/vibe.svg',
    duration: '3:24',
    uploadDate: '2024-01-15',
    category: 'music-videos',
  },
  {
    id: '2',
    title: 'Behind the Scenes - Neon Dreams',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/thumbnails/dreams.svg',
    duration: '5:30',
    uploadDate: '2024-02-20',
    category: 'behind-scenes',
  },
  {
    id: '3',
    title: 'Live Performance - Future Bass',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/thumbnails/bass.svg',
    duration: '4:15',
    uploadDate: '2024-03-10',
    category: 'live-performances',
  },
  // Add more videos...
];