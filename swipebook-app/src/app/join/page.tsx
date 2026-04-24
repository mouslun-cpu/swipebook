'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { get, ref } from 'firebase/database';
import { db } from '@/lib/firebase';
import { joinRoom } from '@/lib/gameActions';

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomCode, setRoomCode] = useState(searchParams.get('room') ?? '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!roomCode.trim() || !nickname.trim()) {
      setError('請填寫房間代碼和暱稱');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const snap = await get(ref(db, `rooms/${roomCode.trim()}`));
      if (!snap.exists()) {
        setError('找不到這個房間，請確認代碼是否正確');
        setJoining(false);
        return;
      }

      const room = snap.val();
      if (room.status !== 'lobby') {
        setError('這個房間的遊戲已經開始，無法加入');
        setJoining(false);
        return;
      }

      const existingPlayerId = localStorage.getItem(`playerId_${roomCode.trim()}`);
      const playerId = await joinRoom(roomCode.trim(), nickname.trim(), existingPlayerId ?? undefined);
      localStorage.setItem(`playerId_${roomCode.trim()}`, playerId);
      localStorage.setItem(`playerName_${roomCode.trim()}`, nickname.trim());

      router.push(`/play/${roomCode.trim()}`);
    } catch {
      setError('加入失敗，請重試');
      setJoining(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-yellow-400 mb-2">加入遊戲</h1>
        <p className="text-slate-400">輸入房間代碼和你的暱稱</p>
      </div>

      <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="mb-5">
          <label className="block text-slate-400 text-sm mb-2">房間代碼</label>
          <input
            type="text"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="輸入 6 位數字"
            maxLength={6}
            className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-2xl font-mono tracking-widest text-center border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-400 text-sm mb-2">你的暱稱</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value.slice(0, 16))}
            placeholder="輸入暱稱（最多 16 字）"
            maxLength={16}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-300 rounded-xl p-3 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining || !roomCode || !nickname}
          className="w-full bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-black text-xl py-4 rounded-2xl transition-all"
        >
          {joining ? '加入中...' : '🚀 加入戰場'}
        </button>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 text-slate-600 hover:text-slate-400 text-sm transition-colors"
      >
        ← 返回
      </button>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-slate-400">載入中...</div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
