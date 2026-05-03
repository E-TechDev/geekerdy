'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { client, getSanityImageUrl } from '@/lib/sanity';
import { detectMediaType, getEmbedUrl, isBlobOrDataUrl } from '@/lib/media';

interface GalleryItem {
  _id: string;
  title: string;
  image?: { asset?: { _ref: string } } | string;
  link?: string;
  caption?: string;
  uploadDate?: string;
  featured: boolean;
}

const getImageUrl = (image: GalleryItem['image']): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  return getSanityImageUrl(image);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {galleryItems.map((item, index) => {
              const mediaType = item.link ? detectMediaType(item.link) : 'image';
              const imageUrl = getImageUrl(item.image);
              const embedUrl = item.link ? getEmbedUrl(item.link, mediaType) : imageUrl;
              const hasMedia = imageUrl || (item.link && embedUrl);

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Media Container */}
                  {mediaType === 'image' && imageUrl ? (
                    <div className="relative w-full aspect-[3/4] bg-gray-800 overflow-hidden rounded-t-lg">
                      {isBlobOrDataUrl(imageUrl) ? (
                        <img src={imageUrl} alt={item.title} className="object-cover w-full h-full" />
                      ) : (
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                    </div>
                  ) : item.link && embedUrl && mediaType !== 'image' ? (
                    <div className="relative w-full aspect-video bg-gray-800 overflow-hidden rounded-t-lg">
                      <iframe
                        src={embedUrl}
                        title={item.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-800 flex items-center justify-center rounded-t-lg">
                      <span className="text-gray-500">No media</span>
                    </div>
                  )}

                  {/* Caption Bar - Transparent Below Image */}
                  {(item.title || item.caption || item.uploadDate) && (
                    <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-b-lg">
                      {item.title && (
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      )}
                      {item.caption && (
                        <p className="text-gray-300 text-sm mt-1">{item.caption}</p>
                      )}
                      {item.uploadDate && (
                        <p className="text-gray-500 text-xs mt-2">{new Date(item.uploadDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
