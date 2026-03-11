// ─────────────────────────────────────────────────────────────────────────────
// app/user/[username]/page.js
// Dashboard page — fetches data from the API and renders the full analysis.
//
// Render lifecycle:
//   1. Mount with username=null → resolve async params → set username
//   2. username set → fetchData() → POST /api/analyze
//   3. While waiting  → show spinner
//   4. On error       → show error + retry/back buttons
//   5. On success     → render profile card, language bars, repos, AI analysis
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function UserDashboard({ params }) {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Next.js 15+ makes `params` a Promise instead of a plain object.
  // We unwrap it once with Promise.resolve so the same code works in both
  // Next.js 14 (sync params) and 15+ (async params).
  useEffect(() => {
    Promise.resolve(params).then(p => setUsername(p.username));
  }, [params]);

  const fetchData = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to analyze');
      setData(result.data);

      // Persist this search to localStorage so the home page can show "Recent".
      // We keep at most 10 entries and de-duplicate by username.
      try {
        const history = JSON.parse(localStorage.getItem('devpulse_history') || '[]');
        const updated = [
          { username: user, date: new Date().toISOString() },
          ...history.filter(h => h.username !== user),
        ].slice(0, 10);
        localStorage.setItem('devpulse_history', JSON.stringify(updated));
      } catch { /* ignore — localStorage may be unavailable */ }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger the fetch as soon as we know the username.
  useEffect(() => { if (username) fetchData(username); }, [username]);

  // --- Loading ---
  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Analyzing {username}...</p>
    </div>
  );

  // --- Error ---
  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-red-400 text-center">{error}</p>
      <div className="flex gap-3">
        <button onClick={() => fetchData(username)} className="px-4 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700">Retry</button>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700">Go Back</button>
      </div>
    </div>
  );

  if (!data) return null;

  const { profile, repositories, languageDistribution, aiAnalysis } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Nav */}
        <div className="flex justify-between text-sm text-gray-400">
          <button onClick={() => router.push('/')} className="hover:text-white">← Back</button>
          <button onClick={() => fetchData(username)} className="hover:text-white">↻ Refresh</button>
        </div>

        {/* Profile */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex gap-4 items-start">
          <Image src={profile.avatar} alt={profile.name} width={72} height={72} className="rounded-full shrink-0" />
          <div>
            <h2 className="text-lg font-bold">{profile.name}</h2>
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm">@{profile.username}</a>
            <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span>{profile.followers} followers</span>
              <span>{profile.public_repos} repos</span>
              {profile.location && <span>{profile.location}</span>}
            </div>
          </div>
        </div>

        {/* Languages + Repos */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Languages */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Languages</h3>
            <div className="space-y-3">
              {languageDistribution.map((lang, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{lang.language}</span>
                    <span>{lang.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded" style={{ width: `${lang.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repositories */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Top Repositories</h3>
            <div className="space-y-4">
              {repositories.map((repo, i) => (
                <div key={i}>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    {repo.name}
                  </a>
                  <p className="text-gray-500 text-xs mt-0.5">{repo.description}</p>
                  <div className="flex gap-3 text-xs text-gray-600 mt-1">
                    {repo.language && <span>{repo.language}</span>}
                    <span>★ {repo.stargazers_count}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Analysis */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="font-semibold mb-4">AI Career Analysis</h3>
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-white font-semibold mt-4 mb-1">{children}</h2>,
              p: ({ children }) => <p className="text-gray-400 text-sm mb-2">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 mb-2">{children}</ul>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="text-white">{children}</strong>,
            }}
          >
            {aiAnalysis}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}


