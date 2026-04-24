'use client';

import { motion } from 'framer-motion';

interface WaitingScreenProps {
  playerName: string;
}

export default function WaitingScreen({ playerName }: WaitingScreenProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-8xl mb-8"
      >
        🎮
      </motion.div>
      <div className="text-2xl font-bold mb-2">嗨，{playerName}！</div>
      <div className="text-slate-400 text-lg text-center">
        等待老闆發題中...
      </div>
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [-6, 6] }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5, delay: i * 0.15 }}
            className="w-3 h-3 bg-indigo-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
