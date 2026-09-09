/**
 * Evaluator Agent (Rt)
 * Formalized from IEEE Paper: "A Multi-Agent Narrative Generation Framework for Dynamic Storytelling"
 *
 * Responsibility:
 * Assesses player conversational decisions against multi-dimensional research rubric dimensions.
 * Evaluates: Empathy (E), Assertiveness (A), Tactical Agency (S), Persona Consistency (1-PCR), and Narrative Coherence.
 * Calculates closed-loop trust delta ΔT and updates running research metrics.
 */

import { callLLM } from './llm.js';
import { addEvaluation } from './narrativeState.js';

const EVALUATOR_SYSTEM_PROMPT = `You are the Evaluator Agent in a 4-Agent Framework (IEEE Research Standard).
Your responsibility is scientifically evaluating the player's conversational input and decision quality across standard social-learning and RPG rubric dimensions.

Scoring Rubric (0 to 100):
1. "empathy" (E): Interpersonal warmth, active listening, polite inquiry, respect for character boundaries and oaths.
2. "assertiveness" (A): Goal-directed clarity, clear intent, confident leadership without being disrespectful.
3. "agency" (S): Tactical problem solving, creative initiative, taking cooperative action.
4. "personaConsistency" (1-PCR): (0 to 100) How well did the NPC maintain persona integrity without persona drift?
5. "narrativeCoherence": (0 to 100) How logically does this interaction fit into the overarching story progression graph?

Psychological Trust Delta Calculation (ΔT):
- If Empathy >= 75 and Agency >= 65: ΔT should be +15 to +25 (High empathy builds deep trust).
- If Empathy is 60-74: ΔT should be +5 to +14 (Moderate positive rapport).
- If Empathy <= 45 or Demanding/Rude: ΔT should be -10 to -20 (Disrespect damages trust).
- Otherwise: ΔT = 0.

Feedback:
- "feedback": Exactly 1 clear sentence analyzing player social-learning quality and tactical effectiveness.
- "academicAnnotation": 1 concise sentence mapping to IEEE Research Questions (RQ1 Coherence, RQ2 Persona Fidelity, RQ3 Empathy Alignment, RQ4 Branching Diversity).

STRICT JSON OUTPUT FORMAT ONLY:
{
  "scores": {
    "empathy": 85,
    "assertiveness": 75,
    "agency": 80
  },
  "personaConsistency": 94,
  "narrativeCoherence": 92,
  "trustDelta": 18,
  "feedback": "Respectful phrasing combined with clear quest direction builds immediate diplomatic trust.",
  "academicAnnotation": "RQ3/RQ4: High empathy prompt triggers positive trust transition in character state."
}`;

/**
 * Execute synchronous or asynchronous Evaluator Agent
 */
export async function runEvaluatorAgent({
  sessionId,
  npcId,
  playerText,
  npcReply,
  action,
  narrativeState = {},
  provider = 'groq',
  model = null
}) {
  const evaluationContext = `Context for Scientific Evaluation:
Session ID: ${sessionId}
Active Character: ${npcId.toUpperCase()}
Current World Flags (Wt): ${JSON.stringify(narrativeState.worldFlags || {})}
Player Input: "${playerText}"
NPC Response: "${npcReply}"
Physical Action Triggered: "${action}"`;

  try {
    const result = await callLLM({
      provider,
      model,
      systemPrompt: EVALUATOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: evaluationContext }]
    });

    if (result.success && result.data) {
      const evalData = {
        scores: {
          empathy: result.data.scores?.empathy ?? 75,
          assertiveness: result.data.scores?.assertiveness ?? 70,
          agency: result.data.scores?.agency ?? 72
        },
        personaConsistency: result.data.personaConsistency ?? 92,
        narrativeCoherence: result.data.narrativeCoherence ?? 90,
        trustDelta: result.data.trustDelta ?? 10,
        feedback: result.data.feedback || 'Decision evaluated successfully against research rubric.',
        academicAnnotation: result.data.academicAnnotation || 'RQ3: Empathy metric aligned with character disposition.',
        agent: 'Evaluator Agent (Rt)',
        providerUsed: result.provider
      };

      const record = addEvaluation(sessionId, {
        npcId,
        playerText,
        npcReply,
        action,
        ...evalData
      });

      return record;
    }
  } catch (err) {
    console.warn('[runEvaluatorAgent] LLM evaluation fallback:', err.message);
  }

  // Deterministic rule heuristic fallback
  const lower = (playerText || '').toLowerCase();
  const hasPolite =
    lower.includes('please') ||
    lower.includes('kindly') ||
    lower.includes('help') ||
    lower.includes('honor') ||
    lower.includes('friend') ||
    lower.includes('respect') ||
    lower.includes('thank') ||
    lower.includes('glad');

  const hasAction =
    lower.includes('follow') ||
    lower.includes('open') ||
    lower.includes('switch') ||
    lower.includes('bridge') ||
    lower.includes('key');

  const isRude =
    (lower.startsWith('follow') || lower.startsWith('open') || lower.startsWith('do ') || lower.startsWith('give ')) &&
    !hasPolite;

  let empathy = hasPolite ? 88 : isRude ? 35 : 65;
  let assertiveness = hasAction ? 80 : 60;
  let agency = hasAction ? 82 : 62;
  let trustDelta = hasPolite ? 16 : isRude ? -12 : 5;

  const fallbackRecord = {
    scores: { empathy, assertiveness, agency },
    personaConsistency: 92,
    narrativeCoherence: 90,
    trustDelta,
    feedback: hasPolite
      ? 'High diplomatic empathy: polite inquiry builds trust and unlocks cooperative actions.'
      : isRude
      ? 'Demanding tone encountered psychological resistance; polite persuasion recommended.'
      : 'Conversational turn evaluated and integrated into formal narrative memory.',
    academicAnnotation: 'RQ3 Social Learning: Evaluator computed deterministic trust adaptation.',
    agent: 'Evaluator Agent (Rt)',
    providerUsed: 'rule_heuristic'
  };

  return addEvaluation(sessionId, {
    npcId,
    playerText,
    npcReply,
    action,
    ...fallbackRecord
  });
}
