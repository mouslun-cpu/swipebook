export type SwipeAnswer = 'debit' | 'credit';
export type RoomStatus = 'lobby' | 'playing' | 'question_end' | 'podium';

export interface Question {
  id: string;
  text: string;
  answer: SwipeAnswer | 'trap';
  hint?: string;
  leftLabel?: string;
  rightLabel?: string;
}

export interface Dungeon {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  leftLabel: string;
  rightLabel: string;
}

export interface Player {
  name: string;
  score: number;
  is_active: boolean;
  answers?: Record<number, SwipeAnswer | 'timeout' | null>;
  answered_at?: Record<number, number>;
}

export interface Room {
  status: RoomStatus;
  selected_dungeon: string | null;
  current_q_index: number;
  is_randomized: boolean;
  created_at: number;
  question_started_at?: number;
  question_duration: number;
  questions?: Question[];
  players?: Record<string, Player>;
  host_id?: string;
}
