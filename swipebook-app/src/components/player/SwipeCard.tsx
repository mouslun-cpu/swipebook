'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Question } from '@/lib/types';

interface SwipeCardProps {
  question: Question;
  leftLabel: string;
  rightLabel: string;
  onSwipe: (direction: 'debit' | 'credit') => void;
  disabled?: boolean;
}

export default function SwipeCard({ question, leftLabel, rightLabel, onSwipe, disabled }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const leftOpacity = useTransform(x, [-150, -30, 0], [1, 0.3, 0]);
  const rightOpacity = useTransform(x, [0, 30, 150], [0, 0.3, 1]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    if (disabled) return;
    if (info.offset.x < -100) {
      onSwipe('debit');
    } else if (info.offset.x > 100) {
      onSwipe('credit');
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ height: 320 }}>
      {/* Left hint overlay */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10"
      >
        <div className="bg-red-600 text-white font-black text-xl px-5 py-3 rounded-2xl rotate-[-12deg] border-4 border-red-400 shadow-xl">
          {leftLabel}
        </div>
      </motion.div>

      {/* Right hint overlay */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10"
      >
        <div className="bg-green-600 text-white font-black text-xl px-5 py-3 rounded-2xl rotate-[12deg] border-4 border-green-400 shadow-xl">
          {rightLabel}
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: -300, right: 300 }}
        style={{ x, rotate, scale: cardScale }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className={`bg-slate-800 border-2 ${isDragging ? 'border-indigo-400 shadow-indigo-500/30' : 'border-slate-600'} rounded-3xl p-8 w-full max-w-sm shadow-2xl cursor-grab active:cursor-grabbing select-none`}
      >
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-4 tracking-widest uppercase">題目</div>
          <div className="text-white text-xl font-bold leading-relaxed">{question.text}</div>
          <div className="mt-6 flex justify-between text-xs text-slate-600">
            <span>← 左滑：{leftLabel}</span>
            <span>{rightLabel}：右滑 →</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
