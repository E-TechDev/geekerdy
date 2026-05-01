'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getClickData, resetClickData } from '@/lib/analytics';
import { adminPassword, adminLockAttempts, adminLockMinutes } from '@/lib/env';
import { client } from '@/lib/sanity';

const ADMIN_LOCK_STATE_KEY = 'adminAuthState';

interface MusicItem {
  _id?: string;
  title: string;
  artist: string;
  embedUrl: string;
  platform: string;
  releaseDate: string;
  featured: boolean;
}

interface VideoItem {
  _id?: string;
  title: string;
  embedUrl: string;
  platform: string;
  uploadDate: string;
  featured: boolean;
}

interface GalleryItem {
  _id?: string;
  title: string;
  image: string;
  caption: string;
  uploadDate: string;
  featured: boolean;
}

interface EventItem {
  _id?: string;
  title: string;
  venue: string;
  date: string;
  location: string;
  ticketLink: string;
  description: string;
  featured: boolean;
}

interface AnnouncementItem {
  _id?: string;
  title: string;
  message: string;
  link: string;
  embedUrl: string;
  expiresAt: string;
  featured: boolean;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Form states
  const [musicItems, setMusicItems] = useState<MusicItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [announcementItems, setAnnouncementItems] = useState<AnnouncementItem[]>([]);

