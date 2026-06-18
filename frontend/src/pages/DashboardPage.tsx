import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  unit: string;
  type: 'numeric' | 'boolean';
  xpValue: number;
  category: string;
}

interface UserHabit {
  id: string;
  userId: string;
  habitId: string;
  customTarget: number;
  isActive: boolean;
  habit: Habit;
}

interface HabitLog {
  id: string;
  userHabitId: string;
  date: string;
  value: number;
  completed: boolean;
  xpEarned: number;
}

interface HeatmapEntry {
  date: string;
  completions: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date();
const TODAY_STR = TODAY.toISOString().split('T')[0];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QUOTES = [
  'Small steps every day lead to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'The secret is to start.',
  "You don't have to be extreme, just consistent.",
  'Every day is a chance to be better.',
  'Progress, not perfection.',
  'Build habits, build your future.',
];

const CATEGORY_COLORS: Record<string, string> = {
  fitness:      'bg-orange-50',
  nutrition:    'bg-emerald-50',
  mindfulness:  'bg-violet-50',
  learning:     'bg-sky-50',
  health:       'bg-rose-50',
  productivity: 'bg-amber-50',
  sleep:        'bg-indigo-50',
  social:       'bg-pink-50',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDailyQuote() {
  const start = new Date(TODAY.getFullYear(), 0, 0);
  const day = Math.floor((TODAY.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[day % QUOTES.length];
}

function heatColor(n: number, total: number) {
  if (n === 0 || total === 0) return 'bg-stone-100';
  const ratio = n / total;
  if (ratio < 0.25) return 'bg-emerald-100';
  if (ratio < 0.5)  return 'bg-emerald-200';
  if (ratio < 0.75) return 'bg-emerald-300';
  if (ratio < 1)    return 'bg-emerald-400';
  return 'bg-emerald-500';
}

function categoryBg(category: string) {
  return CATEGORY_COLORS[(category ?? '').toLowerCase()] ?? 'bg-stone-50';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser]               = useState<User | null>(null);
  const [userHabits, setUserHabits]   = useState<UserHabit[]>([]);
  const [logs, setLogs]               = useState<Record<string, HabitLog>>({});
  const [streak, setStreak]           = useState(0);
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [numericValues, setNumericValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [editTarget, setEditTarget]       = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const quote = useMemo(getDailyQuote, []);
  const dow = TODAY.getDay();

  // ── Initial data fetch ────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      api.get('/users/me'),
      api.get('/user-habits'),
      api.get(`/habit-logs?date=${TODAY_STR}`),
      api.get('/habit-logs/streak'),
      api.get('/habit-logs/heatmap'),
    ])
      .then(([userRes, habitsRes, logsRes, streakRes, heatmapRes]) => {
        setUser(userRes.data);
        setUserHabits(habitsRes.data);

        const logMap: Record<string, HabitLog> = {};
        const numMap: Record<string, string> = {};
        for (const log of logsRes.data as HabitLog[]) {
          logMap[log.userHabitId] = log;
          if (log.value != null) numMap[log.userHabitId] = String(log.value);
        }
        setLogs(logMap);
        setNumericValues(numMap);

        setStreak(streakRes.data.streak);
        setHeatmapData(heatmapRes.data);
      })
      .catch(() => setError('Failed to load data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  // ── Edit panel ───────────────────────────────────────────────────────────

  const openEdit = (uh: UserHabit) => {
    if (editingId === uh.id) { setEditingId(null); return; }
    setEditingId(uh.id);
    setEditTarget(uh.customTarget != null ? String(uh.customTarget) : '');
  };

  const saveEdit = async (uh: UserHabit) => {
    const parsed = parseFloat(editTarget);
    const customTarget = isNaN(parsed) ? undefined : parsed;
    await api.patch(`/user-habits/${uh.id}`, { customTarget: customTarget ?? null });
    setUserHabits(prev => prev.map(h =>
      h.id === uh.id ? { ...h, customTarget: customTarget as number } : h,
    ));
    setEditingId(null);
  };

  const removeHabit = async (id: string) => {
    await api.delete(`/user-habits/${id}`);
    setUserHabits(prev => prev.filter(h => h.id !== id));
    setLogs(prev => { const n = { ...prev }; delete n[id]; return n; });
    setNumericValues(prev => { const n = { ...prev }; delete n[id]; return n; });
    setEditingId(null);
    setConfirmRemoveId(null);
  };

  // ── Helpers: keep heatmap + streak live after each log ────────────────────

  const refreshStreak = () =>
    api.get('/habit-logs/streak').then(r => setStreak(r.data.streak));

  const syncHeatmapToday = (updatedLogs: Record<string, HabitLog>) => {
    const count = Object.values(updatedLogs).filter(l => l.completed).length;
    setHeatmapData(prev => {
      const exists = prev.some(e => e.date === TODAY_STR);
      if (exists) return prev.map(e => e.date === TODAY_STR ? { ...e, completions: count } : e);
      return [...prev, { date: TODAY_STR, completions: count }];
    });
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleBoolean = async (uh: UserHabit) => {
    const nowCompleted = !(logs[uh.id]?.completed ?? false);
    const res = await api.post('/habit-logs', {
      userHabitId: uh.id,
      date: TODAY_STR,
      value: null,
      completed: nowCompleted,
      xpEarned: nowCompleted ? uh.habit.xpValue : 0,
    });
    const updatedLogs = { ...logs, [uh.id]: res.data };
    setLogs(updatedLogs);
    syncHeatmapToday(updatedLogs);
    refreshStreak();
  };

  const logNumeric = async (uh: UserHabit) => {
    const raw = numericValues[uh.id];
    const value = parseFloat(raw);
    if (isNaN(value)) return;
    const completed = uh.customTarget != null ? value >= uh.customTarget : value > 0;
    const res = await api.post('/habit-logs', {
      userHabitId: uh.id,
      date: TODAY_STR,
      value,
      completed,
      xpEarned: completed ? uh.habit.xpValue : 0,
    });
    const updatedLogs = { ...logs, [uh.id]: res.data };
    setLogs(updatedLogs);
    syncHeatmapToday(updatedLogs);
    refreshStreak();
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const completedCount = Object.values(logs).filter(l => l.completed).length;
  const allDone = userHabits.length > 0 && completedCount === userHabits.length;

  const heatmapLookup = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of heatmapData) map[e.date] = e.completions;
    return map;
  }, [heatmapData]);

  const weekDates = useMemo(() =>
    DAY_LABELS.map((_, i) => {
      const d = new Date(TODAY);
      d.setDate(TODAY.getDate() - dow + i);
      return d.toISOString().split('T')[0];
    })
  , [dow]);

  const isDayCompleted = (i: number) => {
    if (i > dow) return false;
    if (i === dow) return userHabits.length > 0 && completedCount === userHabits.length;
    return userHabits.length > 0 && (heatmapLookup[weekDates[i]] ?? 0) >= userHabits.length;
  };

  const { weeks, monthLabels } = useMemo(() => {
    const start = new Date(TODAY);
    start.setDate(start.getDate() - 90);
    start.setDate(start.getDate() - start.getDay());

    const grid: Array<Array<{ d: string; n: number } | null>> = [];
    const cur = new Date(start);

    for (let w = 0; w < 13; w++) {
      const col: Array<{ d: string; n: number } | null> = [];
      for (let i = 0; i < 7; i++) {
        const ds = cur.toISOString().split('T')[0];
        col.push(cur > TODAY ? null : { d: ds, n: heatmapLookup[ds] ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(col);
    }

    const labels = new Array<string>(grid.length).fill('');
    const seen = new Set<string>();
    grid.forEach((col, wi) => {
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

    return { weeks: grid, monthLabels: labels };
  }, [heatmapLookup]);

  // ── Loading / error screens ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-400 text-lg animate-pulse">Loading your habits…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-stone-400 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const total = userHabits.length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-4 lg:space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-stone-100 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <img
              src={user?.avatarUrl ?? 'https://i.pravatar.cc/150?img=8'}
              alt="avatar"
              className="w-12 h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-offset-2 ring-orange-200 object-cover"
            />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                Hello, {user?.name ?? '…'} 👋
              </h1>
              <p className="text-xs lg:text-sm text-stone-400 mt-0.5">
                {TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="border-l-[3px] border-orange-300 pl-4 py-1 sm:max-w-xs lg:max-w-lg">
            <p className="text-xs lg:text-sm italic text-stone-500 leading-relaxed">"{quote}"</p>
          </div>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-4 lg:gap-6 items-start">

        {/* ── Streak card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-stone-100 p-4 lg:p-6 space-y-4">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
            Current Streak
          </p>

          <div className="flex items-end gap-2">
            <span className="text-7xl lg:text-8xl font-black leading-none" style={{ color: '#FF8C69' }}>
              {streak}
            </span>
            <span className="text-stone-400 font-medium pb-2">days 🔥</span>
          </div>

          {/* Weekly calendar row */}
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map((label, i) => {
              const completed = isDayCompleted(i);
              const isToday   = i === dow;
              const isFuture  = i > dow;
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] lg:text-[10px] text-stone-400">{label}</span>
                  <div
                    className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      completed
                        ? 'text-white'
                        : isFuture || !isToday
                        ? 'bg-stone-100 text-stone-300'
                        : ''
                    }`}
                    style={
                      completed
                        ? { backgroundColor: '#FF8C69', boxShadow: '0 2px 6px rgba(255,140,105,0.35)' }
                        : isToday && !isFuture
                        ? { boxShadow: '0 0 0 2px white, 0 0 0 3.5px #FF8C69', color: '#FF8C69' }
                        : {}
                    }
                  >
                    {completed ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isToday ? (
                      <span style={{ color: '#FF8C69' }} className="font-black text-xs">{TODAY.getDate()}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-50">
            <p className="text-sm text-stone-500">
              <span className="font-bold text-gray-700">{completedCount}</span>
              <span> / {total} done today</span>
            </p>
          </div>
        </div>

        {/* ── Today's Habits ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800">Today's Habits</h2>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
                allDone ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'
              }`}
            >
              {completedCount} / {total}
            </span>
          </div>

          {allDone && (
            <div className="mb-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-600">
                🎉 All habits done — amazing work today!
              </p>
            </div>
          )}

          {total === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400">
              <p className="text-lg mb-1">No habits yet</p>
              <p className="text-sm">Go to <a href="/explore" className="underline">Explore</a> to pick some from the catalog.</p>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {userHabits.map(uh => {
                const log = logs[uh.id];
                const isCompleted = log?.completed ?? false;
                const bg = categoryBg(uh.habit.category);

                return (
                  <div
                    key={uh.id}
                    className={`bg-white rounded-2xl shadow-sm border transition-all ${
                      editingId === uh.id ? 'border-orange-200' : 'border-stone-100'
                    } ${isCompleted ? 'opacity-65' : ''}`}
                  >
                    {/* Main row */}
                    <div className="p-3 lg:p-4 flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl flex-shrink-0 ${bg}`}>
                        {uh.habit.icon ?? '✦'}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-gray-800 text-sm lg:text-base leading-tight ${isCompleted ? 'line-through text-stone-400' : ''}`}>
                          {uh.habit.name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5 truncate">
                          {uh.customTarget != null && uh.habit.unit
                            ? `Target: ${uh.customTarget} ${uh.habit.unit} · `
                            : ''}
                          {uh.habit.category}
                        </p>
                      </div>

                      {/* Action */}
                      {uh.habit.type === 'numeric' ? (
                        isCompleted ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-stone-400">
                              {log?.value}{uh.habit.unit ? ` ${uh.habit.unit}` : ''}
                            </span>
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ backgroundColor: '#4ade80', boxShadow: '0 2px 8px rgba(74,222,128,0.4)' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="number"
                              min={0}
                              value={numericValues[uh.id] ?? ''}
                              onChange={e => setNumericValues(prev => ({ ...prev, [uh.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && logNumeric(uh)}
                              placeholder={uh.habit.unit || '0'}
                              className="w-20 lg:w-24 text-sm border border-stone-200 rounded-xl px-2 lg:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 text-center bg-stone-50"
                            />
                            <button
                              onClick={() => logNumeric(uh)}
                              disabled={!numericValues[uh.id]}
                              className="text-sm font-semibold px-3 lg:px-4 py-2 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#FF8C69' }}
                            >
                              Log
                            </button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => toggleBoolean(uh)}
                          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted
                              ? 'text-white'
                              : 'border-2 border-stone-200 text-transparent hover:border-stone-300'
                          }`}
                          style={
                            isCompleted
                              ? { backgroundColor: '#4ade80', boxShadow: '0 2px 8px rgba(74,222,128,0.4)' }
                              : {}
                          }
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      {/* Pencil edit button */}
                      <button
                        onClick={() => openEdit(uh)}
                        aria-label="Edit habit"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          editingId === uh.id
                            ? 'bg-orange-100 text-orange-500'
                            : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                    </div>

                    {/* Inline edit panel */}
                    {editingId === uh.id && (
                      <div className="px-4 pb-4 pt-1 border-t border-stone-50 flex flex-wrap items-center gap-3">
                        {uh.habit.type === 'numeric' && (
                          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                            <span className="text-xs text-stone-400 whitespace-nowrap">Daily target</span>
                            <input
                              type="number"
                              min={0}
                              value={editTarget}
                              onChange={e => setEditTarget(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveEdit(uh)}
                              placeholder={uh.habit.unit || 'units'}
                              autoFocus
                              className="w-24 text-sm border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 text-center bg-stone-50"
                            />
                            {uh.habit.unit && <span className="text-xs text-stone-400">{uh.habit.unit}</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {uh.habit.type === 'numeric' && (
                            <button
                              onClick={() => saveEdit(uh)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
                              style={{ backgroundColor: '#FF8C69' }}
                            >
                              Save
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmRemoveId(uh.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Heatmap ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-stone-100 p-4 lg:p-6">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
            Activity — Last 3 Months
          </p>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-0">
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
                        title={cell ? `${cell.d}: ${cell.n} / ${total} completed` : ''}
                        className={`w-3 h-3 rounded-[2px] transition-colors ${
                          cell ? heatColor(cell.n, total) : 'opacity-0'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-4 justify-end">
            <span className="text-[10px] text-stone-300 mr-1">Less</span>
            {['bg-stone-100', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500'].map((cls, i) => (
              <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[10px] text-stone-300 ml-1">More</span>
          </div>
        </div>

      </div>

      {/* ── Remove confirmation modal ──────────────────────────────────────── */}
      {confirmRemoveId && (() => {
        const target = userHabits.find(h => h.id === confirmRemoveId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
                  {target?.habit.icon ?? '✦'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Remove habit?</p>
                  <p className="text-sm text-stone-400 mt-0.5">{target?.habit.name}</p>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                This will remove it from your list and delete all logged data for this habit. This can't be undone.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => removeHabit(confirmRemoveId)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 transition-colors"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
