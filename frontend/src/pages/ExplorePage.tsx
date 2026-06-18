import { useEffect, useState } from 'react';
import api from '../api/axios';

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

export default function ExplorePage() {
  const [catalog, setCatalog]         = useState<Habit[]>([]);
  const [userHabits, setUserHabits]   = useState<UserHabit[]>([]);
  const [adding, setAdding]           = useState<string | null>(null);
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
  const unexplored = catalog.filter(h => !addedHabitIds.has(h.id));

  const startAdd = (habitId: string) => {
    setAdding(habitId);
    setTargetInput('');
  };

  const confirmAdd = async (habit: Habit) => {
    const parsed = parseFloat(targetInput);
    const customTarget = isNaN(parsed) ? undefined : parsed;
    const res = await api.post('/user-habits', { habitId: habit.id, customTarget });
    setUserHabits(prev => [...prev, res.data]);
    setAdding(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-400 text-lg animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-8 pt-8 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Explore Habits</h1>
        <p className="text-sm text-stone-400 mt-1">
          {unexplored.length === 0
            ? 'You\'ve added every available habit — great work!'
            : `${unexplored.length} habit${unexplored.length !== 1 ? 's' : ''} available to add`}
        </p>
      </div>

      {unexplored.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-gray-700">All habits added!</p>
          <p className="text-sm mt-1">Check your Dashboard to log today's progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unexplored.map(habit => {
            const isExpanded = adding === habit.id;
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
                    <button
                      onClick={() => isExpanded ? setAdding(null) : startAdd(habit.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all"
                      style={{ backgroundColor: isExpanded ? '#d1d5db' : '#FF8C69' }}
                    >
                      {isExpanded ? 'Cancel' : '+ Add'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-3">
                    {habit.type === 'numeric' ? (
                      <input
                        type="number"
                        min={0}
                        value={targetInput}
                        onChange={e => setTargetInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && confirmAdd(habit)}
                        placeholder={`Daily target (${habit.unit || 'units'})`}
                        className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50"
                        autoFocus
                      />
                    ) : (
                      <p className="flex-1 text-sm text-stone-400">
                        This is a daily check-in — no target needed.
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
      )}
    </div>
  );
}
