'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room, Player, SwipeAnswer } from '@/lib/types';
import { submitAnswer } from '@/lib/gameActions';
import { DUNGEONS } from '@/lib/dungeonData';
import WaitingScreen from '@/components/player/WaitingScreen';
import SwipeCard from '@/components/player/SwipeCard';
import AnswerFeedback from '@/components/player/AnswerFeedback';
import PlayerPodium from '@/components/player/PlayerPodium';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function PlayPage({ params }: PageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const timedOutRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const pid = localStorage.getItem(`playerId_${roomId}`);
    const pname = localStorage.getItem(`playerName_${roomId}`);
    if (!pid || !pname) {
      router.replace(`/join?room=${roomId}`);
      return;
    }
    setPlayerId(pid);
    setPlayerName(pname);
  }, [roomId, router]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}`), snap => {
      setRoom(snap.val());
    });
    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (!playerId || !roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}/players/${playerId}`), snap => {
      setPlayer(snap.val());
    });
    return unsub;
  }, [roomId, playerId]);

  const handleTimeout = useCallback(() => {
    if (!room || room.status !== 'playing') return;
    const qi = room.current_q_index;
    timedOutRef.current.add(qi);
  }, [room]);

  useEffect(() => {
    if (!room?.question_started_at || room.status !== 'playing') return;
    const tick = () => {
      const elapsed = (Date.now() - room.question_started_at!) / 1000;
      const left = Math.max(0, room.question_duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) handleTimeout();
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [room?.question_started_at, room?.question_duration, room?.status, handleTimeout]);

  const handleSwipe = async (direction: SwipeAnswer) => {
    if (!room || !playerId || room.status !== 'playing') return;
    const qi = room.current_q_index;
    if (timedOutRef.current.has(qi)) return;
    const existingAnswer = player?.answers?.[qi];
    if (existingAnswer !== undefined && existingAnswer !== null) return;

    await submitAnswer(roomId, playerId, qi, direction, room.questions![qi]);
  };

  if (!playerId || !room) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-slate-400">連線中...</div>
      </div>
    );
  }

  if (room.status === 'lobby') {
    return <WaitingScreen playerName={playerName} />;
  }

  if (room.status === 'podium') {
    return <PlayerPodium roomId={roomId} playerId={playerId} />;
  }

  const currentQuestion = room.questions?.[room.current_q_index];
  const dungeon = DUNGEONS.find(d => d.id === room.selected_dungeon);

  if (!currentQuestion || !dungeon) return <WaitingScreen playerName={playerName} />;

  const myAnswer = player?.answers?.[room.current_q_index];
  const hasAnswered = myAnswer !== undefined && myAnswer !== null;

  if (room.status === 'question_end' || hasAnswered) {
    const effectiveAnswer = hasAnswered ? myAnswer : null;
    return (
      <AnswerFeedback
        question={currentQuestion}
        playerAnswer={effectiveAnswer as SwipeAnswer | 'timeout' | null}
        leftLabel={dungeon.leftLabel}
        rightLabel={dungeon.rightLabel}
      />
    );
  }

  const timerPct = timeLeft / room.question_duration;
  const timerColor = timerPct > 0.5 ? 'text-green-400' : timerPct > 0.25 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-slate-400 text-sm">
          第 {room.current_q_index + 1} / {room.questions?.length} 題
        </div>
        <div className="text-slate-300 text-sm font-semibold">{playerName}</div>
        <div className="text-yellow-400 text-sm font-bold">{player?.score ?? 0} 分</div>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-4">
        <motion.div
          key={Math.ceil(timeLeft)}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-black font-mono ${timerColor}`}
        >
          {Math.ceil(timeLeft)}
        </motion.div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mb-4 text-sm font-bold">
        <div className="bg-red-900/50 text-red-300 px-3 py-1.5 rounded-xl">{dungeon.leftLabel}</div>
        <div className="bg-green-900/50 text-green-300 px-3 py-1.5 rounded-xl">{dungeon.rightLabel}</div>
      </div>

      {/* Swipe Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <SwipeCard
            question={currentQuestion}
            leftLabel={dungeon.leftLabel}
            rightLabel={dungeon.rightLabel}
            onSwipe={handleSwipe}
            disabled={hasAnswered}
          />
        </div>
      </div>

      {/* Action hint */}
      <div className="text-center text-slate-600 text-sm mt-4 mb-2">
        {currentQuestion.answer === 'trap'
          ? '⚠️ 思考一下...真的要滑嗎？'
          : '左滑借 / 右滑貸'}
      </div>
    </div>
  );
}
