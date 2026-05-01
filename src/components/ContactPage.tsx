'use client';

import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaYoutube, FaSpotify, FaInstagram, FaTiktok, FaTwitter, FaFacebook } from 'react-icons/fa';
import { useState } from 'react';
import {
  whatsappPhone,
  contactEmail,
  socialYoutube,
  socialSpotify,
  socialInstagram,
  socialTiktok,
  socialTwitter,
  socialFacebook,
} from '@/lib/env';

const socialLinks = [
  { id: 'youtube', icon: FaYoutube, href: socialYoutube, label: 'YouTube' },
  { id: 'spotify', icon: FaSpotify, href: socialSpotify, label: 'Spotify' },
  { id: 'instagram', icon: FaInstagram, href: socialInstagram, label: 'Instagram' },
  { id: 'tiktok', icon: FaTiktok, href: socialTiktok, label: 'TikTok' },
  { id: 'twitter', icon: FaTwitter, href: socialTwitter, label: 'X' },
  { id: 'facebook', icon: FaFacebook, href: socialFacebook, label: 'Facebook' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-16"
        >
          Contact & Booking
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-semibold mb-8">Get In Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-green"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-green"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-green"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-neon-green text-black py-3 px-6 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-semibold mb-8">Direct Contact</h2>
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FaWhatsapp size={24} className="text-green-500" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-gray-400">+{whatsappPhone}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FaEnvelope size={24} className="text-blue-500" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-400">geekerdymanagement@gmail.com</div>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold mb-8">Follow Gee Kerdy</h2>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <social.icon size={20} className="text-neon-green" />
                    <span className="text-sm">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
