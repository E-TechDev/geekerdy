'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { songs } from '@/data/songs';
import { FaPlay, FaPause } from 'react-icons/fa';
import { trackClick } from '@/lib/analytics';

const albums = [
  {
    title: '6IXTEEN FLAVOUR',
    subtitle: 'The debut EP',
    hero: '/images/covers/vibe.svg',
  },
  {
    title: 'Neon Dreams',
    subtitle: 'Single Collection',
    hero: '/images/covers/dreams.svg',
  },
  {
    title: 'Future Bass',
    subtitle: 'Extended play',
    hero: '/images/covers/bass.svg',
  },
];

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSong, setExpandedSong] = useState<string | null>(null);

  const filteredSongs = useMemo(
    () => songs.filter((song) => song.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-16"
        >
          Music
        </motion.h1>

        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Explore the catalog</h2>
            <p className="text-gray-400 max-w-2xl">
              Search songs, preview releases, and stream the latest Gee Kerdy tracks.
            </p>
          </div>
          <div className="w-full md:w-96">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks"
              className="w-full bg-gray-900 border border-gray-700 rounded-full px-5 py-3 focus:outline-none focus:border-neon-green"
            />
          </div>
        </div>

        <div className="overflow-x-auto mb-16">
          <div className="flex gap-6 min-w-[900px]">
            {albums.map((album, index) => (
              <motion.div
                key={album.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-900 rounded-3xl overflow-hidden min-w-[280px] shadow-glow"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={album.hero}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{album.title}</h3>
                  <p className="text-gray-400">{album.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSongs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <div className="relative">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <FaPlay size={48} className="text-neon-green" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{song.title}</h3>
                <p className="text-gray-400 mb-4">{song.duration}</p>
                <button
                  onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                  className="w-full bg-neon-green text-black py-2 px-4 rounded-full font-semibold hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedSong === song.id ? <FaPause /> : <FaPlay />}
                  {expandedSong === song.id ? 'Close Player' : 'Play Now'}
                </button>
              </div>

              <AnimatePresence>
                {expandedSong === song.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0">
                      <iframe
                        src={song.embedUrl}
                        width="100%"
                        height={song.platform === 'spotify' ? '152' : song.platform === 'boomplay' ? '180' : '315'}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
