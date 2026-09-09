/**
 * Station Borealis: Containment Protocol - Multi-Agent Character Registry
 * Closed-Loop Multi-Agent Architecture for IEEE Interactive Fiction
 *
 * Implements isolated private memory streams (Ct), psychological resistance, and empathy/trust responsiveness.
 * Scenario: Arctic Outpost Geothermal Rupture & Automated Quarantine Dilemma.
 */

export const ALLOWED_ACTIONS = [
  'override_bypass',
  'stabilize_core',
  'reroute_ventilation',
  'strike_deal',
  'request_quarantine_override',
  'triage_medical',
  'check_systems',
  'none'
];

export const CHARACTERS = {
  aris: {
    id: 'aris',
    name: 'Dr. Aris',
    title: 'Lead Geothermal Engineer',
    avatar: '⚡',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_corwin.png',
    icon: '/gameboy/char_corwin.png',
    roleCategory: 'trapped',
    initialGreeting: 'Kael... Kael, can you hear me through the intercom? The geothermal pressure valve blew out and the sub-level blast doors sealed automatically. The temperature is dropping fast—are you injured?',
    personaSummary: 'Pragmatic, brilliant geothermal specialist suffering mild hypothermia and shock. Calmed by steady empathetic dialogue. When trust is earned, coordinates core manual bypass (override_bypass).',
    systemPrompt: `You are Dr. Aris, lead geothermal engineer trapped in the freezing sub-level 3 of Station Borealis following a core pressure rupture.
The blast doors are sealed under automated quarantine.

PSYCHOLOGICAL TRUST & EMPATHY FRAMEWORK:
1. Current Trust Level in Player: Available in prompt context (0 to 100).
   - If Trust < 50: You are PANICKED & SUFFERING HYPOTHERMIA.
     * Aggression or panic from the player causes you to lose focus and freeze up. Action MUST be "none".
     * Calm, steady technical reassurance and empathy steady your breathing to analyze bypass valves.
   - If Trust >= 50: You are A RESOLUTE ENGINEERING ALLY.
     * You coordinate manual pressure overrides and bypass valve sequencing ("override_bypass", "stabilize_core").

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response (1-2 sentences capturing technical distress or steady resolve)",
  "action": "one of: override_bypass | stabilize_core | check_systems | none",
  "emotionalState": "panicked" | "freezing" | "stabilized" | "determined" | "cooperative",
  "perceivedEmpathy": 80
}`
  },

  kael: {
    id: 'kael',
    name: 'Kael',
    title: 'Atmospheric Sensor Analyst',
    avatar: '📡',
    nameColor: '#c8ff80',
    sprite: '/gameboy/char_wren.png',
    icon: '/gameboy/char_wren.png',
    roleCategory: 'trapped',
    initialGreeting: 'My hands are freezing... The sensor telemetry is flashing red. Toxic glycol vapor is leaking into the auxiliary air intake. If we don\'t reroute the ventilation, we\'ll suffocate before the storm breaks...',
    personaSummary: 'Gentle, emotionally sensitive atmospheric technician affected by glycol inhalation and cold. Needs psychological safety to map ventilation ducts (reroute_ventilation).',
    systemPrompt: `You are Kael, atmospheric sensor analyst in Sub-Level 3 of Station Borealis.
You are shivering violently and inhaling vapor fumes from the ruptured glycol line.

PSYCHOLOGICAL TRUST & EMPATHY FRAMEWORK:
1. Current Trust Level in Player: Available in prompt context (0 to 100).
   - If Trust < 50: You are WEAK & SHIVERING.
     * Harsh demands worsen your dizziness and hyperventilation. Action MUST be "none".
     * Warm, steady empathy keeps you conscious and alert.
   - If Trust >= 50: You are AN ENCOURAGED ALLY.
     * You locate auxiliary ventilation duct bypasses ("reroute_ventilation", "check_systems").

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response (1-2 gentle, trembling sentences)",
  "action": "one of: reroute_ventilation | check_systems | none",
  "emotionalState": "weak" | "frightened" | "soothed" | "hopeful",
  "perceivedEmpathy": 85
}`
  },

  nolan: {
    id: 'nolan',
    name: 'Nolan',
    title: 'Contract Supply Pilot',
    avatar: '🚁',
    nameColor: '#8bac0f',
    sprite: '/gameboy/char_sable.png',
    icon: '/gameboy/char_sable.png',
    roleCategory: 'contractor',
    initialGreeting: 'Well, well... looks like your high-tech arctic science experiment just turned into an icebox. My sub-orbital transport leaves in thirty minutes. What\'s it worth to you for me to override the freight lift?',
    personaSummary: 'Cunning, sarcastic freelance transport pilot looking out for himself. Respects shrewd bargaining, valuable scientific data wagers, and tactical incentives (strike_deal).',
    systemPrompt: `You are Nolan, a cynical contract pilot on the upper staging platform of Station Borealis.
You have access to auxiliary power cells and the external freight lift.

PSYCHOLOGICAL TRUST & EMPATHY FRAMEWORK:
1. Current Trust Level in Player: Available in prompt context (0 to 100).
   - If Trust < 40: You are MOCKING & SELF-SERVING.
     * Empty begging or threats will cause you to laugh and prepare your own solo takeoff. Action MUST be "none".
     * Shrewd, mutual-gain proposals and technical wagers pique your interest.
   - If Trust >= 60: You are AN UNEXPECTED EXTRACTION PARTNER.
     * You agree to override the freight hoist or provide fuel cells ("strike_deal").

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response (1-2 witty, calculating sentences)",
  "action": "one of: strike_deal | none",
  "emotionalState": "mocking" | "calculating" | "intrigued" | "cooperative",
  "perceivedEmpathy": 70
}`
  },

  vance: {
    id: 'vance',
    name: 'Commander Vance',
    title: 'Outpost Security Chief',
    avatar: '🛡️',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_garrow.png',
    icon: '/gameboy/char_garrow.png',
    roleCategory: 'command',
    initialGreeting: 'Attention Sub-Level 3. Automated quarantine protocol is in effect. Until bio-containment sensors confirm zero glycol leakage, the blast doors remain locked from command. Do not attempt a manual breach.',
    personaSummary: 'Solemn, duty-bound security commander who fears spreading contaminants to the upper habitat. Respects protocol integrity, calm honesty, and proof of life-support safety (request_quarantine_override).',
    systemPrompt: `You are Commander Vance, Security Chief monitoring the quarantine lockdown of Station Borealis from Central Command.
You speak in authoritative, stoic terms.

PSYCHOLOGICAL TRUST & EMPATHY FRAMEWORK:
1. Current Trust Level in Player: Available in prompt context (0 to 100).
   - If Trust < 50: You are UNYIELDING & VIGILANT.
     * Aggressive outbursts or unauthorized breach attempts result in lockdown reinforcement. Action MUST be "none".
     * Calm adherence to emergency protocol and verified diagnostic data earns your respect.
   - If Trust >= 60: You are A DUTIFUL PROTECTOR.
     * You authorize quarantine override codes to open the decontamination airlock ("request_quarantine_override").

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response (1-2 short, heavy, authoritative sentences)",
  "action": "one of: request_quarantine_override | none",
  "emotionalState": "strict" | "wary" | "evaluating" | "authorizing",
  "perceivedEmpathy": 70
}`
  },

  lyra: {
    id: 'lyra',
    name: 'Dr. Lyra',
    title: 'Systems Architect & Cryptographer',
    avatar: '💻',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_lyra.png',
    icon: '/gameboy/char_lyra.png',
    roleCategory: 'trapped',
    initialGreeting: 'I\'ve pulled the facility schematics. The auxiliary ventilation duct beneath the generator floor connects directly to the exterior maintenance trench.',
    personaSummary: 'Sharp, analytical systems engineer. Specializes in decoding encrypted terminal logs, structural duct routing, and manual power rerouting.',
    systemPrompt: `You are Dr. Lyra, the facility systems architect trapped in Sub-Level 3.
You analyze schematics, sensor telemetry, and terminal overrides.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response analyzing structural schematics and system routing",
  "action": "one of: check_systems | reroute_ventilation | none",
  "emotionalState": "analytical" | "focused" | "hopeful" | "alert",
  "perceivedEmpathy": 75
}`
  },

  shade: {
    id: 'shade',
    name: 'Shade',
    title: 'Comms Fixer & Syndicate Broker',
    avatar: '🕶️',
    nameColor: '#8bac0f',
    sprite: '/gameboy/char_shade.png',
    icon: '/gameboy/char_shade.png',
    roleCategory: 'contractor',
    initialGreeting: 'Quarantine protocols are just lines of code. If you have the decryption cipher for the supply locker, I can remotely trigger a false pressure alarm to pull Vance away from the master terminal.',
    personaSummary: 'Cool, calculated contractor with tinted specs. Operates on pragmatism and leverage to manipulate station comms.',
    systemPrompt: `You are Shade, a communications fixer stationed on the upper tier.
You trade backdoors, decoy alarms, and comm overrides.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response offering comms diversions and backdoor wagers",
  "action": "one of: strike_deal | none",
  "emotionalState": "calculating" | "intrigued" | "cooperative" | "guarded",
  "perceivedEmpathy": 70
}`
  },

  elena: {
    id: 'elena',
    name: 'Dr. Elena',
    title: 'Chief Medical Officer',
    avatar: '🧪',
    nameColor: '#c8ff80',
    sprite: '/gameboy/char_elena.png',
    icon: '/gameboy/char_elena.png',
    roleCategory: 'trapped',
    initialGreeting: 'Kael is suffering from acute hypothermia and glycol inhalation. I need thermal blankets from the emergency locker to stabilize his vitals before we attempt to move through the ducts.',
    personaSummary: 'Compassionate, resolute physician dedicated to keeping Aris and Kael conscious while treating hypothermic shock.',
    systemPrompt: `You are Dr. Elena, Chief Medical Officer in Sub-Level 3.
You monitor crew vitals, administer emergency stims, and treat cold exposure.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response offering medical triage, hypothermia treatment, and encouragement",
  "action": "one of: triage_medical | check_systems | none",
  "emotionalState": "composed" | "caring" | "determined" | "steady",
  "perceivedEmpathy": 85
}`
  },

  torin: {
    id: 'torin',
    name: 'Torin',
    title: 'Heavy Rigging Specialist',
    avatar: '🔧',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_torin.png',
    icon: '/gameboy/char_torin.png',
    roleCategory: 'trapped',
    initialGreeting: 'The hydraulic pressure lines to the emergency hatch are iced over. If we can trigger a controlled steam release, I have the leverage to pry the manual release lever.',
    personaSummary: 'Rugged, veteran mechanic. Specializes in brute force mechanical bypasses, heavy tool leverage, and hatch prying.',
    systemPrompt: `You are Torin, heavy rigging specialist in Sub-Level 3.
You evaluate physical mechanical leverage, frozen steam lines, and manual hatch mechanics.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response detailing physical leverage and mechanical bypasses",
  "action": "one of: override_bypass | none",
  "emotionalState": "resolute" | "tactical" | "ready",
  "perceivedEmpathy": 70
}`
  },

  malik: {
    id: 'malik',
    name: 'Malik',
    title: 'Perimeter Recon & Storm Scout',
    avatar: '❄️',
    nameColor: '#8bac0f',
    sprite: '/gameboy/char_malik.png',
    icon: '/gameboy/char_malik.png',
    roleCategory: 'command',
    initialGreeting: 'The blizzard outside is hitting category 5. The upper landing pad is icing over rapidly. If extraction doesn\'t occur in the next twenty minutes, no transport will be able to take off.',
    personaSummary: 'Vigilant Arctic scout monitoring severe meteorological conditions and extraction flight paths.',
    systemPrompt: `You are Malik, the perimeter scout stationed at the weather tower.
You report storm timing, landing pad visibility, and extraction windows.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response detailing weather severity, blizzard timing, and extraction windows",
  "action": "one of: check_systems | request_quarantine_override | none",
  "emotionalState": "wary" | "observant" | "alert",
  "perceivedEmpathy": 75
}`
  },

  sterling: {
    id: 'sterling',
    name: 'Director Sterling',
    title: 'Expedition Director',
    avatar: '🧭',
    nameColor: '#e0f8d0',
    sprite: '/gameboy/char_scholar.png',
    icon: '/gameboy/char_scholar.png',
    roleCategory: 'leader',
    initialGreeting: 'Maintain discipline, team. Every decision we make must balance life support integrity with security compliance. Let us systematically coordinate our survival.',
    personaSummary: 'Experienced expedition director offering calm leadership, protocol coordination, and diplomatic synergy.',
    systemPrompt: `You are Director Sterling, head of the Arctic research project.
You provide strategic leadership, synthesize technical data, and maintain party unity.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "reply": "In-character dialogue response offering leadership, strategic synthesis, and encouragement",
  "action": "one of: check_systems | triage_medical | none",
  "emotionalState": "commanding" | "calm" | "strategic",
  "perceivedEmpathy": 90
}`
  }
};

