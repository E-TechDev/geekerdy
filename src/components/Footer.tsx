import Link from 'next/link';
import { FaYoutube, FaSpotify, FaInstagram, FaTiktok, FaTwitter, FaFacebook } from 'react-icons/fa';
import {
  socialYoutube,
  socialSpotify,
  socialInstagram,
  socialTiktok,
  socialTwitter,
  socialFacebook,
} from '@/lib/env';

const socialLinks = [
  { href: socialYoutube, label: 'YouTube', icon: FaYoutube },
  { href: socialSpotify, label: 'Spotify', icon: FaSpotify },
  { href: socialInstagram, label: 'Instagram', icon: FaInstagram },
  { href: socialTiktok, label: 'TikTok', icon: FaTiktok },
  { href: socialTwitter, label: 'X', icon: FaTwitter },
  { href: socialFacebook, label: 'Facebook', icon: FaFacebook },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">Gee Kerdy</div>
            <p className="text-gray-400 max-w-sm">
              Premium artist brand with a futuristic glitch aesthetic and next-level music experiences.
            </p>
          </div>
          <div>
            <div className="text-lg font-semibold mb-4">Quick Links</div>
            <div className="space-y-2 text-gray-400">
              <Link href="/" className="block hover:text-neon-green transition-colors">Home</Link>
              <Link href="/music" className="block hover:text-neon-green transition-colors">Music</Link>
              <Link href="/videos" className="block hover:text-neon-green transition-colors">Videos</Link>
              <Link href="/about" className="block hover:text-neon-green transition-colors">About</Link>
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold mb-4">Follow</div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-sm text-gray-300 hover:bg-neon-green hover:text-black transition-all"
                >
                  <link.icon /> {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Gee Kerdy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
