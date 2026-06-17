import { useState, useMemo } from 'react';

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = { name: 'Benny', avatar: 'https://i.pravatar.cc/150?img=8' };

const MOCK_HABITS = [
  { id: '1', name: 'Morning Run',    target: '5 km',        emoji: '🏃', bg: 'bg-orange-50',  ring: 'ring-orange-200'  },
  { id: '2', name: 'Protein Intake', target: '150g protein', emoji: '🥩', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { id: '3', name: 'Meditation',     target: '10 minutes',   emoji: '🧘', bg: 'bg-violet-50',  ring: 'ring-violet-200'  },
  { id: '4', name: 'Reading',        target: '20 pages',     emoji: '📚', bg: 'bg-sky-50',     ring: 'ring-sky-200'     },
];

const QUOTES = [
  'Small steps every day lead to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'The secret is to start.',
  "You don't have to be extreme, just consistent.",
  'Every day is a chance to be better.',
  'Progress, not perfection.',
  'Build habits, build your future.',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STREAK = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date();
const TODAY_STR = TODAY.toISOString().split('T')[0];

function getDailyQuote() {
  const start = new Date(TODAY.getFullYear(), 0, 0);
  const day = Math.floor((TODAY.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[day % QUOTES.length];
}

function hashStr(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildHeatmap(): Record<string, number> {
  const data: Record<string, number> = {};
  for (let i = 91; i >= 0; i--) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    const h = hashStr(k);
    data[k] = h % 10 < 7 ? (h % 4) + 1 : 0;
  }
  // Ensure last STREAK days show as fully completed
  for (let i = 0; i < STREAK; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    data[d.toISOString().split('T')[0]] = 4;
  }
  return data;
}

function heatColor(n: number) {
  if (n === 0) return 'bg-stone-100';
  if (n === 1) return 'bg-emerald-100';
  if (n === 2) return 'bg-emerald-200';
  if (n === 3) return 'bg-emerald-400';
  return 'bg-emerald-500';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [done, setDone] = useState(new Set(['1', '2']));
  const dow = TODAY.getDay(); // 0 = Sun
  const quote = getDailyQuote();
  const heatmap = useMemo(buildHeatmap, []);

  // Build 13-week column grid (Sun→Sat rows)
  const weeks = useMemo(() => {
    const start = new Date(TODAY);
    start.setDate(start.getDate() - 90);
    start.setDate(start.getDate() - start.getDay()); // rewind to Sunday

    const grid: Array<Array<{ d: string; n: number } | null>> = [];
    const cur = new Date(start);

    for (let w = 0; w < 13; w++) {
      const col: Array<{ d: string; n: number } | null> = [];
      for (let i = 0; i < 7; i++) {
        const ds = cur.toISOString().split('T')[0];
        col.push(cur > TODAY ? null : { d: ds, n: heatmap[ds] ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(col);
    }
    return grid;
  }, [heatmap]);

  // One month label per column (first time that month is seen)
  const monthLabels = useMemo(() => {
    const labels = new Array<string>(weeks.length).fill('');
    const seen = new Set<string>();
    weeks.forEach((col, wi) => {
      for (const cell of col) {
        if (cell) {
          const d = new Date(cell.d);
          const mk = `${d.getFullYear()}-${d.getMonth()}`;
          if (!seen.has(mk)) {
            seen.add(mk);
            labels[wi] = d.toLocaleDateString('en-US', { month: 'short' });
            break;
          }
        }
      }
    });
    return labels;
  }, [weeks]);

  const toggle = (id: string) =>
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allDone = done.size === MOCK_HABITS.length;

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#faf8f5' }}>
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
          <div className="flex items-center gap-4">
            <img
              src={MOCK_USER.avatar}
              alt="avatar"
              className="w-14 h-14 rounded-full ring-2 ring-offset-2 ring-orange-200 object-cover flex-shrink-0"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">
                Hello, {MOCK_USER.name} 👋
              </h1>
              <p className="text-sm text-stone-400 mt-0.5">
                {TODAY.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="mt-4 border-l-[3px] border-orange-300 pl-3 py-0.5">
            <p className="text-sm italic text-stone-500 leading-relaxed">"{quote}"</p>
          </div>
        </div>

        {/* ── Streak ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
            Current Streak
          </p>

          <div className="flex items-end gap-2 mt-2 mb-5">
            <span className="text-7xl font-black leading-none" style={{ color: '#FF8C69' }}>
              {STREAK}
            </span>
            <span className="text-stone-400 font-medium pb-2">days 🔥</span>
          </div>

          {/* Weekly calendar row */}
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map((label, i) => {
              const isCompleted = i < dow;
              const isToday = i === dow;
              const isFuture = i > dow;
              return (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] text-stone-400">{label}</span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${isCompleted
                        ? 'text-white shadow-sm'
                        : isToday
                        ? 'ring-2 ring-offset-1 font-black'
                        : 'bg-stone-100 text-stone-300'
                      }`}
                    style={
                      isCompleted
                        ? { backgroundColor: '#FF8C69', boxShadow: '0 2px 6px rgba(255,140,105,0.35)' }
                        : isToday
                        ? { color: '#FF8C69', borderColor: '#FF8C69', outlineColor: '#FF8C69' }
                        : {}
                    }
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isToday ? (
                      <span style={{ color: '#FF8C69' }}>{TODAY.getDate()}</span>
                    ) : (
                      <span className="text-stone-300 text-xs">{/* future */}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Today's Habits ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-gray-800">Today's Habits</h2>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
                allDone
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {done.size}/{MOCK_HABITS.length}
            </span>
          </div>

          {allDone && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-3 text-center">
              <p className="text-sm font-semibold text-emerald-600">
                🎉 All habits done — amazing work today!
              </p>
            </div>
          )}

          <div className="space-y-3">
            {MOCK_HABITS.map(h => {
              const isDone = done.has(h.id);
              return (
                <div
                  key={h.id}
                  className={`bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-4 transition-all active:scale-[0.98] ${
                    isDone ? 'opacity-60' : ''
                  }`}
                >
                  {/* Emoji bubble */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${h.bg}`}
                  >
                    {h.emoji}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-gray-800 leading-tight ${
                        isDone ? 'line-through text-stone-400' : ''
                      }`}
                    >
                      {h.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{h.target} · daily</p>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggle(h.id)}
                    aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone
                        ? 'text-white'
                        : 'border-2 border-stone-200 text-transparent hover:border-stone-300'
                    }`}
                    style={
                      isDone
                        ? { backgroundColor: '#4ade80', boxShadow: '0 2px 8px rgba(74,222,128,0.4)' }
                        : {}
                    }
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Activity Heatmap ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
            Activity — Last 3 Months
          </p>

          <div className="overflow-x-auto">
            <div className="inline-block">
              {/* Month labels */}
              <div className="flex gap-[3px] mb-1.5 ml-[18px]">
                {monthLabels.map((label, i) => (
                  <div key={i} className="w-[15px] flex-shrink-0">
                    <span className="text-[9px] font-medium text-stone-400">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-[3px]">
                {/* Day-of-week labels */}
                <div className="flex flex-col gap-[3px] mr-1 w-[14px]">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="w-3 h-3 flex items-center justify-end pr-0.5">
                      <span className="text-[8px] text-stone-300">{i % 2 === 1 ? d : ''}</span>
                    </div>
                  ))}
                </div>

                {/* Week columns */}
                {weeks.map((col, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {col.map((cell, di) => (
                      <div
                        key={di}
                        title={cell ? `${cell.d}: ${cell.n} completed` : ''}
                        className={`w-3 h-3 rounded-[2px] transition-opacity ${
                          cell ? heatColor(cell.n) : 'opacity-0'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px] text-stone-300 mr-1">Less</span>
            {[0, 1, 2, 3, 4].map(c => (
              <div key={c} className={`w-3 h-3 rounded-[2px] ${heatColor(c)}`} />
            ))}
            <span className="text-[10px] text-stone-300 ml-1">More</span>
          </div>
        </div>

        {/* ── Footer spacer ────────────────────────────────────────────────── */}
        <div className="h-4" />
      </div>
    </div>
  );
}
