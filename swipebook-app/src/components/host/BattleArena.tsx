'use client';

import { useEffect, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room, Player } from '@/lib/types';
import { endQuestion, skipQuestion } from '@/lib/gameActions';
import { motion } from 'framer-motion';
import { DUNGEONS } from '@/lib/dungeonData';

interface BattleArenaProps {
  roomId: string;
  room: Room;
}

export default function BattleArena({ roomId, room }: BattleArenaProps) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [timeLeft, setTimeLeft] = useState(room.question_duration);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomId}/players`), snap => {
      setPlayers(snap.val() || {});
    });
    return unsub;
  }, [roomId]);

  const handleEnd = useCallback(async () => {
    if (room.status !== 'playing') return;
    await endQuestion(roomId);
  }, [roomId, room.status]);

  useEffect(() => {
    if (!room.question_started_at) return;
    const tick = () => {
      const elapsed = (Date.now() - room.question_started_at!) / 1000;
      const left = Math.max(0, room.question_duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) handleEnd();
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [room.question_started_at, room.question_duration, handleEnd]);

  const currentQuestion = room.questions?.[room.current_q_index];
  const dungeon = DUNGEONS.find(d => d.id === room.selected_dungeon);
  const activePlayers = Object.values(players).filter(p => p.is_active);
  const answeredCount = activePlayers.filter(p => {
    const ans = p.answers?.[room.current_q_index];
    return ans !== undefined && ans !== null;
  }).length;

  const timerPct = timeLeft / room.question_duration;
  const timerColor = timerPct > 0.5 ? 'text-green-400' : timerPct > 0.25 ? 'text-yellow-400' : 'text-red-400';

  if (!currentQuestion) return null;

  const handleSkip = async () => {
    setSkipping(true);
    await skipQuestion(roomId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>{dungeon?.title}</span>
          <span>第 {room.current_q_index + 1} / {room.questions?.length ?? 0} 題</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${((room.current_q_index + 1) / (room.questions?.length ?? 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Left/Right labels */}
      <div className="flex justify-between w-full max-w-2xl mb-4 text-sm font-bold">
        <div className="bg-red-900/50 text-red-300 px-4 py-2 rounded-xl">{dungeon?.leftLabel ?? '👈 借'}</div>
        <div className="bg-green-900/50 text-green-300 px-4 py-2 rounded-xl">{dungeon?.rightLabel ?? '貸 👉'}</div>
      </div>

      {/* Question card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-3xl p-10 max-w-2xl w-full text-center mb-8 shadow-2xl border border-slate-700"
      >
        <div className="text-2xl font-bold leading-relaxed">{currentQuestion.text}</div>
      </motion.div>

      {/* Timer */}
      <div className={`text-8xl font-black mb-6 font-mono ${timerColor} transition-colors`}>
        {Math.ceil(timeLeft)}
      </div>

      {/* Answered progress */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>已作答</span>
          <span>{answeredCount} / {activePlayers.length}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <motion.div
            className="bg-emerald-500 h-3 rounded-full"
            animate={{ width: activePlayers.length > 0 ? `${(answeredCount / activePlayers.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        disabled={skipping}
        className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
      >
        ⏭️ 強制結束本題
      </button>
    </div>
  );
}
