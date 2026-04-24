import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black text-yellow-400 tracking-wider mb-3">
          📚 SwipeBooks
        </h1>
        <p className="text-slate-400 text-xl">即時競技會計教學平台</p>
        <p className="text-slate-600 text-sm mt-2">
          結合 Tinder 滑卡 × Kahoot 競技 × 會計教學
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        <Link
          href="/host"
          className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-3xl p-8 text-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-900/50"
        >
          <div className="text-5xl mb-4">🖥️</div>
          <div className="text-2xl font-black mb-1">我是老師</div>
          <div className="text-indigo-200 text-sm">建立遊戲大廳，管理比賽進行</div>
        </Link>

        <Link
          href="/join"
          className="flex-1 bg-gradient-to-br from-orange-600 to-rose-700 hover:from-orange-500 hover:to-rose-600 rounded-3xl p-8 text-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-rose-900/50"
        >
          <div className="text-5xl mb-4">📱</div>
          <div className="text-2xl font-black mb-1">我是學生</div>
          <div className="text-orange-200 text-sm">加入比賽，滑卡搶分！</div>
        </Link>
      </div>

      <div className="mt-16 text-slate-700 text-xs text-center">
        <p>← 借方 (Debit) &nbsp;|&nbsp; 貸方 (Credit) 👉</p>
      </div>
    </main>
  );
}
