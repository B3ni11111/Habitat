import { useEffect, useState } from 'react';
import api from '../api/axios';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  habitId: string;
  customTarget: number;
  isActive: boolean;
  habit: Habit;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  fitness:      'bg-orange-50 text-orange-500',
  nutrition:    'bg-emerald-50 text-emerald-500',
  mindfulness:  'bg-violet-50 text-violet-500',
  learning:     'bg-sky-50 text-sky-500',
  health:       'bg-rose-50 text-rose-500',
  productivity: 'bg-amber-50 text-amber-500',
  sleep:        'bg-indigo-50 text-indigo-500',
  social:       'bg-pink-50 text-pink-500',
};

function categoryClass(category: string) {
  return CATEGORY_COLORS[(category ?? '').toLowerCase()] ?? 'bg-stone-50 text-stone-500';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HabitsPage() {
  const [catalog, setCatalog]         = useState<Habit[]>([]);
  const [userHabits, setUserHabits]   = useState<UserHabit[]>([]);
  const [adding, setAdding]           = useState<string | null>(null); // habitId being added
  const [targetInput, setTargetInput] = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([api.get('/habits/catalog'), api.get('/user-habits')])
      .then(([catalogRes, userHabitsRes]) => {
        setCatalog(catalogRes.data);
        setUserHabits(userHabitsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const addedHabitIds = new Set(userHabits.map(uh => uh.habitId));

  const startAdd = (habitId: string) => {
    setAdding(habitId);
    setTargetInput('');
  };

  const confirmAdd = async (habit: Habit) => {
    const customTarget = targetInput ? parseFloat(targetInput) : undefined;
    const res = await api.post('/user-habits', {
      habitId: habit.id,
      customTarget: isNaN(customTarget as number) ? undefined : customTarget,
    });
    setUserHabits(prev => [...prev, res.data]);
    setAdding(null);
  };

  const removeUserHabit = async (id: string) => {
    if (!confirm('Remove this habit from your list?')) return;
    await api.delete(`/user-habits/${id}`);
    setUserHabits(prev => prev.filter(uh => uh.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-400 text-lg animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 pt-8 pb-16">
      <div className="grid grid-cols-[1fr_1fr] gap-8 items-start">

        {/* ── Your Habits ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-800">Your Active Habits</h2>
            <span className="text-sm px-3 py-1 bg-stone-100 text-stone-400 rounded-full font-semibold">
              {userHabits.length}
            </span>
          </div>

          {userHabits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400">
              <p>No habits tracked yet.</p>
              <p className="text-sm mt-1">Pick some from the catalog →</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userHabits.map(uh => (
                <div
                  key={uh.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${categoryClass(uh.habit.category).split(' ')[0]}`}>
                    {uh.habit.icon ?? '✦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{uh.habit.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {uh.customTarget != null && uh.habit.unit
                        ? `Target: ${uh.customTarget} ${uh.habit.unit} · `
                        : ''}
                      {uh.habit.type === 'boolean' ? 'Daily check-in' : `Numeric · ${uh.habit.unit || ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryClass(uh.habit.category)}`}>
                      {uh.habit.category}
                    </span>
                    <button
                      onClick={() => removeUserHabit(uh.id)}
                      className="text-xs text-stone-300 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Habit Catalog ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-800">Habit Catalog</h2>
            <span className="text-sm px-3 py-1 bg-stone-100 text-stone-400 rounded-full font-semibold">
              {catalog.length}
            </span>
          </div>

          <div className="space-y-3">
            {catalog.map(habit => {
              const alreadyAdded = addedHabitIds.has(habit.id);
              const isExpanded   = adding === habit.id;

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${categoryClass(habit.category).split(' ')[0]}`}>
                      {habit.icon ?? '✦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{habit.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {habit.type === 'boolean'
                          ? 'Daily check-in'
                          : `Numeric · ${habit.unit || 'units'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryClass(habit.category)}`}>
                        {habit.category}
                      </span>
                      {alreadyAdded ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-300">
                          Added ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => isExpanded ? setAdding(null) : startAdd(habit.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all"
                          style={{ backgroundColor: isExpanded ? '#d1d5db' : '#FF8C69' }}
                        >
                          {isExpanded ? 'Cancel' : '+ Add'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline target input */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-3">
                      {habit.type === 'numeric' && (
                        <input
                          type="number"
                          min={0}
                          value={targetInput}
                          onChange={e => setTargetInput(e.target.value)}
                          placeholder={`Daily target (${habit.unit || 'units'})`}
                          className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50"
                          autoFocus
                        />
                      )}
                      {habit.type === 'boolean' && (
                        <p className="flex-1 text-sm text-stone-400">
                          This habit is a simple daily check-in — no target needed.
                        </p>
                      )}
                      <button
                        onClick={() => confirmAdd(habit)}
                        className="text-sm font-semibold px-4 py-2 rounded-xl text-white flex-shrink-0"
                        style={{ backgroundColor: '#FF8C69' }}
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
