
import { NextResponse } from 'next/server';
import { getGitHubContext } from '@/lib/github';
import { analyzeGitHubProfile } from '@/lib/gemini';

export async function POST(request) {
  // Step 1 — parse and validate the request body
  const { username } = await request.json();

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Step 2 — fetch GitHub profile + repos + language stats
  let githubContext;
  try {
    githubContext = await getGitHubContext(username);
  } catch {
    return NextResponse.json({ error: `GitHub user not found: ${username}` }, { status: 404 });
  }

  // Step 3 — send the GitHub data to Gemini and get back a markdown analysis
  let analysis;
  try {
    analysis = await analyzeGitHubProfile(githubContext);
  } catch (error) {
    if (error.message === 'QUOTA_EXCEEDED') {
      return NextResponse.json(
        { error: 'Gemini quota exceeded. Try again later or upgrade at https://ai.google.dev/pricing' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate AI analysis.' }, { status: 500 });
  }

  // Step 4 — return everything the frontend needs in one response
  return NextResponse.json({
    success: true,
    data: {
      profile: githubContext.profile,
      repositories: githubContext.repositories,
      languageDistribution: githubContext.languageDistribution,
      aiAnalysis: analysis,
    },
  });
}

