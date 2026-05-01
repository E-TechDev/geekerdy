export interface Song {
  id: string;
  title: string;
  duration: string;
  cover: string;
  embedUrl: string;
  platform: 'spotify' | 'boomplay' | 'youtube';
  releaseDate: string;
}

export const songs: Song[] = [
  {
    id: '1',
    title: '6IXTEEN Vibe',
    duration: '3:24',
    cover: '/images/covers/vibe.svg',
    embedUrl: 'https://open.spotify.com/embed/track/example1',
    platform: 'spotify',
    releaseDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Neon Dreams',
    duration: '4:12',
    cover: '/images/covers/dreams.svg',
    embedUrl: 'https://open.spotify.com/embed/track/example2',
    platform: 'spotify',
    releaseDate: '2024-02-20',
  },
  {
    id: '3',
    title: 'Future Bass',
    duration: '3:45',
    cover: '/images/covers/bass.svg',
    embedUrl: 'https://open.spotify.com/embed/track/example3',
    platform: 'spotify',
    releaseDate: '2024-03-10',
  },
  // Add more songs...
];