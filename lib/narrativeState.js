/**
 * Formal Narrative State Manager: St = (Vt, Et, Ct, Wt, Ut, Rt)
 * Based on IEEE Paper: "A Multi-Agent Narrative Generation Framework for Dynamic Storytelling"
 *
 * Coordinates state across 4 Explicit Agents:
 * - Narrative Agent (Vt, Et)
 * - Character Agent (Ct)
 * - World State Agent (Wt)
 * - Evaluator Agent (Rt)
 */

if (!globalThis.__pixieSessions) {
  globalThis.__pixieSessions = new Map();
}
const sessions = globalThis.__pixieSessions;

function createInitialState(sessionId) {
  const rootNodeId = 'node_0_containment_lockdown';
  const initialWorldFlags = {
    blast_doors_locked: true,
    manual_bypass_engaged: false,
    ventilation_shaft_mapped: false,
    auxiliary_fuel_cells: true,
    security_distracted: false,
    trade_agreed: false,
    glycol_leak_isolated: false,
    core_stabilized: false,
    trust_aris: 40,
    trust_kael: 35,
    trust_nolan: 25,
    trust_vance: 20,
    trust_lyra: 45,
    trust_shade: 30,
    trust_elena: 40,
    trust_torin: 35,
    trust_malik: 30,
    trust_sterling: 50,
    active_branch: 'containment_lockdown',
    completed_ending: null,
    dramaticTension: 40
  };

  return {
    sessionId,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // Formal Vt: Graph Nodes
    sceneNodes: [
      {
        id: rootNodeId,
        version: 1,
        title: 'Station Borealis: Sub-Level 3',
        description: 'Automated containment lockout active in Sub-Level 3 following geothermal pressure rupture. Outside temperatures falling rapidly as the category-5 blizzard closes in.',
        pacing: 'introduction',
        activeCharacters: ['aris', 'kael', 'nolan', 'vance', 'lyra', 'shade', 'elena', 'torin', 'malik', 'sterling'],
        timestamp: Date.now()
      }
    ],
    // Formal Et: Directed Graph Edges
    transitions: [],
    // Formal Wt: World State
    worldFlags: initialWorldFlags,
    // Formal Ct: Isolated Character Memories
    characterMemories: {
      aris: [],
      kael: [],
      nolan: [],
      vance: [],
      lyra: [],
      shade: [],
      elena: [],
      torin: [],
      malik: [],
      sterling: []
    },
    // Formal Ut: User Action History
    userActions: [],
    // Formal Rt: Evaluator Annotations
    evaluations: [],
    // 4-Agent Execution Traces for Live Inspector
    agentTraces: [],
    // Aggregate Research Metrics
    aggregateMetrics: {
      totalTurns: 0,
      avgEmpathy: 78,
      avgAssertiveness: 68,
      avgAgency: 72,
      avgPersonaConsistency: 95,
      avgNarrativeCoherence: 92,
      personaContradictionCount: 0
    }
  };
}

/**
 * Get or initialize session state St
 */
export function getSession(sessionId = 'default-session') {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, createInitialState(sessionId));
  }
  return sessions.get(sessionId);
}

/**
 * Reset session to St_0
 */
export function resetSession(sessionId = 'default-session') {
  const newState = createInitialState(sessionId);
  sessions.set(sessionId, newState);
  return newState;
}

/**
 * Set custom dynamically generated scenario into session state St
 */
export function setCustomScenario(sessionId = 'default-session', scenario = {}) {
  const rootNodeId = `node_0_${Date.now().toString(36)}`;

  const activeCharIds = (scenario.characters || []).map(c => c.id);
  const memories = {};
  activeCharIds.forEach(id => {
    memories[id] = [];
  });

  const newState = {
    sessionId,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeScenario: scenario,
    // Formal Vt: Graph Nodes
    sceneNodes: [
      {
        id: rootNodeId,
        version: 1,
        title: scenario.title || 'Dynamic Emergency Incident',
        description: scenario.description || 'Emergency crisis initiated.',
        pacing: 'introduction',
        activeCharacters: activeCharIds,
        timestamp: Date.now()
      }
    ],
    // Formal Et: Directed Graph Edges
    transitions: [],
    // Formal Wt: World State
    worldFlags: scenario.initialWorldFlags || { dramaticTension: 40 },
    // Formal Ct: Isolated Character Memories
    characterMemories: memories,
    // Formal Ut: User Action History
    userActions: [],
    // Formal Rt: Evaluator Annotations
    evaluations: [],
    // 4-Agent Execution Traces for Live Inspector
    agentTraces: [],
    // Aggregate Research Metrics
    aggregateMetrics: {
      totalTurns: 0,
      avgEmpathy: 78,
      avgAssertiveness: 68,
      avgAgency: 72,
      avgPersonaConsistency: 95,
      avgNarrativeCoherence: 92,
      personaContradictionCount: 0
    }
  };

  sessions.set(sessionId, newState);
  return newState;
}

