"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function UserDashboard({ params }) {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => setUsername(p.username));
  }, [params]);

  const fetchData = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to analyze");
      setData(result.data);

      try {
        const history = JSON.parse(
          localStorage.getItem("devpulse_history") || "[]",
        );
        const updated = [
          { username: user, date: new Date().toISOString() },
          ...history.filter((h) => h.username !== user),
        ].slice(0, 10);
        localStorage.setItem("devpulse_history", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchData(username);
  }, [username]);

  if (loading)
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#020617] font-sans">
        <div className="w-8 h-8 border-[2px] border-slate-700 border-t-[#4ACABD] rounded-full animate-spin" />
        <p className="text-slate-100 text-sm uppercase tracking-[0.2em] font-medium">
          Decrypting Profile
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 bg-[#020617] font-sans text-center">
        <p className="text-red-400 font-mono text-sm border border-red-900/40 bg-red-900/20 px-6 py-3 rounded-lg max-w-md">
          {error}
        </p>
        <button
          onClick={() => fetchData(username)}
          className="text-[#4ACABD] text-sm uppercase tracking-widest hover:text-white transition-colors underline underline-offset-8"
        >
          Retry Connection
        </button>
      </div>
    );

  if (!data) return null;

  const { profile, repositories, languageDistribution, aiAnalysis } = data;

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 font-sans selection:bg-[#4ACABD]/30">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {/* Nav */}
        <nav className="flex justify-between items-center text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
          <button
            onClick={() => router.push("/")}
            className="hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <button
            onClick={() => fetchData(username)}
            className="hover:text-[#4ACABD] transition-colors flex items-center gap-2"
          >
            Refresh
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m0 0A7.5 7.5 0 1021 12.5c0-4.142-3.358-7.5-7.5-7.5-1.61 0-3.11.5-4.318 1.354"
              />
            </svg>
          </button>
        </nav>

        {/* Profile Identity */}
        <header className="flex flex-col md:flex-row gap-12 items-start md:items-center">
          <div className="relative shrink-0">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={130}
              height={130}
              className="relative rounded-full border-2 border-slate-800 p-1 bg-[#020617]"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-5xl font-medium text-white tracking-tight leading-none">
                {profile.name}
              </h1>
              <p className="text-[#4ACABD] font-mono text-lg mt-2 font-bold">
                @{profile.username}
              </p>
            </div>
            <p className="text-slate-200 text-xl max-w-2xl font-light leading-relaxed">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-8 text-sm uppercase tracking-widest text-slate-400 font-bold">
              <span className="flex items-center gap-2">
                {profile.followers} Followers
              </span>
              <span className="flex items-center gap-2 border-l border-slate-800 pl-8">
                {profile.public_repos} Repos
              </span>
              {profile.location && (
                <span className="flex items-center gap-2 border-l border-slate-800 pl-8">
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Tech DNA */}
        <section className="space-y-12">
          <h3 className="text-sm uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-slate-700" /> LANGUAGES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-12">
            {languageDistribution.map((lang, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-base font-mono mb-4">
                  <span className="text-white font-bold group-hover:text-[#4ACABD] transition-colors">
                    {lang.language}
                  </span>
                  <span className="text-slate-400">{lang.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-[3px] relative overflow-hidden rounded-full">
                  <div
                    className="absolute top-0 left-0 bg-[#4ACABD] h-full transition-all duration-1000 ease-out shadow-[0_0_10px_#4ACABD]"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Repositories */}
        <section className="space-y-12">
          <h3 className="text-sm uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-slate-700" /> Top Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repositories.map((repo, i) => (
              <a
                key={i}
                href={repo.url}
                target="_blank"
                className="group p-8 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-[#50A2FF]/50 hover:bg-slate-900/60 transition-all duration-500 flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <h4 className="text-white text-xl font-bold tracking-tight group-hover:text-[#50A2FF] transition-colors">
                    {repo.name}
                  </h4>
                  <p className="text-slate-300 text-base mt-4 line-clamp-2 leading-relaxed font-light">
                    {repo.description || "Production project."}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold tracking-tighter text-slate-400 mt-8">
                  <span className="text-[#4ACABD] uppercase bg-[#4ACABD]/10 px-2 py-0.5 rounded">
                    {repo.language || "Code"}
                  </span>
                  <div className="flex gap-4">
                    <span>★ {repo.stargazers_count}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* AI Analysis: Now Perfectly Centered */}
        <section className="pt-5 text-center flex flex-col items-center">
          <div className="max-w-5xl text-left mx-auto w-full">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-[#4ACABD] text-2xl font-medium tracking-tight mt-20 mb-10 border-b border-slate-800 pb-5 text-center">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[#50A2FF] text-xs uppercase tracking-[0.3em] font-black mt-14 mb-8 text-center md:text-left">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-200 text-md leading-[1.8] mb-10 font-light">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-8 mb-16 max-w-3xl mx-auto">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-6 text-slate-200 text-md font-light leading-relaxed text-left">
                    <span className="text-[#4ACABD] mt-2 text-md">→</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-bold tracking-tight">
                    {children}
                  </strong>
                ),
              }}
            >
              {aiAnalysis}
            </ReactMarkdown>
          </div>
        </section>
      </div>
    </div>
  );
}
