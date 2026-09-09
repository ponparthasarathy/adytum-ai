import { NextResponse } from 'next/server';

export async function GET() {
  const providers = {
    groq: !!process.env.GROQ_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    xai: !!process.env.XAI_API_KEY
  };

  return NextResponse.json({
    status: 'ok',
    engine: 'IEEE 4-Agent Narrative Framework v2.0',
    timestamp: new Date().toISOString(),
    providers,
    fourAgents: {
      narrativeAgent: 'Global Plot Arc, Tension & Milestone Pacing (Nt)',
      characterAgent: 'Isolated Persona, Memory Streams & Empathy Deliberation (Ct)',
      worldStateAgent: 'Physical Consistency, Spatial Affordances & Causality Validation (Wt)',
      evaluatorAgent: 'Real-time IEEE Rubric Evaluation & Dynamic Trust Scoring (Rt)'
    }
  });
}
