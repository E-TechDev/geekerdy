'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getClickData, resetClickData } from '@/lib/analytics';
import { adminPassword, adminLockAttempts, adminLockMinutes } from '@/lib/env';

const ADMIN_LOCK_STATE_KEY = 'adminAuthState';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

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
              <h3 className="text-xl font-bold mb-4">Manage Events</h3>
              <p>Add upcoming shows, dates, venues and countdown timers.</p>
            </div>
          )}

          {activeSection === 'gallery' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Gallery Manager</h3>
              <p>Upload/update artist images.</p>
            </div>
          )}

          {activeSection === 'videos' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Video Manager</h3>
              <p>Add YouTube video links.</p>
            </div>
          )}

          {activeSection === 'music' && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Music Manager</h3>
              <p>Add Spotify/Boomplay tracks and release info.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
