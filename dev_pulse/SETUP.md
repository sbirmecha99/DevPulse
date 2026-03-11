# Dev-Pulse AI - Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install Dependencies
The required packages should already be installed. If not, run:
```bash
npm install
```

### Step 2: Configure Gemini API Key

**IMPORTANT**: You must configure your Google Gemini API key for the application to work.

1. Create a `.env.local` file in the root directory
2. Add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

**To get a free Gemini API key:**
- Visit: https://ai.google.dev/
- Sign in with your Google account
- Click "Get API Key"
- Create a new API key
- Copy it to your `.env.local` file

### Step 3: Run the Development Server
```bash
npm run dev
```

Open http://localhost:3000

### Step 4: Test the Application

Try searching for these GitHub usernames:
- `torvalds` (Linus Torvalds)
- `gaearon` (Dan Abramov)
- `tj` (TJ Holowaychuk)
- `sindresorhus` (Sindre Sorhus)

## 📁 Project Structure

```
dev_pulse/
├── app/
│   ├── api/analyze/route.js       # AI analysis API endpoint
│   ├── user/[username]/page.js    # Dynamic dashboard
│   ├── globals.css                # Global styles
│   ├── layout.js                  # Root layout
│   └── page.js                    # Homepage
├── components/
│   ├── AISummaryCard.js           # AI analysis renderer
│   ├── LanguageStats.js           # Language visualization
│   ├── LoadingState.js            # Loading animations
│   ├── ProfileCard.js             # GitHub profile display
│   ├── RepoList.js                # Repository list
│   └── SearchBar.js               # Search input
├── lib/
│   ├── gemini.js                  # Gemini AI integration
│   └── github.js                  # GitHub API integration
├── .env.local                     # Environment variables (YOU NEED TO CREATE THIS)
├── .env.local.example             # Example env file
└── package.json
```

## 🔧 Features Implemented

✅ GitHub profile and repository fetching
✅ Programming language distribution analysis
✅ AI-powered career analysis using Gemini
✅ Developer persona identification
✅ Skill gap analysis
✅ Project recommendations
✅ Search history using localStorage
✅ Responsive modern UI with Tailwind CSS
✅ Markdown rendering for AI output
✅ Loading states and error handling

## 🎯 How to Use

1. **Homepage**: Enter any GitHub username
2. **Dashboard**: View profile, repos, language stats, and AI analysis
3. **AI Insights**: Read personalized career advice
4. **History**: Recently searched profiles are saved

## ⚠️ Important Notes

- **API Key Required**: The app won't work without a valid Gemini API key
- **GitHub Rate Limits**: GitHub API has rate limits (60 requests/hour without auth)
- **Internet Required**: All data is fetched in real-time
- **Modern Browser**: Requires a browser that supports localStorage

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY is not configured"
**Solution**: Create `.env.local` file with your API key, then restart the server

### Error: "User not found"
**Solution**: Check the GitHub username spelling and ensure the profile is public

### Styling looks broken
**Solution**: Clear browser cache and ensure Tailwind CSS is set up correctly

### API calls failing
**Solution**: Check your internet connection and verify API key is valid

## 📝 Development Guidelines

This project uses:
- **JavaScript only** (no TypeScript)
- **Next.js App Router** (not Pages Router)
- **Client Components** ('use client' directive)
- **No external database** (localStorage only)
- **Clean, commented code** (beginner-friendly)

## 🚀 Production Deployment

To deploy to Vercel:

1. Push code to GitHub
2. Import repository in Vercel
3. Add `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy!

## 📚 Learning Resources

- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Google Gemini AI: https://ai.google.dev/docs
- GitHub API: https://docs.github.com/en/rest

---

**Need Help?** Check the main README.md for more details.
