// ─────────────────────────────────────────────────────────
// app/page.js
// Home page — search form and navigation to the dashboard.
// ─────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';

// Hardcoded example accounts to help first-time visitors try the app.
const EXAMPLES = ['torvalds', 'gaearon', 'tj', 'sindresorhus'];

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);  // starts empty (no localStorage on server)

  useEffect(() => {
    // Read history from localStorage only on the client, inside useEffect, so the
    // initial server render and client render both start with [] and don't mismatch.
    // startTransition marks the state update as low-priority (avoids hydration warning).
    try {
      const stored = localStorage.getItem('devpulse_history');
      if (stored) startTransition(() => setRecentSearches(JSON.parse(stored).slice(0, 5)));
    } catch { /* ignore corrupt data */ }
  }, []);

  // Navigate to the dashboard for a given username.
  const go = (user) => router.push(`/user/${user}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) go(username.trim());
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">

        <div>
          <h1 className="text-3xl font-bold">Dev-Pulse AI</h1>
          <p className="text-gray-400 mt-1 text-sm">GitHub profile analyzer powered by Gemini AI</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Analyze
          </button>
        </form>

        {/* Recent Searches — persisted in localStorage across sessions */}
        {recentSearches.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Recent</p>
            <div className="flex flex-wrap justify-center gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s.username}
                  onClick={() => go(s.username)}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 hover:text-white"
                >
                  @{s.username}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Example Usernames — quick-start buttons for first-time users */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Examples</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((u) => (
              <button
                key={u}
                onClick={() => go(u)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-blue-400 hover:text-blue-300"
              >
                @{u}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


