'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { FaPlay, FaPause } from 'react-icons/fa';

interface MusicItem {
  _id: string;
  title: string;
  artist: string;
  duration: string;
  coverImage?: string;
  embedUrl: string;
  platform: string;
  releaseDate: string;
  featured: boolean;
}

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [musicItems, setMusicItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await client.fetch('*[_type == "music"] | order(releaseDate desc)');
        setMusicItems(data);
      } catch (error) {
        console.error('Error fetching music:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  const filteredSongs = useMemo(
    () => musicItems.filter((song) => song.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [musicItems, searchQuery]
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Loading music...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No music found matching your search.</p>
            </div>
          ) : (
            filteredSongs.map((song, index) => (
              <motion.div
                key={song._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  {song.coverImage ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={song.coverImage}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                      <div className="text-6xl opacity-20">
                        {song.platform.toLowerCase() === 'spotify' ? '🎵' : song.platform.toLowerCase() === 'boomplay' ? '🎶' : '▶️'}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <FaPlay size={48} className="text-neon-green" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{song.title}</h3>
                  <p className="text-gray-400 mb-2">{song.artist}</p>
                  <p className="text-sm text-gray-500 mb-4">{new Date(song.releaseDate).toLocaleDateString()}</p>
                  <button
                    onClick={() => setExpandedSong(expandedSong === song._id ? null : song._id)}
                    className="w-full bg-neon-green text-black py-2 px-4 rounded-full font-semibold hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedSong === song._id ? <FaPause /> : <FaPlay />}
                    {expandedSong === song._id ? 'Close Player' : 'Play Now'}
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSong === song._id && (
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
                          height={song.platform === 'Spotify' ? '152' : song.platform === 'Boomplay' ? '180' : '315'}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
