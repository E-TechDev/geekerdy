'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { getClickData, resetClickData, loadClickData } from '@/lib/analytics';
import { adminPassword, adminLockAttempts, adminLockMinutes } from '@/lib/env';
import { client, writeClient } from '@/lib/sanity';

const ADMIN_LOCK_STATE_KEY = 'adminAuthState';

interface MusicItem {
  _id?: string;
  title: string;
  artist: string;
  duration: string;
  coverImage?: string;
  embedUrl: string;
  link?: string;
  platform: 'spotify' | 'boomplay' | 'youtube' | 'vimeo' | string;
  releaseDate: string;
  featured: boolean;
  latestRelease?: boolean;
}

interface VideoItem {
  _id?: string;
  title: string;
  duration: string;
  thumbnail?: string;
  embedUrl: string;
  link?: string;
  platform: string;
  category: string;
  uploadDate: string;
  featured: boolean;
  latestRelease?: boolean;
}

interface GalleryItem {
  _id?: string;
  title: string;
  image?: string;
  link?: string;
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
  ticketLink?: string;
  description: string;
  featured: boolean;
}

interface AnnouncementItem {
  _id?: string;
  title: string;
  message: string;
  link?: string;
  embedUrl?: string;
  mediaUrl?: string;
  expiresAt?: string;
  showCountdown?: boolean;
  featured: boolean;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const clearStatus = () => {
    setStatusMessage('');
    setStatusType('');
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  };

