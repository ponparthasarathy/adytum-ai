/**
 * Dynamic AI Story Generator for Multi-Agent Interactive Fiction
 * Uses Gemini / LLM to convert a 1-line premise (or random prompt) into a full scenario:
 * - Scenario Title & Genre
 * - Location Badge & Environmental Context
 * - Selected Subset of 3-6 characters mapped to the 10 GameBoy Pixel Portraits
 * - Personas, System Prompts, Initial Greetings, and Action Capabilities
 * - Initial World State Flags (Wt) & Scene Node (Vt)
 * - Field Journal Dossiers & 3 Extraction / Resolution Vectors
 */

import { callLLM } from './llm';

// Available 15 GameBoy pixel portrait assets (5x3 grid from 36x36-gameboy-portraits.png)
export const PORTRAIT_ASSETS = {
  corwin: { id: 'corwin', sprite: '/gameboy/char_corwin.png', icon: '/gameboy/char_corwin.png', defaultName: 'Corwin' },
  wren: { id: 'wren', sprite: '/gameboy/char_wren.png', icon: '/gameboy/char_wren.png', defaultName: 'Wren' },
  sable: { id: 'sable', sprite: '/gameboy/char_sable.png', icon: '/gameboy/char_sable.png', defaultName: 'Sable' },
  garrow: { id: 'garrow', sprite: '/gameboy/char_garrow.png', icon: '/gameboy/char_garrow.png', defaultName: 'Garrow' },
  lyra: { id: 'lyra', sprite: '/gameboy/char_lyra.png', icon: '/gameboy/char_lyra.png', defaultName: 'Lyra' },
  shade: { id: 'shade', sprite: '/gameboy/char_shade.png', icon: '/gameboy/char_shade.png', defaultName: 'Shade' },
  elena: { id: 'elena', sprite: '/gameboy/char_elena.png', icon: '/gameboy/char_elena.png', defaultName: 'Elena' },
  torin: { id: 'torin', sprite: '/gameboy/char_torin.png', icon: '/gameboy/char_torin.png', defaultName: 'Torin' },
  malik: { id: 'malik', sprite: '/gameboy/char_malik.png', icon: '/gameboy/char_malik.png', defaultName: 'Malik' },
  scholar: { id: 'scholar', sprite: '/gameboy/char_scholar.png', icon: '/gameboy/char_scholar.png', defaultName: 'Sterling' },
  silas: { id: 'silas', sprite: '/gameboy/char_silas.png', icon: '/gameboy/char_silas.png', defaultName: 'Silas' },
  vera: { id: 'vera', sprite: '/gameboy/char_vera.png', icon: '/gameboy/char_vera.png', defaultName: 'Vera' },
  kael: { id: 'kael', sprite: '/gameboy/char_kael.png', icon: '/gameboy/char_kael.png', defaultName: 'Kaelen' },
  dante: { id: 'dante', sprite: '/gameboy/char_dante.png', icon: '/gameboy/char_dante.png', defaultName: 'Dante' },
  astra: { id: 'astra', sprite: '/gameboy/char_astra.png', icon: '/gameboy/char_astra.png', defaultName: 'Astra' }
};

// Creative randomized prompt ideas for the "🎲 Random Story" button
export const RANDOM_PROMPTS = [
  'Submarine research vessel stranded at the bottom of the Mariana Trench with a hull leak and flickering power.',
  'Cyberpunk neon skyscraper vault heist trapped under an automated AI lockdown.',
  'Haunted Victorian manor library caught in a recurring 30-minute time anomaly.',
  'Orbital space station hydroponics bay facing severe atmospheric pressure loss.',
  'Post-apocalyptic underground metro bunker running out of clean water filters.',
  'Ancient subterranean desert tomb locked after an earthquake unearthed forbidden technology.',
  'Deep-space mining rig trapped in the gravitational pull of a collapsing star.',
  'High-altitude alpine research outpost surrounded by an unpredicted Category 5 snowstorm.'
];

export function getRandomPrompt() {
  const index = Math.floor(Math.random() * RANDOM_PROMPTS.length);
  return RANDOM_PROMPTS[index];
}

