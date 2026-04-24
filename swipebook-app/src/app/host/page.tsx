'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room } from '@/lib/types';
import { createRoom, seedDungeons } from '@/lib/gameActions';
import Lobby from '@/components/host/Lobby';
import BattleArena from '@/components/host/BattleArena';
import QuestionResults from '@/components/host/QuestionResults';
import Podium from '@/components/host/Podium';

export default function HostPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await seedDungeons();
      const newRoomId = await createRoom();
      setRoomId(newRoomId);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}`), snap => {
      setRoom(snap.val());
    });
    return unsub;
  }, [roomId]);

  if (loading || !roomId) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <div className="text-slate-400">建立遊戲房間中...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-slate-400">載入中...</div>
      </div>
    );
  }

  if (room.status === 'lobby') return <Lobby roomId={roomId} />;
  if (room.status === 'playing') return <BattleArena roomId={roomId} room={room} />;
  if (room.status === 'question_end') return <QuestionResults roomId={roomId} room={room} />;
  if (room.status === 'podium') return <Podium roomId={roomId} />;

  return <Lobby roomId={roomId} />;
}
