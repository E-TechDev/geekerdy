'use client';

import { motion } from 'framer-motion';

const milestones = [
  { year: '2020', event: 'Started music career' },
  { year: '2021', event: 'Released debut single' },
  { year: '2022', event: 'First major tour' },
  { year: '2023', event: 'Album release' },
  { year: '2024', event: '6IXTEEN FLAVOUR era begins' },
];

const stats = [
  { label: 'Songs Released', value: '25+' },
  { label: 'Streams', value: '10M+' },
  { label: 'Followers', value: '500K+' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-16"
        >
          About Gee Kerdy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-3xl font-semibold mb-6">Artist Bio</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Gee Kerdy is a visionary artist pushing the boundaries of modern music with the 6IXTEEN FLAVOUR.
              Known for innovative sound design and futuristic aesthetics, Gee Kerdy has captivated audiences
              worldwide with a unique blend of electronic beats and soulful melodies.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Emerging from the underground scene, Gee Kerdy has quickly risen to prominence, collaborating
              with top producers and performing at major festivals. The 6IXTEEN FLAVOUR represents a new era
              of music that transcends genres and connects with listeners on a deeper level.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-semibold text-center mb-8">Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg p-8 text-center"
              >
                <div className="text-4xl font-bold text-neon-green mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold text-center mb-8">Career Timeline</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex items-center gap-8"
              >
                <div className="text-2xl font-bold text-neon-green min-w-[100px]">
                  {milestone.year}
                </div>
                <div className="bg-gray-800 h-px flex-1"></div>
                <div className="text-lg text-gray-300 min-w-[200px]">
                  {milestone.event}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
