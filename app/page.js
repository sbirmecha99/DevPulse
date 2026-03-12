// ─────────────────────────────────────────────────────────
// app/page.js
// Home page — search form and navigation to the dashboard.
// ─────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";

// Hardcoded example accounts to help first-time visitors try the app.
const EXAMPLES = ["torvalds", "gaearon", "tj", "sindresorhus"];

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [recentSearches, setRecentSearches] = useState([]); // starts empty (no localStorage on server)

  useEffect(() => {
    // Read history from localStorage only on the client, inside useEffect, so the
    // initial server render and client render both start with [] and don't mismatch.
    // startTransition marks the state update as low-priority (avoids hydration warning).
    try {
      const stored = localStorage.getItem("devpulse_history");
      if (stored)
        startTransition(() =>
          setRecentSearches(JSON.parse(stored).slice(0, 5)),
        );
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  // Navigate to the dashboard for a given username.
  const go = (user) => router.push(`/user/${user}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) go(username.trim());
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-950 text-white px-6 md:px-16">
      {/* Left: Hand-drawn vector image */}
      <div className="flex items-center justify-center w-full md:w-1/2 h-[40vh] md:h-screen bg-gray-950 pt-8 md:pt-0 pb-8 md:pb-0 md:pr-8 md:pl-28">
        <img
          src="/hand-drawn-flat-design-devops-illustration.png"
          alt="DevPulse hand-drawn illustration"
          className="w-full max-w-3xl object-contain"
          style={{ filter: "grayscale(0.2)", opacity: 0.98 }}
        />
      </div>
      {/* Right: Content section */}
      <div className="flex flex-col justify-center w-full md:w-1/2 h-auto md:h-screen md:pl-23 md:pr-0 space-y-10">
        <div>
          <h1
            className="text-5xl font-extrabold tracking-tight mb-4 font-sans"
            style={{ letterSpacing: "-0.03em" }}
          >
            Dev-Pulse <span className="text-[#4ACABD]">AI</span>
          </h1>
          <p className="text-gray-300 text-lg font-light mb-2 font-serif">
            GitHub profile analyzer powered by Gemini AI
          </p>
        </div>
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="w-60 px-3 py-2 bg-gray-900 border border-gray-800 text-white placeholder-gray-500 rounded focus:outline-none focus:border-blue-500 text-base font-mono"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="px-5 py-2 bg-[#4ACABD] text-black rounded hover:bg-[#3aa6a0] disabled:opacity-100 font-semibold text-base font-sans"
          >
            Analyze
          </button>
        </form>
        {/* Recent Searches — persisted in localStorage across sessions */}
        {recentSearches.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2 font-mono">Recent</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s.username}
                  onClick={() => go(s.username)}
                  className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-gray-300 hover:text-white transition font-mono"
                >
                  @{s.username}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Example Usernames — quick-start buttons for first-time users */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">Examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((u) => (
              <button
                key={u}
                onClick={() => go(u)}
                className="px-3 py-1 bg-gray-900 border border-[#4ACABD] rounded text-sm text-[#4ACABD] hover:text-[#3aa6a0] transition font-mono"
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
