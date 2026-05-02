'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackClick } from '@/lib/analytics';
import { homeSpotifyLink, homeBoomplayLink, homeSpotifyEmbed, homeYoutubeEmbed } from '@/lib/env';
import { client } from '@/lib/sanity';

interface FeaturedMusic {
  _id: string;
  title: string;
  artist: string;
  embedUrl: string;
  platform: string;
  releaseDate: string;
}

interface FeaturedVideo {
  _id: string;
  title: string;
  embedUrl: string;
  platform: string;
  uploadDate: string;
}

interface FeaturedAnnouncement {
  _id: string;
  title: string;
  message: string;
  link?: string;
  embedUrl?: string;
  expiresAt?: string;
  showCountdown?: boolean;
}

const heroDots = Array.from({ length: 30 }, () => ({
  x: Math.floor(Math.random() * 1200) + 100,
  y: Math.floor(Math.random() * 600) + 50,
  delay: Math.random() * 2,
  duration: Math.random() * 3 + 2,
}));

export default function HomePage() {
  const [featuredMusic, setFeaturedMusic] = useState<FeaturedMusic | null>(null);
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);
  const [announcements, setAnnouncements] = useState<FeaturedAnnouncement[]>([]);
  const [announcementCountdowns, setAnnouncementCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const [latestMusic, videoData, allAnnouncements] = await Promise.all([
          client.fetch('*[_type == "music" && latestRelease == true] | order(releaseDate desc)[0]'),
          client.fetch('*[_type == "video" && featured == true] | order(uploadDate desc)[0]'),
          client.fetch('*[_type == "announcement" && (!defined(expiresAt) || expiresAt > now())] | order(_createdAt desc)'),
        ]);

        const musicData = latestMusic || await client.fetch('*[_type == "music" && featured == true] | order(releaseDate desc)[0]');
        setFeaturedMusic(musicData);
        setFeaturedVideo(videoData);
        setAnnouncements(allAnnouncements);
      } catch (error) {
        console.error('Error fetching featured content:', error);
      }
    };

    fetchFeaturedContent();
  }, []);

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};
      announcements.forEach((announcement) => {
        if (announcement.showCountdown && announcement.expiresAt) {
          const expires = new Date(announcement.expiresAt).getTime();
          const diff = expires - Date.now();
          if (diff <= 0) {
            newCountdowns[announcement._id] = 'Expired';
          } else {
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            newCountdowns[announcement._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          }
        }
      });
      window.setTimeout(() => setAnnouncementCountdowns(newCountdowns), 0);
    };

    updateCountdowns();
    const interval = window.setInterval(updateCountdowns, 1000);
    return () => window.clearInterval(interval);
  }, [announcements]);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20">
            {heroDots.map((dot, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-neon-green rounded-full"
                style={{ left: dot.x, top: dot.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{
                  duration: dot.duration,
                  repeat: Infinity,
                  delay: dot.delay,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-bold mb-4 glitch-text"
            data-text="GEE KERDY"
          >
            GEE KERDY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-neon-green mb-8"
          >
            6IXTEEN FLAVOUR
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/music"
              className="bg-neon-green text-black px-8 py-3 rounded-full font-semibold hover:bg-opacity-80 transition-colors"
              onClick={() => trackClick('spotify')}
            >
              Stream Music
            </Link>
            <Link
              href="/videos"
              className="border border-neon-green text-neon-green px-8 py-3 rounded-full font-semibold hover:bg-neon-green hover:text-black transition-colors"
            >
              Watch Videos
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-center">Latest Release</h2>
            {featuredMusic ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-semibold mb-4">{featuredMusic.title}</h3>
                <p className="text-gray-400 mb-2">by {featuredMusic.artist}</p>
                <p className="text-gray-400 mb-6">Released {new Date(featuredMusic.releaseDate).toLocaleDateString()}</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <a
                    href={homeSpotifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                    onClick={() => trackClick('spotify')}
                  >
                    Listen on Spotify
                  </a>
                  <a
                    href={homeBoomplayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors"
                    onClick={() => trackClick('boomplay')}
                  >
                    Listen on Boomplay
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-semibold mb-4">6IXTEEN Vibe</h3>
                <p className="text-gray-400 mb-6">Out now on all platforms</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <a
                    href={homeSpotifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
                    onClick={() => trackClick('spotify')}
                  >
                    Listen on Spotify
                  </a>
                  <a
                    href={homeBoomplayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors"
                    onClick={() => trackClick('boomplay')}
                  >
                    Listen on Boomplay
                  </a>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-center">Featured on Spotify</h2>
            <div className="flex justify-center">
              <iframe
                src={homeSpotifyEmbed}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="max-w-2xl rounded-lg"
              ></iframe>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-center">Featured Video</h2>
            <div className="flex justify-center">
              {featuredVideo ? (
                <iframe
                  width="100%"
                  height="400"
                  src={featuredVideo.embedUrl}
                  title={featuredVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="max-w-4xl rounded-lg"
                ></iframe>
              ) : (
                <iframe
                  width="100%"
                  height="400"
                  src={homeYoutubeEmbed}
                  title="Featured Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="max-w-4xl rounded-lg"
                ></iframe>
              )}
            </div>
          </motion.div>

          {announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl font-bold mb-8 text-center">Announcements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="bg-gray-900 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-semibold mb-4">{announcement.title}</h3>
                    <p className="text-gray-300 mb-4">{announcement.message}</p>
                    {announcement.showCountdown && announcementCountdowns[announcement._id] && (
                      <p className="text-neon-green font-semibold mb-4">Countdown: {announcementCountdowns[announcement._id]}</p>
                    )}
                    <div className="flex justify-center gap-4 flex-wrap">
                      {announcement.link && (
                        <a
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-neon-green text-black px-4 py-2 rounded-full font-semibold hover:bg-opacity-80 transition-colors"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
