export default function FriendsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-8 pt-8 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Friends</h1>
        <p className="text-sm text-stone-400 mt-1">See how your friends are doing with their habits.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-16 text-center text-stone-400">
        <p className="text-4xl mb-4">👥</p>
        <p className="font-semibold text-gray-700 text-lg">Coming soon</p>
        <p className="text-sm mt-2 max-w-xs mx-auto">
          Social features are on the roadmap. You'll be able to follow friends and compete on streaks.
        </p>
      </div>
    </div>
  );
}
