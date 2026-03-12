// ─────────────────────────────────────────────
// lib/github.js
// Talks to the GitHub REST API.
// Only this file should ever call api.github.com.
// ─────────────────────────────────────────────

const GITHUB_API_BASE = 'https://api.github.com';

// Build the request headers.
// If GITHUB_TOKEN is set in .env.local, we get 5000 req/hr instead of 60.
function getHeaders() {
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'DevPulse-AI' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

// Generic helper — fetch a URL and return the parsed JSON, or throw on error.
async function fetchJSON(url) {
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

// Fetch basic info about a user (name, bio, avatar, etc.).
async function getUserProfile(username) {
  const d = await fetchJSON(`${GITHUB_API_BASE}/users/${username}`);
  return {
    name: d.name || d.login,
    username: d.login,
    avatar: d.avatar_url,
    bio: d.bio || 'No bio available',
    followers: d.followers || 0,
    following: d.following || 0,
    public_repos: d.public_repos || 0,
    location: d.location || 'Unknown',
    github_url: d.html_url,
    created_at: d.created_at,
  };
}

// Fetch the user's repos sorted by stars.
// We grab 30 from the API, drop any forks, then keep only the top 5.
async function getUserRepositories(username) {
  const repos = await fetchJSON(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=stars&direction=desc&per_page=30`
  );
  return repos
    .filter(r => !r.fork)          // ignore forks — they're not the user's own work
    .slice(0, 5)                   // keep only top 5
    .map(r => ({
      name: r.name,
      description: r.description || 'No description',
      stargazers_count: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      language: r.language || 'Unknown',
      updated_at: r.updated_at,
      url: r.html_url,
    }));
}

// Count how many repos use each language, then turn it into percentages.
// e.g. 3 JS repos out of 5 → JavaScript 60%
function getLanguageDistribution(repos) {
  const counts = {};
  let total = 0;
  repos.forEach(r => {
    if (r.language && r.language !== 'Unknown') {
      counts[r.language] = (counts[r.language] || 0) + 1;
      total++;
    }
  });
  return Object.entries(counts)
    .map(([language, count]) => ({ language, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);
}

// Main export used by the API route.
// Fetches profile + repos in parallel (faster than one-by-one),
// then computes language stats from those repos.
export async function getGitHubContext(username) {
  const [profile, repositories] = await Promise.all([
    getUserProfile(username),
    getUserRepositories(username),
  ]);
  return { profile, repositories, languageDistribution: getLanguageDistribution(repositories) };
}

