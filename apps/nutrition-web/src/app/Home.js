
import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4 text-emerald-600">
        Track Your Meals. Track Your Progress.
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Simple meal planning with gamified progress tracking
      </p>

      <div className="flex gap-4 justify-center">
        <Link
          to={user ? "/dashboard" : "/login"}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600"
        >
          {user ? "Go to Dashboard" : "Get Started"}
        </Link>
        <Link
          to="/leaderboard"
          className="bg-gray-100 px-6 py-3 rounded-lg hover:bg-gray-200"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}