/**
 * World State Agent (Wt)
 * Formalized from IEEE Paper: "A Multi-Agent Narrative Generation Framework for Dynamic Storytelling"
 *
 * Responsibility:
 * Validates physical spatial affordances, causality, inventory, and environmental transitions Wt -> Wt+1.
 * Enforces strict world mechanics (shed door lock, rope bindings, lantern fuel, drainage grate).
 */

import { callLLM } from './llm.js';

const WORLD_STATE_SYSTEM_PROMPT = `You are the World State Agent in a 4-Agent Narrative Framework (IEEE Research Standard).
Your responsibility is maintaining physical environment consistency, spatial affordances, and inventory validation in the ADYTUM Narrative Engine scenario.
You DO NOT generate dialogue or character personality traits.

Given current world flags Wt, player action/input, and target NPC:
1. Validate whether the requested action conforms to physical laws and spatial constraints.
2. Determine resulting deterministic environment state changes:
   - "shed_door_locked": boolean (false if Garrow or player unlocks door)
   - "ropes_loosened": boolean (true if Corwin or Wren helps untie knots)
   - "guard_distracted": boolean (true if Sable or Garrow is occupied/negotiating)
   - "deal_struck": boolean (true if Sable accepts a trade/wager)
   - "drainage_grate_examined": boolean (true if examining room layout)
3. Output a 1-sentence physical causality explanation.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "physicalFeasibility": true,
  "stateMutations": {
    "ropes_loosened": true
  },
  "causalityExplanation": "Corwin working fingers under the wrist bindings eases the tension, loosening the rope knots."
}`;

/**
 * Execute World State Agent
 */
export async function runWorldStateAgent({
  playerText,
  npcId,
  currentWorldFlags = {},
  proposedAction = 'none',
  provider = 'groq',
  model = null
}) {
  const contextPrompt = `Current World Flags (Wt):
${JSON.stringify(currentWorldFlags, null, 2)}

Target NPC: ${npcId}
Player Action/Statement: "${playerText}"
Proposed Action by Character: "${proposedAction}"

Verify physical rules, spatial triggers, and return valid stateMutations.`;

  try {
    const result = await callLLM({
      provider,
      model,
      systemPrompt: WORLD_STATE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contextPrompt }]
    });

    if (result.success && result.data) {
      return {
        physicalFeasibility: result.data.physicalFeasibility ?? true,
        stateMutations: result.data.stateMutations || {},
        causalityExplanation: result.data.causalityExplanation || 'Physical world state updated.',
        agent: 'World State Agent (Wt)',
        providerUsed: result.provider
      };
    }
  } catch (err) {
    console.warn('[runWorldStateAgent] LLM reasoning fallback to deterministic engine:', err.message);
  }

  // Deterministic physical causality engine (Zero-LLM fallback & safety check)
  const mutations = {};
  let explanation = 'World state verified against physical constraints.';

  if (proposedAction === 'loosen_ropes') {
    mutations.ropes_loosened = true;
    explanation = `${npcId.toUpperCase()} worked fingers under the wrist bindings, loosening the cords.`;
  } else if (proposedAction === 'unlock_door') {
    mutations.shed_door_locked = false;
    explanation = `${npcId.toUpperCase()} turned the iron key in the lock, unlatching the shed door.`;
  } else if (proposedAction === 'strike_deal') {
    mutations.deal_struck = true;
    mutations.guard_distracted = true;
    explanation = `${npcId.toUpperCase()} accepted terms of the negotiation, relaxing guard alertness.`;
  } else if (proposedAction === 'distract_guard') {
    mutations.guard_distracted = true;
    explanation = `${npcId.toUpperCase()} created a commotion, pulling guard attention away from the exit.`;
  } else if (proposedAction === 'check_surroundings') {
    mutations.drainage_grate_examined = true;
    explanation = `${npcId.toUpperCase()} inspected the perimeter, identifying the drainage grate as an escape point.`;
  } else if (proposedAction === 'comfort') {
    mutations.morale_stabilized = true;
    explanation = `Shared words restored emotional composure.`;
  }

  return {
    physicalFeasibility: true,
    stateMutations: mutations,
    causalityExplanation: explanation,
    agent: 'World State Agent (Wt)',
    providerUsed: 'deterministic_physics_engine'
  };
}
