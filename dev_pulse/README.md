# Dev-Pulse AI

A Next.js web app that reads any GitHub profile and produces an AI-powered career analysis using Google Gemini. Type in a GitHub username, wait a few seconds, and get a developer persona, key strengths, skill gaps, career advice, and project ideas — all rendered from live data.

---

## How it works

```
User types username
        │
        ▼
app/page.js
  search form → router.push(/user/<username>)

        │
        ▼
app/user/[username]/page.js
  POST /api/analyze  { username }

        │
        ▼
app/api/analyze/route.js
  1. validate username
  2. getGitHubContext(username)         ← lib/github.js
  3. analyzeGitHubProfile(context)      ← lib/gemini.js
  4. return JSON { profile, repositories, languageDistribution, aiAnalysis }

        │
        ▼
Dashboard renders:
  • Profile card (avatar, bio, stats)
  • Language distribution bars
  • Top 5 repositories
  • AI analysis (rendered as Markdown)
```

---

## File structure

```
dev_pulse/
├── app/
│   ├── page.js                     # Home page — search form + recent searches
│   ├── layout.js                   # Root layout (sets metadata, loads globals.css)
│   ├── globals.css                 # Tailwind import + body background
│   ├── user/
│   │   └── [username]/
│   │       └── page.js             # Dashboard — fetches data, renders everything
│   └── api/
│       └── analyze/
│           └── route.js            # POST /api/analyze — orchestrates the whole flow
├── lib/
│   ├── github.js                   # GitHub REST API helpers
│   └── gemini.js                   # Google Gemini AI helpers + retry / fallback logic
├── next.config.mjs                 # Allows next/image to load avatars.githubusercontent.com
├── .env.local                      # API keys (you create this — see Setup below)
└── package.json
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd dev_pulse
npm install
```

### 2. Create `.env.local`

Create a file called `.env.local` in the `dev_pulse/` folder (it stays local and is never committed):

```env
# Required — your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional but recommended — raises GitHub rate limit from 60 → 5000 req/hr
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting the API keys

| Key | Where to get it | Free tier |
|---|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | Yes |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens (classic). No scopes needed for public repos. | Yes |

---

## How each file works

### `lib/github.js`
Talks to the GitHub REST API. Exports one function: `getGitHubContext(username)`.

Internally it runs `getUserProfile` and `getUserRepositories` in **parallel** with `Promise.all` to save time, then calculates `getLanguageDistribution` from the repo list. Only the top 5 non-fork repos (sorted by stars) are returned. If `GITHUB_TOKEN` is set, it is added as a Bearer header, raising the rate limit from 60 to 5000 requests/hour.

### `lib/gemini.js`
Talks to Google Gemini. Exports one function: `analyzeGitHubProfile(githubContext)`.

It tries three models in order: `gemini-3-flash-preview` → `gemini-2.0-flash` → `gemini-2.0-flash-lite`. If a model returns a 429 (rate limit), it waits the number of seconds Gemini suggests and retries once. If the retry also fails, it moves to the next model. If all models are exhausted it throws `QUOTA_EXCEEDED`.

### `app/api/analyze/route.js`
The only server-side endpoint. Validates the incoming username, calls `getGitHubContext`, then calls `analyzeGitHubProfile`, and returns everything as one JSON response. GitHub errors go back as 404; quota errors go back as 429; all other AI errors go back as 500.

### `app/page.js`
The home page. Renders a text input and an "Analyze" button. On submit it navigates to `/user/<username>`. Recent searches are read from `localStorage` inside a `useEffect` (not during initial render) to avoid a React hydration mismatch. `startTransition` marks that state update as low-priority so React does not warn.

### `app/user/[username]/page.js`
The dashboard. On mount it unwraps the route `params` (Next.js 15+ makes this a Promise), then immediately calls `fetchData()`. The page has three render states: **loading** (spinner), **error** (message + Retry/Back buttons), **success** (full dashboard). The AI analysis is rendered with `react-markdown` so the headings and bullet points from Gemini display correctly.

---

## Tech stack

| Tool | Purpose |
|---|---|
| Next.js (App Router) | Framework, routing, API routes |
| Tailwind CSS v4 | Styling |
| `@google/generative-ai` | Gemini SDK |
| `react-markdown` | Render AI markdown output |
| `next/image` | Optimised GitHub avatar images |