  const [editingMusic, setEditingMusic] = useState<MusicItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(ADMIN_LOCK_STATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed.attempts === 'number') {
          setAttempts(parsed.attempts);
        }
        if (typeof parsed.lockUntil === 'number') {
          setLockUntil(parsed.lockUntil);
        }
      } catch {
        localStorage.removeItem(ADMIN_LOCK_STATE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!lockUntil) {
      setTimeLeft('');
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      if (now >= lockUntil) {
        setLockUntil(null);
        setAttempts(0);
        setError('Lock expired. You may try again.');
        localStorage.removeItem(ADMIN_LOCK_STATE_KEY);
        setTimeLeft('');
        return;
      }

      const diff = lockUntil - now;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [lockUntil]);

  const saveLockState = (nextAttempts: number, nextLockUntil: number | null) => {
    const payload = JSON.stringify({ attempts: nextAttempts, lockUntil: nextLockUntil });
    localStorage.setItem(ADMIN_LOCK_STATE_KEY, payload);
  };

  // Fetch data functions
  const fetchMusic = async () => {
    try {
      const data = await client.fetch('*[_type == "music"]');
      setMusicItems(data);
    } catch (error) {
      console.error('Error fetching music:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const data = await client.fetch('*[_type == "video"]');
      setVideoItems(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const data = await client.fetch('*[_type == "gallery"]');
      setGalleryItems(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await client.fetch('*[_type == "event"]');
      setEventItems(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await client.fetch('*[_type == "announcement"]');
      setAnnouncementItems(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // CRUD operations
  const saveMusic = async (item: MusicItem) => {
    setLoading(true);
    try {
      if (item._id) {
        await client.patch(item._id).set(item).commit();
      } else {
        await client.create({ _type: 'music', ...item });
      }
      await fetchMusic();
      setEditingMusic(null);
    } catch (error) {
      console.error('Error saving music:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMusic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this music item?')) return;
    setLoading(true);
    try {
      await client.delete(id);
      await fetchMusic();
    } catch (error) {
      console.error('Error deleting music:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVideo = async (item: VideoItem) => {
    setLoading(true);
    try {
      if (item._id) {
        await client.patch(item._id).set(item).commit();
      } else {
        await client.create({ _type: 'video', ...item });
      }
      await fetchVideos();
      setEditingVideo(null);
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    setLoading(true);
    try {
      await client.delete(id);
      await fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGallery = async (item: GalleryItem) => {
    setLoading(true);
    try {
      if (item._id) {
        await client.patch(item._id).set(item).commit();
      } else {
        await client.create({ _type: 'gallery', ...item });
      }
      await fetchGallery();
      setEditingGallery(null);
    } catch (error) {
      console.error('Error saving gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGallery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    setLoading(true);
    try {
      await client.delete(id);
      await fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (item: EventItem) => {
    setLoading(true);
    try {
      if (item._id) {
        await client.patch(item._id).set(item).commit();
      } else {
        await client.create({ _type: 'event', ...item });
      }
      await fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await client.delete(id);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnnouncement = async (item: AnnouncementItem) => {
    setLoading(true);
    try {
      if (item._id) {
        await client.patch(item._id).set(item).commit();
      } else {
        await client.create({ _type: 'announcement', ...item });
      }
      await fetchAnnouncements();
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setLoading(true);
    try {
      await client.delete(id);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when section changes
  useEffect(() => {
    if (activeSection === 'music') fetchMusic();
    if (activeSection === 'videos') fetchVideos();
    if (activeSection === 'gallery') fetchGallery();
    if (activeSection === 'events') fetchEvents();
    if (activeSection === 'announcements') fetchAnnouncements();
  }, [activeSection]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockUntil && Date.now() < lockUntil) {
      setError(`Locked. Try again in ${timeLeft}`);
      return;
    }

    if (password === adminPassword) {
      setIsLoggedIn(true);
      setError('');
      setAttempts(0);
      setLockUntil(null);
      setTimeLeft('');
      localStorage.removeItem(ADMIN_LOCK_STATE_KEY);
      return;
    }

    const nextAttempts = attempts + 1;
    if (nextAttempts >= adminLockAttempts) {
      const nextLockUntil = Date.now() + adminLockMinutes * 60000;
      setAttempts(nextAttempts);
      setLockUntil(nextLockUntil);
      saveLockState(nextAttempts, nextLockUntil);
      setError(`Too many failed attempts. Locked for ${adminLockMinutes} minutes.`);
      return;
    }

    setAttempts(nextAttempts);
    saveLockState(nextAttempts, null);
    setError(`Invalid password. ${adminLockAttempts - nextAttempts} attempts left.`);
  };

  const clickData = getClickData();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900 rounded-lg p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-green"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-neon-green text-black py-3 px-6 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Spotify Clicks</h3>
            <p className="text-3xl font-bold text-green-500">{clickData.spotifyClicks}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">YouTube Clicks</h3>
            <p className="text-3xl font-bold text-red-500">{clickData.youtubeClicks}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Boomplay Clicks</h3>
            <p className="text-3xl font-bold text-orange-500">{clickData.boomplayClicks}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Total Social Clicks</h3>
            <p className="text-3xl font-bold text-neon-green">
              {Object.values(clickData.socialClicks).reduce((a, b) => a + b, 0)}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gray-900 rounded-lg p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={resetClickData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Analytics
            </button>

            <button
              onClick={() => setActiveSection('releases')}
              className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Update Releases
            </button>

            <button
              onClick={() => setActiveSection('events')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Events
            </button>

            <button
              onClick={() => setActiveSection('gallery')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Update Gallery
            </button>

            <button
              onClick={() => setActiveSection('videos')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Manage Videos
            </button>

            <button
              onClick={() => setActiveSection('announcements')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Manage Announcements
            </button>

            <button
              onClick={() => setActiveSection('music')}
              className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
            >
              Manage Music
            </button>
          </div>
        </motion.div>

        <div className="mt-8">
          {activeSection === 'releases' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Manage Releases</h3>
              <p>Add/edit music releases, announcements and streaming links.</p>
            </div>
          )}

          {activeSection === 'events' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Events</h3>
                <button
                  onClick={() => setEditingEvent({ title: '', venue: '', date: '', location: '', ticketLink: '', description: '', featured: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Event
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {eventItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.venue} - {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEvent(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(item._id!)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingEvent && (
                <form onSubmit={(e) => { e.preventDefault(); saveEvent(editingEvent); }} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">{editingEvent._id ? 'Edit' : 'Add'} Event</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Venue"
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="datetime-local"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Ticket Link"
                      value={editingEvent.ticketLink}
                      onChange={(e) => setEditingEvent({ ...editingEvent, ticketLink: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingEvent.featured}
                        onChange={(e) => setEditingEvent({ ...editingEvent, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Featured
                    </label>
                    <textarea
                      placeholder="Description"
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded col-span-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSection === 'gallery' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Gallery</h3>
                <button
                  onClick={() => setEditingGallery({ title: '', image: '', caption: '', uploadDate: '', featured: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Image
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {galleryItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.caption}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGallery(item._id!)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingGallery && (
                <form onSubmit={(e) => { e.preventDefault(); saveGallery(editingGallery); }} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">{editingGallery._id ? 'Edit' : 'Add'} Gallery Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingGallery.title}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={editingGallery.image}
                      onChange={(e) => setEditingGallery({ ...editingGallery, image: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <textarea
                      placeholder="Caption"
                      value={editingGallery.caption}
                      onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded col-span-2"
                      rows={3}
                    />
                    <input
                      type="date"
                      value={editingGallery.uploadDate}
                      onChange={(e) => setEditingGallery({ ...editingGallery, uploadDate: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingGallery.featured}
                        onChange={(e) => setEditingGallery({ ...editingGallery, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Featured
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGallery(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSection === 'videos' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Videos</h3>
                <button
                  onClick={() => setEditingVideo({ title: '', embedUrl: '', platform: '', uploadDate: '', featured: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Video
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {videoItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.platform}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingVideo(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVideo(item._id!)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingVideo && (
                <form onSubmit={(e) => { e.preventDefault(); saveVideo(editingVideo); }} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">{editingVideo._id ? 'Edit' : 'Add'} Video</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingVideo.title}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Embed URL"
                      value={editingVideo.embedUrl}
                      onChange={(e) => setEditingVideo({ ...editingVideo, embedUrl: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <select
                      value={editingVideo.platform}
                      onChange={(e) => setEditingVideo({ ...editingVideo, platform: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    >
                      <option value="">Select Platform</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Vimeo">Vimeo</option>
                    </select>
                    <input
                      type="date"
                      value={editingVideo.uploadDate}
                      onChange={(e) => setEditingVideo({ ...editingVideo, uploadDate: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingVideo.featured}
                        onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Featured
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVideo(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSection === 'announcements' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Manage Announcements</h3>
                <button
                  onClick={() => setEditingAnnouncement({ title: '', message: '', link: '', embedUrl: '', expiresAt: '', featured: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Announcement
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {announcementItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.message.substring(0, 50)}...</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAnnouncement(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(item._id!)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingAnnouncement && (
                <form onSubmit={(e) => { e.preventDefault(); saveAnnouncement(editingAnnouncement); }} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">{editingAnnouncement._id ? 'Edit' : 'Add'} Announcement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingAnnouncement.title}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Link URL"
                      value={editingAnnouncement.link}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, link: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <input
                      type="url"
                      placeholder="Embed URL"
                      value={editingAnnouncement.embedUrl}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, embedUrl: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <input
                      type="datetime-local"
                      value={editingAnnouncement.expiresAt}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiresAt: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingAnnouncement.featured}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Featured
                    </label>
                    <textarea
                      placeholder="Message"
                      value={editingAnnouncement.message}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded col-span-2"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAnnouncement(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
