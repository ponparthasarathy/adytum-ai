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
// Available 15 GameBoy pixel portrait assets with explicit visual genders
export const PORTRAIT_ASSETS = {
  corwin: { id: 'corwin', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_corwin.png', icon: '/gameboy/char_corwin.png', defaultName: 'Corwin' },
  wren: { id: 'wren', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_wren.png', icon: '/gameboy/char_wren.png', defaultName: 'Wren' },
  sable: { id: 'sable', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_sable.png', icon: '/gameboy/char_sable.png', defaultName: 'Sable' },
  garrow: { id: 'garrow', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_garrow.png', icon: '/gameboy/char_garrow.png', defaultName: 'Garrow' },
  lyra: { id: 'lyra', gender: 'female', defaultPronouns: 'she/her', sprite: '/gameboy/char_lyra.png', icon: '/gameboy/char_lyra.png', defaultName: 'Lyra' },
  shade: { id: 'shade', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_shade.png', icon: '/gameboy/char_shade.png', defaultName: 'Shade' },
  elena: { id: 'elena', gender: 'female', defaultPronouns: 'she/her', sprite: '/gameboy/char_elena.png', icon: '/gameboy/char_elena.png', defaultName: 'Elena' },
  torin: { id: 'torin', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_torin.png', icon: '/gameboy/char_torin.png', defaultName: 'Torin' },
  malik: { id: 'malik', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_malik.png', icon: '/gameboy/char_malik.png', defaultName: 'Malik' },
  scholar: { id: 'scholar', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_scholar.png', icon: '/gameboy/char_scholar.png', defaultName: 'Sterling' },
  silas: { id: 'silas', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_silas.png', icon: '/gameboy/char_silas.png', defaultName: 'Silas' },
  vera: { id: 'vera', gender: 'female', defaultPronouns: 'she/her', sprite: '/gameboy/char_vera.png', icon: '/gameboy/char_vera.png', defaultName: 'Vera' },
  kael: { id: 'kael', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_kael.png', icon: '/gameboy/char_kael.png', defaultName: 'Kaelen' },
  dante: { id: 'dante', gender: 'male', defaultPronouns: 'he/him', sprite: '/gameboy/char_dante.png', icon: '/gameboy/char_dante.png', defaultName: 'Dante' },
  astra: { id: 'astra', gender: 'female', defaultPronouns: 'she/her', sprite: '/gameboy/char_astra.png', icon: '/gameboy/char_astra.png', defaultName: 'Astra' }
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

AVAILABLE PORTRAIT ASSETS (Select 2 to 7 characters depending on the scope of the story):
CRITICAL GENDER REQUIREMENT: You MUST strictly match the character name, gender, and pronouns (he/him vs she/her) to the visual gender of the assigned portrait asset!

FEMALE PORTRAITS (MUST BE FEMALE CHARACTERS with she/her pronouns):
- "lyra": Female systems analyst, cryptographer, or intellectual (Sprite: char_lyra.png)
- "elena": Female doctor, medic, alchemist, or healer (Sprite: char_elena.png)
- "vera": Female hazmat engineer or bio-containment specialist (Sprite: char_vera.png)
- "astra": Female pilot, captain, or atmospheric flight officer (Sprite: char_astra.png)

MALE PORTRAITS (MUST BE MALE CHARACTERS with he/him pronouns):
- "corwin": Male panicked/distressed researcher or engineer (Sprite: char_corwin.png)
- "wren": Male sensitive technician or analyst (Sprite: char_wren.png)
- "sable": Male cunning rogue, contractor, or opportunist (Sprite: char_sable.png)
- "garrow": Male heavy guard, enforcer, or security commander (Sprite: char_garrow.png)
- "shade": Male covert fixer, broker, or dark-glasses hacker (Sprite: char_shade.png)
- "torin": Male mechanical engineer, rigger, or tactician (Sprite: char_torin.png)
- "malik": Male scout, tracker, or navigator (Sprite: char_malik.png)
- "scholar": Male expedition director or veteran leader (Sprite: char_scholar.png)
- "silas": Male infiltrator, stealth agent, or shadow operative (Sprite: char_silas.png)
- "kael": Male celestial navigator or sensor officer (Sprite: char_kael.png)
- "dante": Male demolitions expert or ordnance specialist (Sprite: char_dante.png)

DYNAMIC CHARACTER COUNT GUIDELINES:
- Small, intimate stories (e.g. isolated submarine pod, 2-person survival): Select 2 to 3 characters.
- Medium/Standard facility stories (e.g. research lab, bunker): Select 4 to 5 characters.
- Large/Complex heist or station stories (e.g. space station, vault heist): Select 6 to 7 characters.

REQUIREMENTS FOR JSON OUTPUT:
1. "title": Catchy title for the scenario (e.g., "Abyssal Trench: Mariana Zero")
2. "genre": Short genre label (e.g., "Sci-Fi Deep Sea Survival Thriller")
3. "locationBadge": Capitalized location readout text (e.g., "MARIANA ZERO · SUB-SURFACE TRENCH LAB [DEPTH: 10,900M]")
4. "description": 2-sentence opening scene description of the emergency.
5. "characters": Array of 2 to 7 character objects. Each must have:
   - "portraitKey": String (one of the 15 available keys listed above)
   - "name": In-character name matching the portrait's gender (e.g. "Dr. Aris", "Dr. Elena", "Captain Ross", "Nolan")
   - "gender": String ("male" or "female", MUST match portraitKey visual gender)
   - "pronouns": String ("he/him" or "she/her")
   - "title": Professional title/role appropriate for the story (e.g., "Chief Oceanographer", "Security Enforcer")
   - "category": Category string (one of: "trapped", "contractor", "command", "leader")
   - "initialTrust": Integer (20 to 50)
   - "initialGreeting": In-character initial dialogue greeting (1-2 sentences capturing immediate crisis)
   - "personaSummary": Concise description of personality, psychological vulnerability, and key affordance.
   - "promptHints": Array of 4 suggested dialogue prompts for the player (empathetic, tactical, curious, aggressive)
6. "worldFlags": Initial world flags object (e.g., {"containment_locked": true, "power_generator_active": false})
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
    const gender = c.gender || asset.gender;
    const pronouns = c.pronouns || asset.defaultPronouns;
    const name = c.name || asset.defaultName;
    const charTitle = c.title || 'Specialist';
    const personaSummary = c.personaSummary || `${name} is a ${charTitle} responding to the crisis.`;

    const systemPrompt = `You are ${name}, ${charTitle} (${gender}, ${pronouns}) in the story scenario: "${title}".
CRISIS CONTEXT: ${description}
YOUR PERSONA: ${personaSummary}

PSYCHOLOGICAL TRUST & EMPATHY FRAMEWORK:
1. Current Trust Level in Player: Available in prompt context (0 to 100).
   - If Trust < 50: You are GUARDED, ANXIOUS, or CAUTIOUS.
     * Aggression or hostility causes you to become defensive or panicked. Action MUST be "none".
     * Empathetic, tactical, or calm dialogue builds trust and calms your distress.
   - If Trust >= 50: You are A COOPERATIVE ALLY.
     * You offer tactical assistance, bypass assistance, or key story support.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response (1-2 sentences capturing your persona and situation)",
  "action": "one of: check_systems | override_bypass | reroute_ventilation | strike_deal | request_quarantine_override | triage_medical | none",
  "emotionalState": "panicked" | "weak" | "calculating" | "strict" | "composed" | "determined" | "cooperative",
  "perceivedEmpathy": 80
}`;

    return {
      id: portraitKey, // asset key used for consistent memory and tab identification
      portraitKey,
      name,
      gender,
      pronouns,
      title: charTitle,
      sprite: asset.sprite,
      icon: asset.icon,
      category: c.category || 'trapped',
      initialTrust: typeof c.initialTrust === 'number' ? c.initialTrust : 35,
      dialogue: c.initialGreeting || 'We need to coordinate immediately to survive this crisis.',
      personaSummary,
      systemPrompt,
      promptHints: c.promptHints || [
        { type: 'empathetic', text: `${name}, stay steady. We will resolve this crisis together.` },
        { type: 'tactical', text: `Let us analyze the emergency controls for your sector.` },
        { type: 'curious', text: `What is the current status of your life support telemetry?` },
        { type: 'aggressive', text: `We must resolve this situation immediately!` }
      ]
    };
  });

  // Ensure at least 2 characters (dynamic range is 2 to 7)
  if (characters.length < 2) {
    const missingKeys = Object.keys(PORTRAIT_ASSETS).filter(k => !characters.some(c => c.id === k));
    for (let i = characters.length; i < 2; i++) {
      const key = missingKeys[i % missingKeys.length];
      const asset = PORTRAIT_ASSETS[key];
      characters.push({
        id: key,
        portraitKey: key,
        name: asset.defaultName,
        gender: asset.gender,
        pronouns: asset.defaultPronouns,
        title: 'Expedition Specialist',
        sprite: asset.sprite,
        icon: asset.icon,
        category: 'trapped',
        initialTrust: 35,
        dialogue: 'We need to keep clear heads and work together.',
        personaSummary: 'Field specialist coordinating emergency survival.',
        systemPrompt: `You are ${asset.defaultName}, Expedition Specialist. Respond in character with strict JSON output format {"reply": "...", "action": "none", "emotionalState": "composed", "perceivedEmpathy": 70}.`,
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
    { title: '🟡 Vector 2: Tactical Barter & Extraction', description: 'Negotiate resource trades and supply exchanges to secure an exit route.' },
    { title: '🔵 Vector 3: Emergency Shaft Bypass', description: 'Map auxiliary ventilation tunnels to guide personnel to safety.' }
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
        gender: 'male',
        pronouns: 'he/him',
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
        portraitKey: 'lyra',
        name: 'Dr. Lyra',
        gender: 'female',
        pronouns: 'she/her',
        title: 'Systems Architect',
        category: 'trapped',
        initialTrust: 45,
        initialGreeting: 'I have pulled the trench facility schematics. The lower ventilation duct bypasses the main flood gate.',
        personaSummary: 'Sharp, analytical systems cryptographer mapping emergency conduits.',
        promptHints: [
          { type: 'tactical', text: 'Dr. Lyra, show us the schematic path through the maintenance trench.' },
          { type: 'curious', text: 'Can you decrypt the terminal override for the auxiliary pump?' },
          { type: 'empathetic', text: 'We rely on your structural expertise, Lyra.' },
          { type: 'aggressive', text: 'Bypass that terminal cipher immediately!' }
        ]
      },
      {
        portraitKey: 'sable',
        name: 'Nolan',
        gender: 'male',
        pronouns: 'he/him',
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
      }
    ],
    worldFlags: {
      bulkhead_locked: true,
      sonar_active: true,
      trust_corwin: 40,
      trust_lyra: 45,
      trust_sable: 25
    },
    extractionVectors: [
      { title: '🟢 Vector 1: Command Pressure Clearance', description: 'Transmit bio-containment telemetry to Commander Vance to open the primary hatch.' },
      { title: '🟡 Vector 2: Submersible Pilot Barter', description: 'Trade valuable seismic research drive backups with Nolan for deep-sea pod extraction.' },
      { title: '🔵 Vector 3: Auxiliary Air Shaft Traverse', description: 'Reroute air scrubbers with Lyra and traverse the emergency ventilation duct.' }
    ]
  });
}