  const uploadImageAsset = async (file?: File): Promise<string | undefined> => {
    if (!file) return undefined;

    try {
      setLoading(true);
      setActionLoading('Uploading...');
      const asset = await writeClient.assets.upload('image', file, { filename: file.name });
      if (asset && typeof asset.url === 'string') {
        showStatus('Upload completed successfully.', 'success');
        return asset.url;
      }
    } catch (uploadError) {
      console.error('Error uploading asset:', uploadError);
      showStatus(`Image upload failed: ${getErrorMessage(uploadError)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }

    return undefined;
  };

  const uploadAndSetField = async <T extends object>(
    event: ChangeEvent<HTMLInputElement>,
    currentItem: T | null,
    setItem: Dispatch<SetStateAction<T | null>>,
    fieldName: keyof T
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentItem) return;
    const url = await uploadImageAsset(file);
    if (url) {
      setItem({ ...currentItem, [fieldName]: url } as T);
    }
  };

  useEffect(() => {
    // eslint-disable react-hooks/set-state-in-effect
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

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(clearStatus, 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const saveLockState = (nextAttempts: number, nextLockUntil: number | null) => {
    const payload = JSON.stringify({ attempts: nextAttempts, lockUntil: nextLockUntil });
    localStorage.setItem(ADMIN_LOCK_STATE_KEY, payload);
  };

  const unsetPreviousLatest = async (schemaType: string, preserveId?: string) => {
    try {
      const existingIds: string[] = await client.fetch(`*[_type == "${schemaType}" && latestRelease == true${preserveId ? ' && _id != $preserveId' : ''}]._id`, { preserveId });
      await Promise.all(existingIds.map((id) => writeClient.patch(id).set({ latestRelease: false }).commit()));
    } catch (error) {
      console.error('Error unsetting previous latest release:', error);
    }
  };

  // Fetch data functions
  const fetchMusic = useCallback(async () => {
    try {
      const data = await client.fetch('*[_type == "music"] | order(releaseDate desc)');
      setMusicItems(data);
    } catch (error) {
      console.error('Error fetching music:', error);
      showStatus('Unable to load music items.', 'error');
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await client.fetch('*[_type == "video"] | order(uploadDate desc)');
      setVideoItems(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      showStatus('Unable to load videos.', 'error');
    }
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const data = await client.fetch('*[_type == "gallery"] | order(uploadDate desc)');
      setGalleryItems(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      showStatus('Unable to load gallery items.', 'error');
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await client.fetch('*[_type == "event"] | order(date asc)');
      setEventItems(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showStatus('Unable to load events.', 'error');
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await client.fetch('*[_type == "announcement"] | order(expiresAt asc)');
      setAnnouncementItems(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showStatus('Unable to load announcements.', 'error');
    }
  }, []);

  // CRUD operations
  const saveMusic = async (item: MusicItem) => {
    setLoading(true);
    setActionLoading(item._id ? 'Updating music...' : 'Saving music...');
    try {
      const { _id, ...payload } = item;
      if (payload.latestRelease) {
        await unsetPreviousLatest('music', _id);
      }
      if (_id) {
        await writeClient.patch(_id).set(payload).commit();
        showStatus('Music release updated successfully.', 'success');
      } else {
        await writeClient.create({ _type: 'music', ...payload });
        showStatus('Music release added successfully.', 'success');
      }
      await fetchMusic();
      setEditingMusic(null);
    } catch (error) {
      console.error('Error saving music:', error);
      showStatus(`Failed to save music release: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const deleteMusic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this music item?')) return;
    setLoading(true);
    setActionLoading('Deleting music...');
    try {
      await writeClient.delete(id);
      await fetchMusic();
      showStatus('Music release deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting music:', error);
      showStatus(`Failed to delete music release: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const saveVideo = async (item: VideoItem) => {
    setLoading(true);
    setActionLoading(item._id ? 'Updating video...' : 'Saving video...');
    try {
      const { _id, ...payload } = item;
      if (payload.latestRelease) {
        await unsetPreviousLatest('video', _id);
      }
      if (_id) {
        await writeClient.patch(_id).set(payload).commit();
        showStatus('Video updated successfully.', 'success');
      } else {
        await writeClient.create({ _type: 'video', ...payload });
        showStatus('Video added successfully.', 'success');
      }
      await fetchVideos();
      setEditingVideo(null);
    } catch (error) {
      console.error('Error saving video:', error);
      showStatus(`Failed to save video: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    setLoading(true);
    setActionLoading('Deleting video...');
    try {
      await writeClient.delete(id);
      await fetchVideos();
      showStatus('Video deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting video:', error);
      showStatus(`Failed to delete video: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const saveGallery = async (item: GalleryItem) => {
    setLoading(true);
    setActionLoading(item._id ? 'Updating gallery...' : 'Saving gallery...');
    try {
      const { _id, ...payload } = item;
      if (_id) {
        await writeClient.patch(_id).set(payload).commit();
        showStatus('Gallery item updated successfully.', 'success');
      } else {
        await writeClient.create({ _type: 'gallery', ...payload });
        showStatus('Gallery item added successfully.', 'success');
      }
      await fetchGallery();
      setEditingGallery(null);
    } catch (error) {
      console.error('Error saving gallery:', error);
      showStatus(`Failed to save gallery item: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const deleteGallery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    setLoading(true);
    setActionLoading('Deleting gallery item...');
    try {
      await writeClient.delete(id);
      await fetchGallery();
      showStatus('Gallery item deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting gallery:', error);
      showStatus(`Failed to delete gallery item: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const saveEvent = async (item: EventItem) => {
    setLoading(true);
    setActionLoading(item._id ? 'Updating event...' : 'Saving event...');
    try {
      const { _id, ...payload } = item;
      if (_id) {
        await writeClient.patch(_id).set(payload).commit();
        showStatus('Event updated successfully.', 'success');
      } else {
        await writeClient.create({ _type: 'event', ...payload });
        showStatus('Event added successfully.', 'success');
      }
      await fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      showStatus(`Failed to save event: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    setActionLoading('Deleting event...');
    try {
      await writeClient.delete(id);
      await fetchEvents();
      showStatus('Event deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showStatus(`Failed to delete event: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const saveAnnouncement = async (item: AnnouncementItem) => {
    setLoading(true);
    setActionLoading(item._id ? 'Updating announcement...' : 'Saving announcement...');
    try {
      const { _id, ...payload } = item;
      if (_id) {
        await writeClient.patch(_id).set(payload).commit();
        showStatus('Announcement updated successfully.', 'success');
      } else {
        await writeClient.create({ _type: 'announcement', ...payload });
        showStatus('Announcement added successfully.', 'success');
      }
      await fetchAnnouncements();
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      showStatus(`Failed to save announcement: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setLoading(true);
    setActionLoading('Deleting announcement...');
    try {
      await writeClient.delete(id);
      await fetchAnnouncements();
      showStatus('Announcement deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showStatus(`Failed to delete announcement: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const resetAnalytics = () => {
    setLoading(true);
    setActionLoading('Resetting analytics...');
    try {
      resetClickData();
      showStatus('Analytics reset successfully.', 'success');
    } catch (error) {
      console.error('Error resetting analytics:', error);
      showStatus(`Unable to reset analytics: ${getErrorMessage(error)}`, 'error');
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  // Load data when section changes
  useEffect(() => {
    if (activeSection === 'music') fetchMusic();
     
    if (activeSection === 'videos') fetchVideos();
     
    if (activeSection === 'gallery') fetchGallery();
     
    if (activeSection === 'events') fetchEvents();
     
    if (activeSection === 'announcements') fetchAnnouncements();
  }, [activeSection, fetchAnnouncements, fetchEvents, fetchGallery, fetchMusic, fetchVideos]);

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

  loadClickData();
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Music Uploads</h3>
            <p className="text-3xl font-bold text-green-400">{musicItems.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Video Uploads</h3>
            <p className="text-3xl font-bold text-red-400">{videoItems.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Gallery Uploads</h3>
            <p className="text-3xl font-bold text-purple-400">{galleryItems.length}</p>
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
              onClick={resetAnalytics}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {actionLoading === 'Resetting analytics...' ? 'Resetting...' : 'Reset Analytics'}
            </button>

            <button
              onClick={() => setActiveSection('music')}
              className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Manage Music
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
          </div>
        </motion.div>

        {statusMessage && (
          <div className={`mb-6 rounded-lg p-4 ${statusType === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
            <p className={`font-semibold ${statusType === 'success' ? 'text-green-200' : 'text-red-200'}`}>{statusMessage}</p>
          </div>
        )}

        <div className="mt-8">
          {activeSection === 'music' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Manage Music</h3>
                  <p className="text-gray-400">Add, edit, or remove music releases and save them directly to Sanity.</p>
                </div>
                <button
                  onClick={() => setEditingMusic({ title: '', artist: '', duration: '', coverImage: '', embedUrl: '', link: '', platform: 'spotify', releaseDate: new Date().toISOString().slice(0, 10), featured: false, latestRelease: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Release
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {musicItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.artist} · {item.platform}</p>
                      <p className="text-xs text-gray-500">Released {new Date(item.releaseDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setEditingMusic(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMusic(item._id!)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingMusic && (
                <form onSubmit={(e) => { e.preventDefault(); saveMusic(editingMusic); }} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">{editingMusic._id ? 'Edit' : 'Add'} Release</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingMusic.title}
                      onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Artist"
                      value={editingMusic.artist}
                      onChange={(e) => setEditingMusic({ ...editingMusic, artist: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={editingMusic.duration}
                      onChange={(e) => setEditingMusic({ ...editingMusic, duration: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Cover Image URL"
                      value={editingMusic.coverImage || ''}
                      onChange={(e) => setEditingMusic({ ...editingMusic, coverImage: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="col-span-2 flex flex-col gap-2">
                      <span className="text-sm text-gray-300">Upload Cover Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAndSetField(e, editingMusic, setEditingMusic, 'coverImage')}
                        className="text-gray-100"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Embed URL"
                      value={editingMusic.embedUrl}
                      onChange={(e) => setEditingMusic({ ...editingMusic, embedUrl: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <input
                      type="url"
                      placeholder="Link URL"
                      value={editingMusic.link || ''}
                      onChange={(e) => setEditingMusic({ ...editingMusic, link: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <select
                      value={editingMusic.platform}
                      onChange={(e) => setEditingMusic({ ...editingMusic, platform: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    >
                      <option value="spotify">Spotify</option>
                      <option value="boomplay">Boomplay</option>
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                    <input
                      type="date"
                      value={editingMusic.releaseDate}
                      onChange={(e) => setEditingMusic({ ...editingMusic, releaseDate: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={editingMusic.featured}
                        onChange={(e) => setEditingMusic({ ...editingMusic, featured: e.target.checked })}
                        className="rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={editingMusic.latestRelease ?? false}
                        onChange={(e) => setEditingMusic({ ...editingMusic, latestRelease: e.target.checked })}
                        className="rounded"
                      />
                      Latest Release
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? actionLoading ?? 'Saving...' : 'Save Release'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMusic(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
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
                    <label className="col-span-2 flex flex-col gap-2">
                      <span className="text-sm text-gray-300">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAndSetField(e, editingGallery, setEditingGallery, 'image')}
                        className="text-gray-100"
                      />
                    </label>
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
                  onClick={() => setEditingVideo({ title: '', duration: '', thumbnail: '', embedUrl: '', link: '', platform: 'YouTube', category: 'music-videos', uploadDate: new Date().toISOString().slice(0, 10), featured: false, latestRelease: false })}
                  className="bg-neon-green text-black px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Add Video
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {videoItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.platform} · {item.category}</p>
                      <p className="text-xs text-gray-500">Uploaded {new Date(item.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
                    />
                    <input
                      type="url"
                      placeholder="Thumbnail URL"
                      value={editingVideo.thumbnail || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="col-span-2 flex flex-col gap-2">
                      <span className="text-sm text-gray-300">Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAndSetField(e, editingVideo, setEditingVideo, 'thumbnail')}
                        className="text-gray-100"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Video Link"
                      value={editingVideo.link || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, link: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <select
                      value={editingVideo.platform}
                      onChange={(e) => setEditingVideo({ ...editingVideo, platform: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    >
                      <option value="YouTube">YouTube</option>
                      <option value="Vimeo">Vimeo</option>
                      <option value="Other">Other</option>
                    </select>
                    <select
                      value={editingVideo.category}
                      onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    >
                      <option value="music-videos">Music Videos</option>
                      <option value="live-performances">Live Performances</option>
                      <option value="freestyles">Freestyles</option>
                      <option value="behind-scenes">Behind The Scenes</option>
                    </select>
                    <input
                      type="date"
                      value={editingVideo.uploadDate}
                      onChange={(e) => setEditingVideo({ ...editingVideo, uploadDate: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={editingVideo.duration}
                      onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={editingVideo.featured}
                        onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                        className="rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={editingVideo.latestRelease ?? false}
                        onChange={(e) => setEditingVideo({ ...editingVideo, latestRelease: e.target.checked })}
                        className="rounded"
                      />
                      Latest Release
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-neon-green text-black px-4 py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
                    >
                      {loading ? actionLoading ?? 'Saving...' : 'Save Video'}
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
                  onClick={() => setEditingAnnouncement({ title: '', message: '', link: '', embedUrl: '', mediaUrl: '', expiresAt: '', featured: false, showCountdown: false })}
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
                      value={editingAnnouncement.link || ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, link: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <input
                      type="url"
                      placeholder="Embed URL"
                      value={editingAnnouncement.embedUrl || ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, embedUrl: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <input
                      type="url"
                      placeholder="Media URL"
                      value={editingAnnouncement.mediaUrl || ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, mediaUrl: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="col-span-2 flex flex-col gap-2 text-sm text-gray-300">
                      <span>Upload Announcement Media</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAndSetField(e, editingAnnouncement, setEditingAnnouncement, 'mediaUrl')}
                        className="text-gray-100"
                      />
                    </label>
                    <input
                      type="datetime-local"
                      value={editingAnnouncement.expiresAt}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiresAt: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingAnnouncement.featured}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, featured: e.target.checked })}
                        className="rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingAnnouncement.showCountdown ?? false}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, showCountdown: e.target.checked })}
                        className="rounded"
                      />
                      Show Countdown
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
