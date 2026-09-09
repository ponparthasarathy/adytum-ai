import { NextResponse } from 'next/server';
import { processDialogueRequest } from '@/lib/orchestrator';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      npcId = 'alex',
      playerText = '',
      sessionId = 'default-session',
      modelConfig = {},
      forceOffline = false
    } = body;

    if (!playerText || typeof playerText !== 'string') {
      return NextResponse.json(
        { error: 'playerText is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await processDialogueRequest({
      npcId,
      playerText,
      sessionId,
      modelConfig,
      forceOffline
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/dialogue] Error:', error);
    return NextResponse.json(
      {
        reply: "I hear you, traveler, though the winds carry strange static.",
        action: "none",
        error: error.message
      },
      { status: 500 }
    );
  }
}
