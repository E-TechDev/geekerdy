'use client';

import { motion } from 'framer-motion';
import { events } from '@/data/events';
import Link from 'next/link';

const getCountdown = (dateString: string) => {
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

        <div className="space-y-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-400 mb-1">{event.date} at {event.time}</p>
                  <p className="text-gray-400 mb-4">{event.venue}, {event.location}</p>
                  <p className="text-gray-300">{event.description}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <div className="text-neon-green font-semibold">Next Show In</div>
                    <div className="text-2xl font-bold">{getCountdown(`${event.date}T${event.time}`)}</div>
                  </div>
                  <Link
                    href={event.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neon-green text-black px-6 py-3 rounded-full font-semibold text-center hover:bg-opacity-80 transition-colors"
                  >
                    Get Tickets
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
