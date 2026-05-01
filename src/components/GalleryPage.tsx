'use client';

import { motion } from 'framer-motion';
import { galleryImages } from '@/data/gallery';

export default function GalleryPage() {
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

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="break-inside-avoid relative group cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full rounded-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
                  <p className="text-sm">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
