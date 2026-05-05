'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Player } from '@/lib/types';
import { resetRoom } from '@/lib/gameActions';
import { motion } from 'framer-motion';

interface PodiumProps {
  roomId: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = ['from-yellow-500 to-amber-600', 'from-slate-400 to-slate-500', 'from-amber-700 to-amber-800'];

export default function Podium({ roomId }: PodiumProps) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomId}/players`), snap => {
      setPlayers(snap.val() || {});
    });
    return unsub;
  }, [roomId]);

  const sorted = Object.entries(players)
    .filter(([, p]) => p.is_active)
    .sort(([, a], [, b]) => b.score - a.score);

  const handleReset = async () => {
    if (!confirm('確定要重啟遊戲嗎？這將清空所有玩家分數！')) return;
    setResetting(true);
    await resetRoom(roomId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-5xl font-black text-yellow-400 mb-2"
      >
        🏆 最終排行榜
      </motion.div>
      <div className="text-slate-400 mb-10">本回合遊戲結束！</div>

      {/* Top 3 podium */}
      <div className="flex items-end gap-4 mb-10">
        {[1, 0, 2].map(rank => {
          const entry = sorted[rank];
          if (!entry) return <div key={rank} className="w-32" />;
          const [id, player] = entry;
          const heights = [220, 160, 120];
          return (
            <motion.div
              key={id}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: rank * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="text-2xl mb-1">{MEDALS[rank] ?? `#${rank + 1}`}</div>
              <div className="text-sm font-bold mb-1 max-w-28 truncate text-center">{player.name}</div>
              <div className="text-yellow-400 font-black text-lg mb-2">{player.score} 分</div>
              <div
                className={`bg-gradient-to-t ${COLORS[rank] ?? 'from-slate-600 to-slate-700'} rounded-t-2xl w-28 flex items-end justify-center`}
                style={{ height: heights[rank] }}
              >
                <span className="text-4xl pb-2">{rank + 1}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg mb-8">
        <div className="text-slate-400 text-sm mb-4">完整排名</div>
        {sorted.map(([id, player], i) => (
          <motion.div
            key={id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0"
          >
            <span className="text-slate-400 w-8 text-center font-mono">#{i + 1}</span>
            <span className="flex-1 font-semibold">{player.name}</span>
            <span className="font-black text-yellow-400 text-lg">{player.score}</span>
            <span className="text-slate-500 text-sm">分</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleReset}
        disabled={resetting}
        className="bg-red-700 hover:bg-red-600 text-white font-black text-lg px-12 py-4 rounded-2xl disabled:opacity-50 transition-all"
      >
        {resetting ? '重啟中...' : '🔄 重新啟動遊戲'}
      </motion.button>
      <div className="text-slate-600 text-xs mt-2">清空所有分數，保留玩家名單，回到大廳</div>
    </div>
  );
}