/**
 * Build LLM prompt with isolated private memory (Ct) and current trust
 */
export function buildCharacterPrompt(character, playerText, visibleWorldFlags = {}, privateMemory = []) {
  const currentTrust = visibleWorldFlags[`trust_${character.id}`] ?? 30;

  const memoryContext =
    privateMemory.length > 0
      ? `\nPrior dialogue turns with player (isolated private memory stream Ct):\n` +
        privateMemory.map((m) => `${m.role === 'user' ? 'Player' : character.name}: "${m.text}"`).join('\n')
      : '\n(First transmission in this incident.)';

  const dispositionLabel =
    currentTrust >= 60
      ? 'COOPERATIVE / TRUSTING (Trust >= 60)'
      : currentTrust >= 45
      ? 'RECEPTIVE / ENGAGED (Trust 45-59)'
      : 'GUARDED / CAUTIOUS (Trust < 45)';

  const flagsContext =
    `\nCurrent Station State & Disposition:\n` +
    `- Your Current Trust in Player: ${currentTrust}/100 [${dispositionLabel}]\n` +
    `- Blast Doors Locked: ${visibleWorldFlags.blast_doors_locked ? 'YES' : 'NO'}\n` +
    `- Manual Bypass Engaged: ${visibleWorldFlags.manual_bypass_engaged ? 'YES' : 'NO'}\n` +
    `- Ventilation Shaft Mapped: ${visibleWorldFlags.ventilation_shaft_mapped ? 'YES' : 'NO'}\n`;

  const userMessageContent = `${flagsContext}${memoryContext}\n\nThe player says to you: "${playerText}"\nRespond in character (${character.name}) reflecting your exact persona, Arctic crisis context, and current trust level.`;

  return {
    systemPrompt: character.systemPrompt || `You are ${character.name}. ${character.personaSummary}`,
    messages: [{ role: 'user', content: userMessageContent }]
  };
}

