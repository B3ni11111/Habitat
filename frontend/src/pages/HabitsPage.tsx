import { useEffect, useState, FormEvent } from 'react';
import api from '../api/axios';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  category?: Category;
  categoryId?: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', categoryId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/habits'), api.get('/categories')])
      .then(([h, c]) => {
        setHabits(h.data);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingHabit(null);
    setForm({ name: '', description: '', frequency: 'daily', categoryId: '' });
    setShowForm(true);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setForm({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      categoryId: habit.categoryId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, categoryId: form.categoryId || undefined };
    if (editingHabit) {
      const res = await api.patch(`/habits/${editingHabit.id}`, payload);
      setHabits((prev) => prev.map((h) => (h.id === editingHabit.id ? res.data : h)));
    } else {
      const res = await api.post('/habits', payload);
      setHabits((prev) => [res.data, ...prev]);
    }
    setShowForm(false);
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit?')) return;
    await api.delete(`/habits/${id}`);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Habits</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Habit
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {editingHabit ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No habits yet. Click "Add Habit" to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {habit.category && (
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.category.color }} />
                )}
                <div>
                  <p className="font-medium text-gray-800">{habit.name}</p>
                  {habit.description && <p className="text-sm text-gray-400">{habit.description}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  habit.frequency === 'daily' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {habit.frequency}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(habit)}
                  className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-sm px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
