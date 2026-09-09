import { NextResponse } from 'next/server';
import { getSession, resetSession, getAllSessions } from '@/lib/narrativeState';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default-session';
    const all = searchParams.get('all');

    if (all === 'true') {
      return NextResponse.json({ sessions: getAllSessions() });
    }

    const session = getSession(sessionId);
    return NextResponse.json({
      sessionId,
      version: session.version,
      activeScenario: session.activeScenario,
      worldFlags: session.worldFlags,
      sceneNodes: session.sceneNodes,
      transitions: session.transitions,
      userActions: session.userActions,
      characterMemories: session.characterMemories,
      evaluations: session.evaluations,
      agentTraces: session.agentTraces,
      aggregateMetrics: session.aggregateMetrics
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = 'reset', sessionId = 'default-session' } = body;

    if (action === 'reset') {
      const resetState = resetSession(sessionId);
      return NextResponse.json({ message: 'Session reset successfully', session: resetState });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