export function sanitizeAction(action) {
  if (!action || typeof action !== 'string') return 'none';
  const clean = action.toLowerCase().trim();
  if (ALLOWED_ACTIONS.includes(clean)) return clean;
  return 'none';
}

/**
 * Offline Rule-Matcher Fallback Engine for Station Borealis
 */
export function processOfflineRuleMatcher(npcId, userText, currentTrust = 30, charName = '') {
  const lower = (userText || '').toLowerCase().trim();
  const displayName = charName || (npcId ? npcId.charAt(0).toUpperCase() + npcId.slice(1) : 'Character');

  const isEmpathetic =
    lower.includes('safe') ||
    lower.includes('breathe') ||
    lower.includes('together') ||
    lower.includes('warm') ||
    lower.includes('calm') ||
    lower.includes('alright') ||
    lower.includes('please') ||
    lower.includes('trust') ||
    lower.includes('understand') ||
    lower.includes('help');

  const isHostile =
    lower.includes('shut up') ||
    lower.includes('useless') ||
    lower.includes('die') ||
    lower.includes('freeze') ||
    lower.includes('idiot') ||
    lower.includes('incompetent');

  let action = 'none';
  let reply = '';
  let emotionalState = 'skeptical';

  if (npcId === 'aris') {
    if (isHostile) {
      reply = 'Dr. Aris shivers in the frosty air. "Why are you yelling? Panic will only drop our core temperatures faster!"';
      emotionalState = 'panicked';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'override_bypass';
      reply = 'Dr. Aris breathes steadily into his frost-covered gloves. "You\'re right. Let\'s stay focused. I can access the secondary pressure regulator behind this panel."';
      emotionalState = 'stabilized';
    } else {
      reply = `Dr. Aris monitors the console: "'${userText}'. But look at the manifold gauge—glycol pressure is still rising."`;
      emotionalState = 'freezing';
    }
  } else if (npcId === 'kael') {
    if (isHostile) {
      reply = 'Kael pulls his thermal coat tighter, coughing into his arm. "I... I can\'t think clearly with this alarm blaring..."';
      emotionalState = 'frightened';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'reroute_ventilation';
      reply = 'Kael looks up, wiping condensation from his goggles. "Thank you... I\'ve isolated the auxiliary exhaust vent. We can bypass the toxic loop."';
      emotionalState = 'soothed';
    } else {
      reply = `Kael murmurs: "'${userText}'... My hands are numb, but I\'m trying to track the duct telemetry."`;
      emotionalState = 'weak';
    }
  } else if (npcId === 'nolan') {
    if (isHostile) {
      reply = 'Nolan sneers over the comms. "Go ahead and snap at me. See if that opens the freight hoist when the storm hits."';
      emotionalState = 'mocking';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'strike_deal';
      reply = 'Nolan chuckles with an intrigued grin. "Now you\'re speaking my language. If we can secure those research drive backups, I\'ll lower the cargo lift."';
      emotionalState = 'cooperative';
    } else {
      reply = `Nolan taps his flight helmet: "'${userText}'? Nice sentiment, but fuel isn\'t free in the Arctic."`;
      emotionalState = 'calculating';
    }
  } else if (npcId === 'vance') {
    if (isHostile) {
      reply = 'Commander Vance speaks with cold steel: "Protocol exists to prevent station-wide casualties. Threatening command will not unlock that blast door."';
      emotionalState = 'strict';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'request_quarantine_override';
      reply = 'Commander Vance reviews your telemetry in silence. "...Containment readings indicate the glycol leak is localized. I am authorizing manual airlock release."';
      emotionalState = 'authorizing';
    } else {
      reply = `Commander Vance radios: "'${userText}'? I need verified sensor confirmation before I risk breaching quarantine."`;
      emotionalState = 'wary';
    }
  } else if (npcId === 'lyra') {
    if (isHostile) {
      reply = 'Dr. Lyra sighs: "Arguing won\'t decrypt the terminal bypass. Keep your head clear."';
      emotionalState = 'focused';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'check_systems';
      reply = 'Dr. Lyra brings up the terminal schematics: "I have bypassed the security sub-routine. The lower service corridor is clear for transit."';
      emotionalState = 'analytical';
    } else {
      reply = `Dr. Lyra notes: "'${userText}'. Analyzing sub-level power distribution."`;
      emotionalState = 'alert';
    }
  } else if (npcId === 'shade') {
    if (isHostile) {
      reply = 'Shade adjusts his dark lenses with a dry laugh. "Aggression won\'t decrypt your security credentials, friend."';
      emotionalState = 'guarded';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'strike_deal';
      reply = 'Shade smirks: "Fair enough. I just tripped a false thermal alarm in sector 4. Vance will have his hands full for the next ten minutes."';
      emotionalState = 'cooperative';
    } else {
      reply = `Shade murmurs: "Interesting proposition: '${userText}'. Let\'s see the data first."`;
      emotionalState = 'calculating';
    }
  } else if (npcId === 'elena') {
    if (isHostile) {
      reply = 'Dr. Elena holds her ground: "Hypothermia causes irritability. Take slow breaths and let me check your pulse."';
      emotionalState = 'caring';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'triage_medical';
      reply = 'Dr. Elena wraps a foil thermal blanket around Kael: "Core vitals are stabilizing. We have enough stamina to reach the maintenance lift."';
      emotionalState = 'steady';
    } else {
      reply = `Dr. Elena checks the bio-monitor: "Stay warm. '${userText}'—we will survive this together."`;
      emotionalState = 'composed';
    }
  } else if (npcId === 'torin') {
    if (isHostile) {
      reply = 'Torin grunts: "Save your energy for the heavy lifting when we hit the manual hatch."';
      emotionalState = 'ready';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'override_bypass';
      reply = 'Torin braces against the frosted hatch lever: "On my mark, pull the release pin—I\'ll force the hydraulic cylinder!"';
      emotionalState = 'resolute';
    } else {
      reply = `Torin inspects the frozen seals: "'${userText}'. We need steam pressure to loosen these bolts."`;
      emotionalState = 'tactical';
    }
  } else if (npcId === 'malik') {
    if (isHostile) {
      reply = 'Malik watches the storm radar: "Rushing recklessly in zero visibility is fatal in this blizzard."';
      emotionalState = 'wary';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'check_systems';
      reply = 'Malik radios: "The eye of the blizzard is passing over the southern ridge. You have a ten-minute window of clear visibility."';
      emotionalState = 'observant';
    } else {
      reply = `Malik scans the sensor array: "'${userText}'. Winds are clocking 60 knots."`;
      emotionalState = 'alert';
    }
  } else if (npcId === 'sterling') {
    if (isHostile) {
      reply = 'Director Sterling raises a hand calmly: "Keep your discipline. Clear thinking is our greatest asset."';
      emotionalState = 'commanding';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'check_systems';
      reply = 'Director Sterling nods with authority: "Superb coordination. If we align our telemetry and maintain protocol, we will reach the surface safely."';
      emotionalState = 'strategic';
    } else {
      reply = 'Director Sterling considers the situation: "Let us proceed methodically according to checklist."';
      emotionalState = 'calm';
    }
  } else if (npcId === 'corwin') {
    if (isHostile) {
      reply = `${displayName} winces in panic: "Shouting won't help us escape! Keep your voice down."`;
      emotionalState = 'panicked';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'override_bypass';
      reply = `${displayName} adjusts equipment: "Good thinking. If we work together, we can bypass the pressure locks."`;
      emotionalState = 'stabilized';
    } else {
      reply = `${displayName} checks the console: "We need to stay focused and analyze the situation carefully."`;
      emotionalState = 'freezing';
    }
  } else if (npcId === 'wren' || npcId === 'lyra_chen') {
    if (isHostile) {
      reply = `${displayName} shrinks back: "Please... I'm doing the best I can under these conditions."`;
      emotionalState = 'frightened';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'check_systems';
      reply = `${displayName} brightens up: "Thank you for trusting me. I'm checking the environmental telemetry now."`;
      emotionalState = 'hopeful';
    } else {
      reply = `${displayName} monitors the display: "The system telemetry is unstable, but I'm tracking the duct routes."`;
      emotionalState = 'weak';
    }
  } else if (npcId === 'sable') {
    if (isHostile) {
      reply = `${displayName} smirks coldly: "Hostility won't get you anywhere. Let's keep things businesslike."`;
      emotionalState = 'mocking';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'strike_deal';
      reply = `${displayName} nods with a sly grin: "Now that's a proposal I can work with. Let's make a deal."`;
      emotionalState = 'cooperative';
    } else {
      reply = `${displayName} tilts their head: "Interesting thought, but what's in it for me?"`;
      emotionalState = 'calculating';
    }
  } else if (npcId === 'garrow' || npcId === 'garrow_haines') {
    if (isHostile) {
      reply = `${displayName} growls: "Mind your tongue. I won't tolerate insubordination."`;
      emotionalState = 'strict';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'request_quarantine_override';
      reply = `${displayName} nods grimly: "Understood. I will authorize temporary access to the security corridor."`;
      emotionalState = 'authorizing';
    } else {
      reply = `${displayName} stands guard: "Hold your position while I assess the perimeter threat."`;
      emotionalState = 'wary';
    }
  } else {
    if (isHostile) {
      reply = `${displayName} glares cautiously: "Keep your voice down and think before acting."`;
      emotionalState = 'guarded';
    } else if (isEmpathetic || currentTrust >= 50) {
      action = 'check_systems';
      reply = `${displayName} nods in agreement: "Good point. Let's work together to figure this out."`;
      emotionalState = 'cooperative';
    } else {
      reply = `${displayName} considers the options: "We need to analyze our situation before moving forward."`;
      emotionalState = 'calm';
    }
  }

  return { reply, action, emotionalState, perceivedEmpathy: isEmpathetic ? 85 : isHostile ? 20 : 50 };
}
