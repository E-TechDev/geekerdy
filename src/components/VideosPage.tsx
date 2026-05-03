'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { client } from '@/lib/sanity';

interface VideoItem {
  _id: string;
  title: string;
  caption?: string;
  embedUrl: string;
  platform: string;
  category: string;
  uploadDate?: string;
  thumbnail?: { asset?: { _ref: string } } | string;
  featured: boolean;
}

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
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await client.fetch('*[_type == "video"] | order(uploadDate desc)');
        setVideoItems(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videoItems.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [videoItems, searchQuery, selectedCategory]);

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

        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Explore the catalog</h2>
            <p className="text-gray-400 max-w-2xl">Search your video library and filter by category.</p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos"
              className="w-full md:w-80 bg-gray-900 border border-gray-700 rounded-full px-5 py-3 focus:outline-none focus:border-neon-green"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-full px-5 py-3 focus:outline-none focus:border-neon-green"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No videos found matching your search.</p>
            </div>
          ) : (
            filteredVideos.map((video, index) => (
              <motion.div
                key={video._id}
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
                <div className="bg-black/70 backdrop-blur-sm px-6 py-4">
                  <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-400 mb-2">{video.platform}</p>
                  {video.uploadDate && (
                    <p className="text-sm text-gray-500 mb-2">{new Date(video.uploadDate).toLocaleDateString()}</p>
                  )}
                  {video.caption && (
                    <p className="text-gray-300 text-sm">{video.caption}</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
