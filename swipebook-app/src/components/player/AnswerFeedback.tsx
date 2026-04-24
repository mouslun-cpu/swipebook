'use client';

import { motion } from 'framer-motion';
import { Question, SwipeAnswer } from '@/lib/types';

interface AnswerFeedbackProps {
  question: Question;
  playerAnswer: SwipeAnswer | 'timeout' | null;
  leftLabel: string;
  rightLabel: string;
}

export default function AnswerFeedback({ question, playerAnswer, leftLabel, rightLabel }: AnswerFeedbackProps) {
  const isTrap = question.answer === 'trap';
  const isTimeout = playerAnswer === 'timeout' || playerAnswer === null;

  let correct: boolean;
  let emoji: string;
  let message: string;
  let bgColor: string;

  if (isTrap) {
    if (isTimeout) {
      correct = true;
      emoji = '🎉';
      message = '恭喜識破陷阱！';
      bgColor = 'from-yellow-600 to-amber-700';
    } else {
      correct = false;
      emoji = '😱';
      message = '被陷阱騙了！';
      bgColor = 'from-red-700 to-rose-800';
    }
  } else {
    correct = playerAnswer === question.answer;
    emoji = correct ? '✅' : '❌';
    message = correct ? '答對了！' : '答錯了！';
    bgColor = correct ? 'from-green-600 to-emerald-700' : 'from-red-700 to-rose-800';
  }

  const answerLabel = playerAnswer === 'debit' ? leftLabel : playerAnswer === 'credit' ? rightLabel : '⏳ 未作答';
  const correctLabel = question.answer === 'debit' ? leftLabel : question.answer === 'credit' ? rightLabel : '不滑（陷阱題）';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`bg-gradient-to-br ${bgColor} rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl`}
      >
        <div className="text-7xl mb-4">{emoji}</div>
        <div className="text-3xl font-black mb-2">{message}</div>
        {!isTimeout && (
          <div className="text-white/80 text-sm mb-4">
            你的回答：<span className="font-bold">{answerLabel}</span>
          </div>
        )}
        {!correct && (
          <div className="bg-black/20 rounded-xl p-3 text-sm">
            正確答案：<span className="font-bold">{correctLabel}</span>
          </div>
        )}
        {question.hint && (
          <div className="mt-4 text-white/70 text-sm">💡 {question.hint}</div>
        )}
      </motion.div>
      <div className="text-slate-500 text-sm mt-8 animate-pulse">等待老師進行下一題...</div>
    </div>
  );
}
