'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room, Player } from '@/lib/types';
import { nextQuestion } from '@/lib/gameActions';
import { motion } from 'framer-motion';
import { DUNGEONS } from '@/lib/dungeonData';

interface QuestionResultsProps {
  roomId: string;
  room: Room;
}

export default function QuestionResults({ roomId, room }: QuestionResultsProps) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomId}/players`), snap => {
      setPlayers(snap.val() || {});
    });
    return unsub;
  }, [roomId]);

  const currentQuestion = room.questions?.[room.current_q_index];
  const dungeon = DUNGEONS.find(d => d.id === room.selected_dungeon);
  const activePlayers = Object.values(players).filter(p => p.is_active);

  const debitCount = activePlayers.filter(p => p.answers?.[room.current_q_index] === 'debit').length;
  const creditCount = activePlayers.filter(p => p.answers?.[room.current_q_index] === 'credit').length;
  const noAnswerCount = activePlayers.length - debitCount - creditCount;

  const total = activePlayers.length || 1;
  const isTrap = currentQuestion?.answer === 'trap';
  const correctAnswer = currentQuestion?.answer;

  const sorted = [...Object.entries(players)]
    .filter(([, p]) => p.is_active)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 5);

  const handleNext = async () => {
    setLoading(true);
    await nextQuestion(roomId, room.current_q_index, room.questions?.length ?? 0);
  };

  const isLast = room.current_q_index >= (room.questions?.length ?? 1) - 1;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-slate-300">
          第 {room.current_q_index + 1} 題結果
        </div>
        <div className="text-slate-400 text-sm mt-1">{dungeon?.title}</div>
      </div>

      {/* Question */}
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl mx-auto w-full mb-6 text-center">
        <div className="text-xl font-semibold mb-2">{currentQuestion?.text}</div>
        {isTrap ? (
          <div className="text-yellow-400 font-bold text-lg">⚠️ 陷阱題！這是實帳戶，不需要結清！</div>
        ) : (
          <div className="text-green-400 font-bold text-lg">
            正確答案：{correctAnswer === 'debit' ? `${dungeon?.leftLabel ?? '👈 借'}` : `${dungeon?.rightLabel ?? '貸 👉'}`}
          </div>
        )}
        {currentQuestion?.hint && (
          <div className="text-slate-400 text-sm mt-2">💡 {currentQuestion.hint}</div>
        )}
      </div>

      <div className="flex gap-6 max-w-4xl mx-auto w-full">
        {/* Answer distribution */}
        <div className="bg-slate-800 rounded-2xl p-6 flex-1">
          <div className="text-slate-400 text-sm mb-4">答題分佈</div>
          {isTrap ? (
            <div>
              <BarRow label={dungeon?.leftLabel ?? '👈 借'} count={debitCount} total={total} color="bg-red-500" correct={false} />
              <BarRow label={dungeon?.rightLabel ?? '貸 👉'} count={creditCount} total={total} color="bg-green-500" correct={false} />
              <BarRow label="⏳ 未作答（正確！）" count={noAnswerCount} total={total} color="bg-yellow-500" correct={true} />
            </div>
          ) : (
            <div>
              <BarRow
                label={dungeon?.leftLabel ?? '👈 借'}
                count={debitCount}
                total={total}
                color="bg-red-500"
                correct={correctAnswer === 'debit'}
              />
              <BarRow
                label={dungeon?.rightLabel ?? '貸 👉'}
                count={creditCount}
                total={total}
                color="bg-green-500"
                correct={correctAnswer === 'credit'}
              />
              <BarRow label="⏳ 未作答" count={noAnswerCount} total={total} color="bg-slate-600" correct={false} />
            </div>
          )}
        </div>

        {/* Mini leaderboard */}
        <div className="bg-slate-800 rounded-2xl p-6 w-64">
          <div className="text-slate-400 text-sm mb-4">目前排行榜 Top 5</div>
          {sorted.map(([id, player], i) => (
            <div key={id} className="flex items-center gap-3 mb-2">
              <span className="text-slate-400 w-5 text-sm">{i + 1}</span>
              <span className="flex-1 truncate text-sm">{player.name}</span>
              <span className="font-bold text-yellow-400 text-sm">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xl px-12 py-4 rounded-2xl disabled:opacity-50"
        >
          {loading ? '載入中...' : isLast ? '🏆 查看最終排行榜' : '➡️ 下一題'}
        </motion.button>
      </div>
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
  correct,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  correct: boolean;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className={correct ? 'text-green-400 font-bold' : 'text-slate-300'}>
          {label} {correct && '✓'}
        </span>
        <span className="text-slate-400">{count} 人 ({pct}%)</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`${color} h-3 rounded-full`}
        />
      </div>
    </div>
  );
}
