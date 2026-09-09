import { NextResponse } from 'next/server';
import { generateScenarioFromPrompt } from '@/lib/storyGenerator';
import { setCustomScenario } from '@/lib/narrativeState';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { promptText = '', sessionId = 'rpg-session-1', modelConfig = {} } = body;

    // Generate dynamic scenario via Gemini / LLM
    const scenario = await generateScenarioFromPrompt(promptText, modelConfig);

    // Save into formal narrative state St
    const newState = setCustomScenario(sessionId, scenario);

    return NextResponse.json({
      success: true,
      scenario,
      session: newState
    });
  } catch (error) {
    console.error('Failed to generate story:', error);
    return NextResponse.json({ error: error.message || 'Story generation failed' }, { status: 500 });
  }
}
