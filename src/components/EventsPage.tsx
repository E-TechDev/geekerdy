'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { client, getSanityImageUrl } from '@/lib/sanity';
import { detectMediaType, getEmbedUrl, isBlobOrDataUrl } from '@/lib/media';
import Link from 'next/link';

interface EventItem {
  _id: string;
  title: string;
  venue: string;
  date?: string;
  location: string;
  ticketLink?: string;
  description?: string;
  image?: { asset?: { _ref: string } } | string;
  mediaUrl?: string;
  featured: boolean;
}

const getImageUrl = (image: EventItem['image']): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  return getSanityImageUrl(image);
};

const getCountdown = (dateString?: string) => {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return 'Live now';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${mins}m`;
};

export default function EventsPage() {
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await client.fetch('*[_type == "event"] | order(date asc)');
        setEventItems(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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
          Events & Shows
        </motion.h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : eventItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {eventItems.map((event, index) => {
              const imageUrl = getImageUrl(event.image);
              const mediaType = event.mediaUrl ? detectMediaType(event.mediaUrl) : (imageUrl ? 'image' : undefined);
              const embedUrl = event.mediaUrl ? getEmbedUrl(event.mediaUrl, mediaType as string) : imageUrl;

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {(imageUrl || event.mediaUrl) && (
                    <div className="aspect-video relative">
                      {mediaType === 'image' && imageUrl ? (
                        isBlobOrDataUrl(imageUrl) ? (
                          <img src={imageUrl} alt={event.title} className="object-cover w-full h-full" />
                        ) : (
                          <Image
                            src={imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        )
                      ) : (
                        <iframe
                          src={embedUrl}
                          title={event.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  )}
                      <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="mb-4 md:mb-0 flex-1">
                        <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                        {event.date && (
                          <p className="text-gray-400 mb-1">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</p>
                        )}
                        <p className="text-gray-400 mb-4">{event.venue}, {event.location}</p>
                        {event.description && (
                          <p className="text-gray-300">{event.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-4 md:ml-8">
                        {event.date ? (
                          <div className="text-center">
                            <div className="text-neon-green font-semibold">Next Show In</div>
                            <div className="text-2xl font-bold">{getCountdown(event.date)}</div>
                          </div>
                        ) : null}
                        {event.ticketLink && (
                          <Link
                            href={event.ticketLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-neon-green text-black px-6 py-3 rounded-full font-semibold text-center hover:bg-opacity-80 transition-colors"
                          >
                            Get Tickets
                          </Link>
                        )}
                      </div>
                    </div>
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
