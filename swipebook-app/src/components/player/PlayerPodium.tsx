'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Player } from '@/lib/types';
import { motion } from 'framer-motion';

interface PlayerPodiumProps {
  roomId: string;
  playerId: string;
}

export default function PlayerPodium({ roomId, playerId }: PlayerPodiumProps) {
  const [players, setPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomId}/players`), snap => {
      setPlayers(snap.val() || {});
    });
    return unsub;
  }, [roomId]);

  const sorted = Object.entries(players)
    .filter(([, p]) => p.is_active)
    .sort(([, a], [, b]) => b.score - a.score);

  const myRank = sorted.findIndex(([id]) => id === playerId) + 1;
  const myScore = players[playerId]?.score ?? 0;

  const rankEmoji = myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎮';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="text-8xl mb-4">{rankEmoji}</div>
        <div className="text-4xl font-black mb-2">第 {myRank} 名</div>
        <div className="text-yellow-400 text-3xl font-bold">{myScore} 分</div>
      </motion.div>

      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="text-slate-400 text-sm mb-4 text-center">完整排名</div>
        {sorted.map(([id, player], i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 py-2 border-b border-slate-700 last:border-0 ${id === playerId ? 'text-yellow-400' : ''}`}
          >
            <span className="w-6 text-center text-sm">{i + 1}</span>
            <span className="flex-1 font-semibold truncate">{player.name} {id === playerId ? '（你）' : ''}</span>
            <span className="font-bold">{player.score}</span>
          </motion.div>
        ))}
      </div>

      <div className="text-slate-500 text-sm mt-8 text-center">
        等待老師重新開始下一回合...
      </div>
    </div>
  );
}
