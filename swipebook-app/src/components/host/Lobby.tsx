'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { DUNGEONS } from '@/lib/dungeonData';
import { Player } from '@/lib/types';
import { startGame } from '@/lib/gameActions';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

interface LobbyProps {
  roomId: string;
}

export default function Lobby({ roomId }: LobbyProps) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [selectedDungeon, setSelectedDungeon] = useState(DUNGEONS[0].id);
  const [starting, setStarting] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join?room=${roomId}`);
  }, [roomId]);

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomId}/players`), snap => {
      setPlayers(snap.val() || {});
    });
    return unsub;
  }, [roomId]);

  const activePlayers = Object.values(players).filter(p => p.is_active);

  const handleStart = async () => {
    setStarting(true);
    try {
      await startGame(roomId, selectedDungeon);
    } catch {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl font-black text-yellow-400 tracking-wider">
          🎮 SwipeBooks
        </div>
        <div className="mt-2 text-slate-400 text-lg">等待玩家加入大廳...</div>
      </div>

      {/* Player count */}
      <div className="text-center mb-6">
        <motion.div
          key={activePlayers.length}
          initial={{ scale: 1.3, color: '#facc15' }}
          animate={{ scale: 1, color: '#ffffff' }}
          className="text-4xl font-bold"
        >
          目前加入人數：{activePlayers.length} 人
        </motion.div>
      </div>

      <div className="flex flex-1 gap-8 max-w-6xl mx-auto w-full">
        {/* Left: QR Code */}
        <div className="flex flex-col items-center justify-center bg-slate-800 rounded-3xl p-8 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl mb-4">
            {joinUrl && (
              <QRCodeSVG value={joinUrl} size={200} level="H" />
            )}
          </div>
          <div className="text-slate-400 text-sm mb-2">掃描 QR Code 加入，或輸入房間代碼</div>
          <div className="text-4xl font-black tracking-widest text-yellow-400 font-mono">
            {roomId}
          </div>
          <div className="text-slate-500 text-xs mt-1">{joinUrl}</div>
        </div>

        {/* Right: Player bubbles + controls */}
        <div className="flex flex-col flex-1 gap-6">
          {/* Player bubbles */}
          <div className="bg-slate-800 rounded-3xl p-6 flex-1 overflow-hidden">
            <div className="text-slate-400 text-sm mb-3">已加入的學生</div>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {Object.entries(players)
                  .filter(([, p]) => p.is_active)
                  .map(([id, player]) => (
                    <motion.div
                      key={id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="bg-indigo-600 px-4 py-2 rounded-full font-semibold text-sm"
                    >
                      {player.name}
                    </motion.div>
                  ))}
              </AnimatePresence>
              {activePlayers.length === 0 && (
                <div className="text-slate-600 text-sm">等待學生掃碼加入...</div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm mb-3">選擇今日挑戰副本</div>
            <select
              value={selectedDungeon}
              onChange={e => setSelectedDungeon(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-4 border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              {DUNGEONS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <div className="text-slate-500 text-xs mb-4">
              {DUNGEONS.find(d => d.id === selectedDungeon)?.description}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={activePlayers.length === 0 || starting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-black text-xl py-4 rounded-2xl transition-all"
            >
              {starting ? '啟動中...' : '🚀 開始遊戲'}
            </motion.button>
            {activePlayers.length === 0 && (
              <div className="text-center text-slate-500 text-xs mt-2">需要至少 1 位學生才能開始</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
