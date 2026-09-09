/**
 * Narrative Agent (Nt)
 * Formalized from IEEE Paper: "A Multi-Agent Narrative Generation Framework for Dynamic Storytelling"
 *
 * Responsibility:
 * Directs global plot pacing, milestone scene graph nodes (Vt), directed branch edges (Et),
 * and thematic dramatic tension across the story arc (introduction -> rising_action -> climax -> resolution).
 * Does NOT generate micro-dialogue.
 */

import { callLLM } from './llm.js';

const NARRATOR_SYSTEM_PROMPT = `You are the Narrative Agent in a 4-Agent Framework (IEEE Research Standard).
Your sole responsibility is managing global plot pacing, dramatic tension, narrative branching, and story milestone synthesis.
You DO NOT generate in-character dialogue.

Given the current world state, recent story milestones, and player interaction:
1. "narrativeProgression": 1-2 evocative sentences summarizing the macroscopic story shift.
2. "pacing": One of "introduction" | "rising_action" | "climax" | "resolution".
3. "dramaticTension": Number 0 to 100 representing the current story stake / tension.
4. "thematicTone": "cautious" | "empathetic_alliance" | "tactical_breakthrough" | "triumphant".
5. "suggestedObjective": 1 concise sentence guiding the player's next narrative milestone.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "narrativeProgression": "The traveler builds diplomatic rapport with the Guardian, shifting the village from guarded tension to shared purpose.",
  "pacing": "rising_action",
  "dramaticTension": 45,
  "thematicTone": "empathetic_alliance",
  "suggestedObjective": "Coordinate with Alex to disengage the gate barrier and explore the high cliffs."
}`;

/**
 * Execute the Narrative Agent
 */
export async function runNarratorAgent({
  playerText,
  npcId,
  currentWorldFlags = {},
  recentSceneHistory = [],
  provider = 'groq',
  model = null
}) {
  const historyText = recentSceneHistory
    .slice(-4)
    .map((h) => {
      if (h.type === 'character_turn' || h.type === 'dialogue_turn') {
        return `[Turn ${h.version}] Player to ${h.npcId}: "${h.playerText}" -> Reply: "${h.reply}" (Action: ${h.action})`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');

  const userPrompt = `Current World State (Wt):\n${JSON.stringify(currentWorldFlags, null, 2)}\n\nRecent Milestone History:\n${historyText || '(Chapter 1: The Outskirts)'}\n\nPlayer Interaction with NPC [${npcId.toUpperCase()}]:\n"${playerText}"\n\nSynthesize the narrative milestone and story arc progression.`;

  try {
    const result = await callLLM({
      provider,
      model,
      systemPrompt: NARRATOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    if (result.success && result.data) {
      return {
        narrativeProgression: result.data.narrativeProgression || 'The expedition advances through the mountain pass.',
        pacing: result.data.pacing || 'rising_action',
        dramaticTension: result.data.dramaticTension ?? 50,
        thematicTone: result.data.thematicTone || 'empathetic_alliance',
        suggestedObjective: result.data.suggestedObjective || 'Proceed to unlock the ancient sanctuary.',
        agent: 'Narrative Agent (Nt)',
        providerUsed: result.provider
      };
    }
  } catch (err) {
    console.warn('[runNarratorAgent] LLM call failed, applying heuristic fallback:', err.message);
  }

  // Heuristic Narrative fallback
  const isGate = currentWorldFlags.gate_unlocked;
  const isBridge = currentWorldFlags.bridge_extended;
  let pacing = 'introduction';
  let tension = 30;
  let progression = `The traveler engages ${npcId === 'alex' ? 'Alex the Guardian' : 'Mira the Alchemist'} in dialogue.`;
  let tone = 'cautious';
  let objective = 'Speak with Alex to find a way past the sealed gate.';

  if (isGate && isBridge) {
    pacing = 'climax';
    tension = 85;
    progression = 'The energy gate is disengaged and the arcane bridge spans the chasm. The sanctuary portal awaits!';
    tone = 'tactical_breakthrough';
    objective = 'Retrieve the Golden Key and unlock the Sanctuary of Unified Knowledge.';
  } else if (isGate) {
    pacing = 'rising_action';
    tension = 55;
    progression = 'The sealed gate lowers as trust is established. The path to the upper cliffs is revealed.';
    tone = 'empathetic_alliance';
    objective = 'Ascend the cliffs to consult Mira regarding the chasm bridge.';
  }

  return {
    narrativeProgression: progression,
    pacing,
    dramaticTension: tension,
    thematicTone: tone,
    suggestedObjective: objective,
    agent: 'Narrative Agent (Nt)',
    providerUsed: 'rule_heuristic'
  };
}
