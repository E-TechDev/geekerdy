export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
}

export const videos: Video[] = [
  {
    id: '1',
    title: '6IXTEEN Vibe - Official Music Video',
    youtubeId: 'dQw4w9WgXcQ', // placeholder
    thumbnail: '/images/thumbnails/vibe.svg',
    duration: '3:24',
    uploadDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Behind the Scenes - Neon Dreams',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: '/images/thumbnails/dreams.svg',
    duration: '5:30',
    uploadDate: '2024-02-20',
  },
  {
    id: '3',
    title: 'Live Performance - Future Bass',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: '/images/thumbnails/bass.svg',
    duration: '4:15',
    uploadDate: '2024-03-10',
  },
  // Add more videos...
];