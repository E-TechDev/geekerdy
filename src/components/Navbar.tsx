'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube, FaSpotify, FaInstagram, FaTiktok, FaTwitter, FaFacebook } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';
import { trackClick } from '@/lib/analytics';
import {
  socialYoutube,
  socialSpotify,
  socialInstagram,
  socialTiktok,
  socialTwitter,
  socialFacebook,
  logoUrl,
} from '@/lib/env';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Music', href: '/music' },
  { name: 'Videos', href: '/videos' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Events', href: '/events' },
  { name: 'Contact', href: '/contact' },
];

const socialLinks = [
  { id: 'youtube', icon: FaYoutube, href: socialYoutube, label: 'YouTube' },
  { id: 'spotify', icon: FaSpotify, href: socialSpotify, label: 'Spotify' },
  { id: 'instagram', icon: FaInstagram, href: socialInstagram, label: 'Instagram' },
  { id: 'tiktok', icon: FaTiktok, href: socialTiktok, label: 'TikTok' },
  { id: 'twitter', icon: FaTwitter, href: socialTwitter, label: 'X' },
  { id: 'facebook', icon: FaFacebook, href: socialFacebook, label: 'Facebook' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
            {logoUrl && (
              <motion.img
                src={logoUrl}
                alt="Gee Kerdy Logo"
                className="h-8 w-8 object-contain"
                whileHover={{ scale: 1.1 }}
              />
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-white"
            >
              GEE KERDY
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-neon-green transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social Icons & Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Social Icons */}
            <div className="hidden lg:flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-neon-green transition-colors duration-300"
                  aria-label={social.label}
                  onClick={() => trackClick('social', social.id)}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800 absolute w-full top-16 left-0"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <motion.div key={link.name}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-gray-300 hover:text-neon-green transition-colors duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="px-2 pb-3 flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-neon-green transition-colors duration-300"
                    aria-label={social.label}
                    onClick={() => trackClick('social', social.id)}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}