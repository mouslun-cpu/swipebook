import { ref, set, get, update, push, runTransaction } from 'firebase/database';
import { db } from './firebase';
import { DUNGEONS } from './dungeonData';
import { Question, Room, Player, SwipeAnswer } from './types';

function generateRoomId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function seedDungeons(): Promise<void> {
  for (const dungeon of DUNGEONS) {
    await set(ref(db, `dungeons/${dungeon.id}`), dungeon);
  }
}

export async function createRoom(): Promise<string> {
  let roomId = generateRoomId();
  let attempts = 0;
  while (attempts < 10) {
    const snap = await get(ref(db, `rooms/${roomId}`));
    if (!snap.exists()) break;
    roomId = generateRoomId();
    attempts++;
  }

  const room: Room = {
    status: 'lobby',
    selected_dungeon: null,
    current_q_index: 0,
    is_randomized: false,
    created_at: Date.now(),
    question_duration: 20,
    questions: [],
    players: {},
  };

  await set(ref(db, `rooms/${roomId}`), room);
  return roomId;
}

export async function joinRoom(roomId: string, playerName: string, existingPlayerId?: string): Promise<string> {
  if (existingPlayerId) {
    const existing = await get(ref(db, `rooms/${roomId}/players/${existingPlayerId}`));
    if (existing.exists()) {
      await update(ref(db, `rooms/${roomId}/players/${existingPlayerId}`), { is_active: true });
      return existingPlayerId;
    }
  }

  const playersRef = ref(db, `rooms/${roomId}/players`);
  const newRef = push(playersRef);
  const playerId = newRef.key!;
  const player: Player = {
    name: playerName,
    score: 0,
    is_active: true,
    answers: {},
    answered_at: {},
  };
  await set(newRef, player);
  return playerId;
}

export async function startGame(roomId: string, dungeonId: string): Promise<void> {
  const dungeon = DUNGEONS.find(d => d.id === dungeonId);
  if (!dungeon) throw new Error('Dungeon not found');

  const shuffled = shuffle(dungeon.questions);

  await update(ref(db, `rooms/${roomId}`), {
    status: 'playing',
    selected_dungeon: dungeonId,
    current_q_index: 0,
    is_randomized: true,
    questions: shuffled,
    question_started_at: Date.now(),
  });
}

export async function submitAnswer(
  roomId: string,
  playerId: string,
  questionIndex: number,
  answer: SwipeAnswer,
  question: Question,
): Promise<void> {
  const correct = question.answer !== 'trap' && answer === question.answer;
  const points = correct ? 100 : 0;

  const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
  await runTransaction(playerRef, (currentData: Player | null) => {
    if (!currentData) return; // abort if no player data yet
    const existing = currentData.answers?.[questionIndex];
    if (existing !== undefined && existing !== null) return; // abort if already answered
    return {
      ...currentData,
      answers: { ...(currentData.answers ?? {}), [questionIndex]: answer },
      answered_at: { ...(currentData.answered_at ?? {}), [questionIndex]: Date.now() },
      score: (currentData.score ?? 0) + points,
    };
  });
}

export async function endQuestion(roomId: string): Promise<void> {
  await update(ref(db, `rooms/${roomId}`), { status: 'question_end' });
}

export async function nextQuestion(roomId: string, currentIndex: number, totalQuestions: number): Promise<void> {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= totalQuestions) {
    await update(ref(db, `rooms/${roomId}`), { status: 'podium' });
  } else {
    await update(ref(db, `rooms/${roomId}`), {
      status: 'playing',
      current_q_index: nextIndex,
      question_started_at: Date.now(),
    });
  }
}

export async function resetRoom(roomId: string): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomId}/players`));
  const players = snap.val() || {};

  for (const pid of Object.keys(players)) {
    await update(ref(db, `rooms/${roomId}/players/${pid}`), {
      score: 0,
      answers: {},
      answered_at: {},
    });
  }

  await update(ref(db, `rooms/${roomId}`), {
    status: 'lobby',
    selected_dungeon: null,
    current_q_index: 0,
    is_randomized: false,
    questions: [],
    question_started_at: null,
  });
}

export async function skipQuestion(roomId: string): Promise<void> {
  await update(ref(db, `rooms/${roomId}`), { status: 'question_end' });
}
