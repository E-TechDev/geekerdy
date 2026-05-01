'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { videos } from '@/data/videos';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'music-videos', label: 'Music Videos' },
  { id: 'live-performances', label: 'Live Performances' },
  { id: 'freestyles', label: 'Freestyles' },
  { id: 'behind-scenes', label: 'Behind The Scenes' },
];

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-16"
        >
          Videos
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <div className="relative">
                <iframe
                  width="100%"
                  height="200"
                  src={video.embedUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-t-lg"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                <p className="text-gray-400">{video.duration}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
