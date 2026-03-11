// ─────────────────────────────────────────────
// lib/gemini.js
// Talks to the Google Gemini AI API.
// Only this file should ever call the Gemini SDK.
// ─────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';

// Model priority list. We try the first one; if it's rate-limited or
// unavailable we automatically fall back to the next one.
const MODELS = ['gemini-3-flash-preview', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

// Build the text prompt we send to Gemini.
// We pass in a short summary of the GitHub data so the prompt stays small.
function buildPrompt({ profile, repositories, languageDistribution }) {
  const repos = repositories.slice(0, 3)
    .map(r => `- ${r.name}: ${r.description} (${r.language}, ⭐${r.stargazers_count})`)
    .join('\n');
  const langs = languageDistribution.slice(0, 5)
    .map(l => `${l.language} ${l.percentage}%`)
    .join(', ');

  return `You are a developer career coach. Analyze this GitHub profile and respond in markdown.

Name: ${profile.name} | Repos: ${profile.public_repos} | Followers: ${profile.followers}
Bio: ${profile.bio}
Languages: ${langs}
Top repos:
${repos}

Provide:
## 🎯 Developer Persona
One of: Frontend Specialist, Backend Engineer, Full Stack Developer, DevOps Engineer, Mobile Developer, Data Engineer, Open Source Contributor. Brief reason.

## 💪 Key Strengths
3-4 bullet points.

## 📊 Skill Gaps
2-3 bullet points.

## 🚀 Career Advice
2-3 sentences of actionable advice.

## 💡 Suggested Projects
3 project ideas with name, one-line description, and tech stack. Be concise.`;
}

// Simple promise-based sleep helper used for rate-limit retries.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Parse how many seconds Gemini says to wait from the error message.
// e.g. "Please retry in 32s" → 34000 ms (adds 2s buffer)
function retryDelay(msg) {
  const match = msg.match(/retry in (\d+)/i);
  return match ? (parseInt(match[1]) + 2) * 1000 : 35000;
}

// Main export used by the API route.
// Loops through MODELS. For each model:
//   - On success → return the AI text immediately
//   - On 429 (rate limit) → wait the suggested delay, retry once, then try next model
//   - On 404 (model not found) → try next model
//   - On any other error → throw AI_ERROR immediately
// If all models fail → throw QUOTA_EXCEEDED
export async function analyzeGitHubProfile(githubContext) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = buildPrompt(githubContext);

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return (await model.generateContent(prompt)).response.text();
    } catch (error) {
      const msg = error?.message || '';
      const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
      const is404 = msg.includes('404') || msg.includes('not found') || msg.includes('not supported');

      if (is429) {
        // Wait and retry once before giving up on this model
        await sleep(retryDelay(msg));
        try {
          return (await genAI.getGenerativeModel({ model: modelName }).generateContent(prompt)).response.text();
        } catch { continue; } // still failing after retry → try next model
      }
      if (is404) continue; // model doesn't exist in this region → try next
      throw new Error('AI_ERROR');
    }
  }

  throw new Error('QUOTA_EXCEEDED');
}