/**
 * Generate a complete dynamic scenario from a 1-line user prompt or random prompt
 */
export async function generateScenarioFromPrompt(promptText, modelConfig = {}) {
  const cleanPrompt = promptText && promptText.trim() ? promptText.trim() : getRandomPrompt();

  const systemPrompt = `You are a master Interactive Fiction Architect and Multi-Agent Game Director.
Your task is to take a 1-line story premise and generate a rich, immersive multi-agent scenario JSON.

AVAILABLE PORTRAIT ASSETS (Select 4 to 6 characters best suited for the story):
- "corwin": Trapped/Distressed/Panicked researcher or specialist (Sprite: char_corwin.png)
- "wren": Sensitive/Injured/Fragile companion or technician (Sprite: char_wren.png)
- "sable": Cunning/Smirking rogue, contractor, or opportunist (Sprite: char_sable.png)
- "garrow": Heavy armored/hooded guard, enforcer, or security chief (Sprite: char_garrow.png)
- "lyra": Systems analyst, cryptographer, or intellectual (Sprite: char_lyra.png)
- "shade": Covert fixer, dark-glasses broker, or hacker (Sprite: char_shade.png)
- "elena": Doctor, medic, alchemist, or healer (Sprite: char_elena.png)
- "torin": Mechanical engineer, heavy rigger, or tactician (Sprite: char_torin.png)
- "malik": Scout, recon, tracker, or navigator (Sprite: char_malik.png)
- "scholar": Expedition leader, director, or veteran commander (Sprite: char_scholar.png)
- "silas": Infiltrator, stealth specialist, or shadow operative (Sprite: char_silas.png)
- "vera": Hazardous material engineer or bio-containment specialist (Sprite: char_vera.png)
- "kael": Celestial navigator or telemetry officer (Sprite: char_kael.png)
- "dante": Demolitions expert or heavy ordnance engineer (Sprite: char_dante.png)
- "astra": High-altitude pilot or atmosphere flight captain (Sprite: char_astra.png)

REQUIREMENTS FOR JSON OUTPUT:
1. "title": Catchy title for the scenario (e.g., "Abyssal Trench: Mariana Zero")
2. "genre": Short genre label (e.g., "Sci-Fi Deep Sea Survival Thriller")
3. "locationBadge": Capitalized location readout text (e.g., "MARIANA ZERO · SUB-SURFACE TRENCH LAB [DEPTH: 10,900M]")
4. "description": 2-sentence opening scene description of the emergency.
5. "characters": Array of 4 to 6 character objects. Each must have:
   - "portraitKey": String (one of: "corwin", "wren", "sable", "garrow", "lyra", "shade", "elena", "torin", "malik", "scholar", "silas", "vera", "kael", "dante", "astra")
   - "name": Name for the character in this story (e.g., "Dr. Aris", "Commander Vance", "Nolan")
   - "title": Professional title/role (e.g., "Chief Oceanographer", "Security Enforcer")
   - "category": Category string (one of: "trapped", "contractor", "command", "leader")
   - "initialTrust": Integer (20 to 50)
   - "initialGreeting": In-character initial dialogue greeting (1-2 sentences capturing immediate crisis)
   - "personaSummary": Concise description of personality, psychological vulnerability, and key affordance.
   - "promptHints": Array of 4 suggested dialogue prompts for the player (empathetic, tactical, curious, aggressive)
6. "worldFlags": Initial world flags object (e.g., {"containment_locked": true, "power_generator_active": false, "trust_[portraitKey]": initialTrust})
7. "extractionVectors": Array of 3 strategy cards for the Field Journal. Each object has "title" and "description".

STRICT JSON OUTPUT ONLY.`;

  const userMessage = `Story Premise: "${cleanPrompt}"\nGenerate the complete interactive scenario JSON now.`;

  try {
    const result = await callLLM({
      provider: modelConfig.characterProvider || 'groq',
      model: modelConfig.characterModel || 'openai/gpt-oss-120b',
      systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const scenarioData = result.data || result;
    return processGeneratedScenario(cleanPrompt, scenarioData);
  } catch (err) {
    console.warn('AI Scenario generation failed, returning fallback scenario:', err.message);
    return createFallbackScenario(cleanPrompt);
  }
}

/**
 * Process and format the raw AI generated scenario into standardized game structures
 */
function processGeneratedScenario(userPrompt, data) {
  const title = data.title || 'Dynamic Emergency Incident';
  const genre = data.genre || 'Interactive Fiction Dilemma';
  const locationBadge = data.locationBadge || 'SECTOR 7 · EMERGENCY INCIDENT ZONE';
  const description = data.description || `An emergency crisis has occurred following: ${userPrompt}`;

  const characters = (data.characters || []).map((c) => {
    const portraitKey = PORTRAIT_ASSETS[c.portraitKey] ? c.portraitKey : 'corwin';
    const asset = PORTRAIT_ASSETS[portraitKey];

    return {
      id: portraitKey, // keep asset portraitKey as id for consistent memory lookup
      portraitKey,
      name: c.name || asset.defaultName,
      title: c.title || 'Specialist',
      sprite: asset.sprite,
      icon: asset.icon,
      category: c.category || 'trapped',
      initialTrust: typeof c.initialTrust === 'number' ? c.initialTrust : 35,
      dialogue: c.initialGreeting || 'We need to coordinate immediately to survive this crisis.',
      personaSummary: c.personaSummary || 'Specialist in the emergency zone.',
      promptHints: c.promptHints || [
        { type: 'empathetic', text: 'Breathe steadily. We will resolve this crisis together.' },
        { type: 'tactical', text: 'Let us analyze the emergency override controls.' },
        { type: 'curious', text: 'What is the status of the primary life support telemetry?' },
        { type: 'aggressive', text: 'We must unlock this section immediately!' }
      ]
    };
  });

  // Ensure at least 4 characters
  if (characters.length < 4) {
    const missingKeys = Object.keys(PORTRAIT_ASSETS).filter(k => !characters.some(c => c.id === k));
    for (let i = characters.length; i < 4; i++) {
      const key = missingKeys[i % missingKeys.length];
      const asset = PORTRAIT_ASSETS[key];
      characters.push({
        id: key,
        portraitKey: key,
        name: asset.defaultName,
        title: 'Expedition Specialist',
        sprite: asset.sprite,
        icon: asset.icon,
        category: 'trapped',
        initialTrust: 35,
        dialogue: 'We need to keep clear heads and work together.',
        personaSummary: 'Field specialist coordinating emergency survival.',
        promptHints: [
          { type: 'empathetic', text: 'Stay calm. We are working together.' },
          { type: 'tactical', text: 'Let us check the auxiliary systems.' },
          { type: 'curious', text: 'What is the status of your section?' },
          { type: 'aggressive', text: 'Move quickly before time runs out!' }
        ]
      });
    }
  }

  // Generate initial world flags Wt
  const initialWorldFlags = {
    incident_active: true,
    exit_locked: true,
    power_bypassed: false,
    dramaticTension: 40,
    active_branch: 'awakening',
    completed_ending: null,
    ...(data.worldFlags || {})
  };

  characters.forEach((c) => {
    initialWorldFlags[`trust_${c.id}`] = c.initialTrust;
  });

  const extractionVectors = data.extractionVectors || [
    { title: '🟢 Vector 1: Technical System Override', description: 'Reassure engineering specialists and execute manual control overrides.' },
    { title: '🟡 Vector 2: Tactical Barter & Hoist', description: 'Negotiate data trades and supply exchanges to secure an exit route.' },
    { title: '🔵 Vector 3: Emergency Duct Bypass', description: 'Map auxiliary ventilation tunnels to guide personnel to safety.' }
  ];

  return {
    scenarioId: `dynamic_${Date.now()}`,
    userPrompt,
    title,
    genre,
    locationBadge,
    description,
    characters,
    initialWorldFlags,
    extractionVectors
  };
}

/**
 * Robust fallback scenario generator if API is offline
 */
function createFallbackScenario(userPrompt) {
  return processGeneratedScenario(userPrompt, {
    title: 'Deep Sea Research Station: Hydro-Rupture',
    genre: 'Sub-Surface Abyss Survival',
    locationBadge: 'MARIANA ZERO · SUB-LEVEL TRENCH LAB [DEPTH: 10,900M]',
    description: 'An unexpected tectonic shift ruptured the primary ballast manifold. Atmospheric pressure is dropping rapidly as sub-surface water floods the lower corridor.',
    characters: [
      {
        portraitKey: 'corwin',
        name: 'Dr. Aris',
        title: 'Lead Hydro-Engineer',
        category: 'trapped',
        initialTrust: 40,
        initialGreeting: 'The pressure bulkhead is buckling under 10,000 meters of water! Can anyone hear me over the sonar alarms?',
        personaSummary: 'Brilliant oceanographer suffering mild hypothermia and shock.',
        promptHints: [
          { type: 'empathetic', text: 'Dr. Aris, stay calm. We will stabilize the ballast controls together.' },
          { type: 'tactical', text: 'Can we access the manual pressure bypass valve behind panel 4?' },
          { type: 'curious', text: 'What is the current hull integrity reading?' },
          { type: 'aggressive', text: 'Focus and seal that ballast door now!' }
        ]
      },
      {
        portraitKey: 'wren',
        name: 'Kael',
        title: 'Telemetry Analyst',
        category: 'trapped',
        initialTrust: 35,
        initialGreeting: 'Oxygen levels in the auxiliary duct are dropping. If we don\'t reroute air scrubbers, we won\'t last twenty minutes...',
        personaSummary: 'Fragile sensor analyst who needs psychological reassurance.',
        promptHints: [
          { type: 'empathetic', text: 'Cover your mouth, Kael. We are bringing clean air online.' },
          { type: 'tactical', text: 'Can you map the emergency ventilation route on your terminal?' },
          { type: 'curious', text: 'Where is the nearest functional air scrubber?' },
          { type: 'aggressive', text: 'Map those ventilation ducts immediately!' }
        ]
      },
      {
        portraitKey: 'sable',
        name: 'Nolan',
        title: 'Submersible Transport Pilot',
        category: 'contractor',
        initialTrust: 25,
        initialGreeting: 'Looks like your undersea research station is taking on water. My deep-sea pod leaves in fifteen minutes—what\'s it worth for a seat?',
        personaSummary: 'Cunning mercenary pilot seeking valuable research wagers.',
        promptHints: [
          { type: 'tactical', text: 'Nolan, we have encrypted seismic survey data worth a fortune if you unlock the escape pod.' },
          { type: 'curious', text: 'How many batteries remain in your transport pod?' },
          { type: 'empathetic', text: 'Neither of us wants to be trapped at the ocean floor. Let us strike a fair deal.' },
          { type: 'aggressive', text: 'Leave without us and your pilot license is revoked!' }
        ]
      },
      {
        portraitKey: 'garrow',
        name: 'Commander Vance',
        title: 'Outpost Security Commander',
        category: 'command',
        initialTrust: 20,
        initialGreeting: 'Automated containment protocol is active. Blast doors stay locked until bio-sensors confirm zero flood contamination.',
        personaSummary: 'Duty-bound security chief who respects safety telemetry.',
        promptHints: [
          { type: 'empathetic', text: 'Commander Vance, check our sensor telemetry—the flood is localized.' },
          { type: 'tactical', text: 'We have verified life-support data. Authorize airlock release.' },
          { type: 'curious', text: 'What is the command status of the upper staging deck?' },
          { type: 'aggressive', text: 'Override this lockdown immediately!' }
        ]
      }
    ],
    worldFlags: {
      bulkhead_locked: true,
      sonar_active: true,
      trust_corwin: 40,
      trust_wren: 35,
      trust_sable: 25,
      trust_garrow: 20
    },
    extractionVectors: [
      { title: '🟢 Vector 1: Command Pressure Clearance', description: 'Transmit bio-containment telemetry to Commander Vance to open the primary hatch.' },
      { title: '🟡 Vector 2: Submersible Pilot Barter', description: 'Trade valuable seismic research drive backups with Nolan for deep-sea pod extraction.' },
      { title: '🔵 Vector 3: Auxiliary Air Shaft Traverse', description: 'Reroute air scrubbers with Kael and traverse the emergency ventilation duct.' }
    ]
  });
}
