'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { client } from '@/lib/sanity';

interface GalleryItem {
  _id: string;
  title: string;
  image?: string;
  link?: string;
  caption: string;
  uploadDate?: string;
  featured: boolean;
}

const detectMediaType = (url: string) => {
  if (!url) return 'image';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'image';
};

const getEmbedUrl = (url: string, type: string) => {
  if (type === 'youtube') {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (type === 'instagram') {
    return `https://www.instagram.com/p/${url.split('/p/')[1]?.split('/')[0]}/embed/`;
  }
  if (type === 'tiktok') {
    return url.replace('/video/', '/embed/');
  }
  if (type === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }
  if (type === 'vimeo') {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }
  return url;
};

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await client.fetch('*[_type == "gallery"] | order(uploadDate desc)');
        setGalleryItems(data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-16"
        >
          Gallery
        </motion.h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading gallery...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No images in gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => {
              const mediaType = item.link ? detectMediaType(item.link) : 'image';
              const embedUrl = item.link ? getEmbedUrl(item.link, mediaType) : item.image;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video relative">
                    {mediaType === 'image' && (item.image || (item.link && embedUrl)) ? (
                      <Image
                        src={item.image || embedUrl!}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : mediaType !== 'image' && embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">No media</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    {item.caption && (
                      <p className="text-gray-400 text-sm mb-2">{item.caption}</p>
                    )}
                    {item.uploadDate && (
                      <p className="text-gray-500 text-xs">{new Date(item.uploadDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