/**
 * Apply Narrative Agent & World State Agent changes (Vt -> Vt+1, Wt -> Wt+1)
 */
export function applyNarratorChanges(
  sessionId,
  userActionText,
  stateMutations = {},
  progressionNote = '',
  pacing = 'rising_action',
  activeNpc = 'corwin',
  tensionDelta = 5
) {
  const session = getSession(sessionId);
  session.version += 1;
  session.updatedAt = Date.now();

  const prevNode = session.sceneNodes[session.sceneNodes.length - 1];
  const newNodeId = `node_${session.version}_${Date.now().toString(36)}`;

  // Apply Wt mutations
  Object.assign(session.worldFlags, stateMutations);
  if (tensionDelta) {
    session.worldFlags.dramaticTension = Math.min(100, Math.max(10, (session.worldFlags.dramaticTension || 40) + tensionDelta));
  }

  // Create Vt+1 Scene Node
  const newNode = {
    id: newNodeId,
    version: session.version,
    title: `Scene Step ${session.version}`,
    description: progressionNote || `Tension builds as actions unfold with ${activeNpc}.`,
    pacing,
    activeCharacters: [activeNpc],
    timestamp: Date.now()
  };
  session.sceneNodes.push(newNode);

  // Create Et Directed Graph Edge
  session.transitions.push({
    from: prevNode ? prevNode.id : 'start',
    to: newNodeId,
    triggerAction: userActionText,
    timestamp: Date.now()
  });

  // Record Ut
  session.userActions.push({
    version: session.version,
    text: userActionText,
    targetNpc: activeNpc,
    timestamp: Date.now()
  });

  return session;
}

/**
 * Add Character Agent memory turn in Ct (isolated private stream)
 */
export function addCharacterTurn(sessionId, npcId, playerText, npcReply, action = 'none', emotionalState = 'skeptical') {
  const session = getSession(sessionId);
  if (!session.characterMemories[npcId]) {
    session.characterMemories[npcId] = [];
  }

  session.characterMemories[npcId].push({
    role: 'user',
    text: playerText,
    timestamp: Date.now()
  });

  session.characterMemories[npcId].push({
    role: 'assistant',
    text: npcReply,
    action,
    emotionalState,
    timestamp: Date.now()
  });

  // Keep memory window efficient (last 10 turns per NPC)
  if (session.characterMemories[npcId].length > 20) {
    session.characterMemories[npcId] = session.characterMemories[npcId].slice(-20);
  }

  return session;
}

/**
 * Record Evaluator Agent outcome in Rt and update closed-loop trust
 */
export function addEvaluation(sessionId, evalRecord) {
  const session = getSession(sessionId);
  session.evaluations.push({
    id: `eval_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    ...evalRecord
  });

  // Closed-loop trust delta update on Wt
  const { npcId, trustDelta = 0 } = evalRecord;
  if (npcId && trustDelta !== 0) {
    const trustKey = `trust_${npcId}`;
    const oldTrust = session.worldFlags[trustKey] ?? 35;
    session.worldFlags[trustKey] = Math.min(100, Math.max(0, oldTrust + trustDelta));
  }

  // Update running aggregate metrics
  const evals = session.evaluations;
  const count = evals.length;
  if (count > 0) {
    let sumEmp = 0;
    let sumAss = 0;
    let sumAgc = 0;
    let sumPcr = 0;
    let sumCoh = 0;

    for (const ev of evals) {
      sumEmp += ev.scores?.empathy ?? 75;
      sumAss += ev.scores?.assertiveness ?? 70;
      sumAgc += ev.scores?.agency ?? 70;
      sumPcr += ev.personaConsistency ?? 94;
      sumCoh += ev.narrativeCoherence ?? 90;
    }

    session.aggregateMetrics = {
      totalTurns: count,
      avgEmpathy: Math.round(sumEmp / count),
      avgAssertiveness: Math.round(sumAss / count),
      avgAgency: Math.round(sumAgc / count),
      avgPersonaConsistency: Math.round(sumPcr / count),
      avgNarrativeCoherence: Math.round(sumCoh / count),
      personaContradictionCount: 0
    };
  }

  return session;
}

/**
 * Record 4-Agent Execution Trace for Live Inspector
 */
export function recordAgentTrace(sessionId, traceData) {
  const session = getSession(sessionId);
  session.agentTraces.push({
    turn: session.userActions.length,
    timestamp: Date.now(),
    ...traceData
  });

  if (session.agentTraces.length > 25) {
    session.agentTraces = session.agentTraces.slice(-25);
  }

  return session;
}

export function getAllSessions() {
  const result = [];
  for (const [id, s] of sessions.entries()) {
    result.push({
      sessionId: id,
      version: s.version,
      updatedAt: s.updatedAt,
      actionsCount: s.userActions.length
    });
  }
  return result;
}
