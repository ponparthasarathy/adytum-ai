'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdytumGameViewport from '@/components/AdytumGameViewport';
import AgentInspector from '@/components/AgentInspector';
import FieldJournalModal from '@/components/FieldJournalModal';
import EscapeCutsceneOverlay from '@/components/EscapeCutsceneOverlay';
import CinematicIntroOverlay from '@/components/CinematicIntroOverlay';
import StoryGeneratorModal from '@/components/StoryGeneratorModal';
import { RANDOM_PROMPTS } from '@/lib/storyGenerator';
import { sfx } from '@/lib/soundFx';

const BOREALIS_CHARACTERS = [
  {
    id: 'aris',
    name: 'Dr. Aris',
    title: 'Lead Geothermal Engineer',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_corwin.png',
    icon: '/gameboy/char_corwin.png',
    category: 'trapped',
    dialogue: 'Kael... Kael, can you hear me through the intercom? The geothermal pressure valve blew out and the sub-level blast doors sealed automatically. The temperature is dropping fast—are you injured?'
  },
  {
    id: 'kael',
    name: 'Kael',
    title: 'Atmospheric Sensor Analyst',
    nameColor: '#c8ff80',
    sprite: '/gameboy/char_wren.png',
    icon: '/gameboy/char_wren.png',
    category: 'trapped',
    dialogue: 'My hands are freezing... The sensor telemetry is flashing red. Toxic glycol vapor is leaking into the auxiliary air intake. If we don\'t reroute the ventilation, we\'ll suffocate before the storm breaks...'
  },
  {
    id: 'nolan',
    name: 'Nolan',
    title: 'Contract Supply Pilot',
    nameColor: '#8bac0f',
    sprite: '/gameboy/char_sable.png',
    icon: '/gameboy/char_sable.png',
    category: 'contractor',
    dialogue: 'Well, well... looks like your high-tech arctic science experiment just turned into an icebox. My sub-orbital transport leaves in thirty minutes. What\'s it worth to you for me to override the freight lift?'
  },
  {
    id: 'vance',
    name: 'Commander Vance',
    title: 'Outpost Security Chief',
    nameColor: '#9bbc0f',
    sprite: '/gameboy/char_garrow.png',
    icon: '/gameboy/char_garrow.png',
    category: 'command',
    dialogue: 'Attention Sub-Level 3. Automated quarantine protocol is in effect. Until bio-containment sensors confirm zero glycol leakage, the blast doors remain locked from command. Do not attempt a manual breach.'
  }
];

const INITIAL_DIALOGUES = {
  aris: 'Kael... Kael, can you hear me through the intercom? The geothermal pressure valve blew out and the sub-level blast doors sealed automatically. The temperature is dropping fast—are you injured?',
  kael: 'My hands are freezing... The sensor telemetry is flashing red. Toxic glycol vapor is leaking into the auxiliary air intake. If we don\'t reroute the ventilation, we\'ll suffocate before the storm breaks...',
  nolan: 'Well, well... looks like your high-tech arctic science experiment just turned into an icebox. My sub-orbital transport leaves in thirty minutes. What\'s it worth to you for me to override the freight lift?',
  vance: 'Attention Sub-Level 3. Automated quarantine protocol is in effect. Until bio-containment sensors confirm zero glycol leakage, the blast doors remain locked from command. Do not attempt a manual breach.'
};

const INITIAL_EMOTIONS = {
  aris: 'panicked',
  kael: 'weak',
  nolan: 'mocking',
  vance: 'strict'
};

const PRESET_DASHBOARD_THEMES = [
  {
    title: '🌊 Submarine Mariana Trench Leak',
    prompt: 'Submarine research vessel stranded at the bottom of the Mariana Trench with a hull leak and flickering power.',
    tag: 'Deep-Sea Hydro Survival'
  },
  {
    title: '🌆 Cyberpunk Skyscraper Vault Heist',
    prompt: 'Cyberpunk neon skyscraper vault heist trapped under an automated AI lockdown.',
    tag: 'Neon Stealth & Hack'
  },
  {
    title: '⌛ Victorian Manor Time Anomaly',
    prompt: 'Haunted Victorian manor library caught in a recurring 30-minute time anomaly.',
    tag: 'Chrono Investigation'
  },
  {
    title: '🚀 Orbital Station Bio-Rupture',
    prompt: 'Orbital space station hydroponics bay facing severe atmospheric pressure loss.',
    tag: 'Sci-Fi Air Scrubber'
  },
  {
    title: '☣️ Post-Apocalyptic Metro Bunker',
    prompt: 'Post-apocalyptic underground metro bunker running out of clean water filters.',
    tag: 'Fallout Survival'
  },
  {
    title: '⛰️ Alpine Ridge Category-5 Blizzard',
    prompt: 'High-altitude alpine research outpost surrounded by an unpredicted Category 5 snowstorm.',
    tag: 'Sub-Zero Freeze'
  }
];

export default function Home() {
  const [activeCharId, setActiveCharId] = useState('aris');
  const [characterDialogues, setCharacterDialogues] = useState(INITIAL_DIALOGUES);
  const [characterEmotions, setCharacterEmotions] = useState(INITIAL_EMOTIONS);

  const [isLoadingDialogue, setIsLoadingDialogue] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isDashboardView, setIsDashboardView] = useState(true); // Start at Landing Dashboard
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const [customPromptInput, setCustomPromptInput] = useState('');
  const [activeCutscene, setActiveCutscene] = useState(null); // 'honor' | 'rogue' | 'stealth' | null
  const [latestEvalToast, setLatestEvalToast] = useState(null);
  const [resetToast, setResetToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [sessionState, setSessionState] = useState({
    sessionId: 'rpg-session-1',
    version: 1,
    activeScenario: null,
    sceneNodes: [],
    transitions: [],
    worldFlags: {
      trust_aris: 40,
      trust_kael: 35,
      trust_nolan: 25,
      trust_vance: 20
    },
    characterMemories: {},
    userActions: [],
    evaluations: [],
    agentTraces: [],
    aggregateMetrics: {
      totalTurns: 0,
      avgEmpathy: 78,
      avgAssertiveness: 68,
      avgAgency: 72,
      avgPersonaConsistency: 95,
      avgNarrativeCoherence: 92,
      personaContradictionCount: 0
    }
  });

  const [modelConfig, setModelConfig] = useState({
    narratorProvider: 'groq',
    narratorModel: 'openai/gpt-oss-120b',
    characterProvider: 'groq',
    characterModel: 'openai/gpt-oss-120b',
    worldProvider: 'groq',
    worldModel: 'openai/gpt-oss-120b',
    evaluatorProvider: 'groq',
    evaluatorModel: 'openai/gpt-oss-120b'
  });

  // Fetch session state from backend
  const refreshSessionState = useCallback(async () => {
    try {
      const res = await fetch('/api/session?sessionId=rpg-session-1');
      if (res.ok) {
        const data = await res.json();
        setSessionState((prev) => ({ ...prev, ...data }));

        // Update active dialogues if scenario active
        if (data.activeScenario?.characters && data.activeScenario.characters.length > 0) {
          const scenarioDialogues = {};
          const scenarioEmotions = {};
          data.activeScenario.characters.forEach((c) => {
            scenarioDialogues[c.id] = c.dialogue;
            scenarioEmotions[c.id] = 'alert';
          });
          setCharacterDialogues((prev) => ({ ...scenarioDialogues, ...prev }));
          setCharacterEmotions((prev) => ({ ...scenarioEmotions, ...prev }));
        }

        if (data.evaluations && data.evaluations.length > 0) {
          const newest = data.evaluations[data.evaluations.length - 1];
          setLatestEvalToast(newest);
          setTimeout(() => setLatestEvalToast(null), 4500);
        }

        // Automatic Cutscene Trigger Detection
        const flags = data.worldFlags || {};
        if (flags.completed_ending) {
          setActiveCutscene(flags.completed_ending);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh session state:', err);
    }
  }, []);

  useEffect(() => {
    refreshSessionState();
  }, [refreshSessionState]);

  // Handle Dynamic Story Generation via Gemini
  const handleGenerateStory = async (promptText) => {
    const targetPrompt = promptText || customPromptInput || RANDOM_PROMPTS[0];
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: targetPrompt,
          sessionId: 'rpg-session-1',
          modelConfig
        })
      });

      const data = await res.json();
      if (data.success && data.scenario) {
        const firstChar = data.scenario.characters?.[0]?.id || 'aris';
        setActiveCharId(firstChar);

        const newDialogues = {};
        const newEmotions = {};
        data.scenario.characters.forEach((c) => {
          newDialogues[c.id] = c.dialogue;
          newEmotions[c.id] = 'alert';
        });
        setCharacterDialogues(newDialogues);
        setCharacterEmotions(newEmotions);

        setResetToast(`Generated Story: "${data.scenario.title}"`);
        setTimeout(() => setResetToast(null), 4000);
        setIsGeneratorOpen(false);
        setIsDashboardView(false); // Leave Dashboard
        setIsIntroOpen(true);     // Play Dynamic Cinematic Intro Cutscene!
        sfx.play('victory');
        await refreshSessionState();
      }
    } catch (err) {
      console.error('Failed to generate story:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Send dialogue to Multi-Agent Orchestrator
  const handleSendDialogue = async (playerText, specificCharId) => {
    const targetCharId = specificCharId || activeCharId;
    if (!targetCharId || !playerText.trim()) return;

    setIsLoadingDialogue(true);

    try {
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: targetCharId,
          playerText: playerText.trim(),
          sessionId: 'rpg-session-1',
          modelConfig,
          forceOffline: false
        })
      });

      const data = await res.json();

      if (data.reply) {
        setCharacterDialogues((prev) => ({
          ...prev,
          [targetCharId]: data.reply
        }));
      }

      if (data.emotionalState) {
        setCharacterEmotions((prev) => ({
          ...prev,
          [targetCharId]: data.emotionalState
        }));
      }

      if (data.agentTrace) {
        setSessionState((prev) => ({
          ...prev,
          worldFlags: data.worldFlags || prev.worldFlags,
          aggregateMetrics: data.aggregateMetrics || prev.aggregateMetrics,
          agentTraces: [...(prev.agentTraces || []), data.agentTrace]
        }));
      }

      setTimeout(refreshSessionState, 800);
    } catch (err) {
      console.error('Dialogue error:', err);
    } finally {
      setIsLoadingDialogue(false);
    }
  };

  // Toggle OS Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  // Reset Session
  const handleResetSession = async () => {
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', sessionId: 'rpg-session-1' })
      });
      setActiveCharId('aris');
      setActiveCutscene(null);
      setCharacterDialogues(INITIAL_DIALOGUES);
      setCharacterEmotions(INITIAL_EMOTIONS);
      setResetToast('Game state reset to initial protocol');
      setTimeout(() => setResetToast(null), 3000);
      sfx.play('click');
      await refreshSessionState();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'Tab' || e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsInspectorOpen((prev) => !prev);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setIsJournalOpen((prev) => !prev);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsDashboardView(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape') {
        setIsJournalOpen(false);
        setIsInspectorOpen(false);
        setIsGeneratorOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Compute active characters list (from dynamic scenario if active, else default)
  const activeCharactersList =
    sessionState.activeScenario?.characters && sessionState.activeScenario.characters.length > 0
      ? sessionState.activeScenario.characters
      : BOREALIS_CHARACTERS;

  // Make sure activeCharId is valid within current roster
  useEffect(() => {
    if (!activeCharactersList.some((c) => c.id === activeCharId) && activeCharactersList.length > 0) {
      setActiveCharId(activeCharactersList[0].id);
    }
  }, [activeCharactersList, activeCharId]);

  const activeCharObj =
    activeCharactersList.find((c) => c.id === activeCharId) || activeCharactersList[0] || BOREALIS_CHARACTERS[0];
  const activeDialogue = characterDialogues[activeCharId] || activeCharObj.dialogue;
  const currentTrust = sessionState.worldFlags[`trust_${activeCharId}`] ?? 35;
  const activeBadge = sessionState.activeScenario?.locationBadge || null;

  return (
    <main className="adytum-screen-wrapper gameboy-screen-wrapper">
      {/* ── 1. LANDING DASHBOARD VIEW ── */}
      {isDashboardView ? (
        <div className="gameboy-dashboard-container">
          <div className="gameboy-crt-scanlines" />
          <div className="gameboy-dither-backdrop" />

          {/* Header Bar */}
          <header className="dashboard-header-bar">
            <div className="dashboard-brand">
              <span className="live-pulse-dot-gb" />
              <span>ADYTUM: MULTI-AGENT STORY ENGINE</span>
            </div>
            <div className="dashboard-header-actions">
              <button onClick={() => setIsInspectorOpen(true)} className="system-hud-btn">
                <span>🔬 4-Agent Inspector [TAB]</span>
              </button>
              <button onClick={handleToggleFullscreen} className="system-hud-btn">
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen [F]'}</span>
              </button>
            </div>
          </header>

          {/* Main Dashboard Hero */}
          <div className="dashboard-hero-section">
            <div className="dashboard-title-box">
              <span className="dashboard-kicker">ADYTUM · IEEE 4-AGENT INTERACTIVE FICTION</span>
              <h1 className="dashboard-main-title">ADYTUM NARRATIVE ENGINE</h1>
              <p className="dashboard-subtitle">
                Enter a 1-line prompt or pick a preset. Gemini will dynamically select a 3–6 character subset from your 15 GameBoy pixel portraits and generate the entire story, cutscene, and dossiers!
              </p>
            </div>

            {/* Custom Prompt Input Section */}
            <div className="dashboard-prompt-card">
              <label className="dashboard-input-label">WRITE YOUR CUSTOM STORY PREMISE:</label>
              <div className="dashboard-input-row-full">
                <input
                  type="text"
                  value={customPromptInput}
                  disabled={isGeneratingStory}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPromptInput.trim()) {
                      handleGenerateStory(customPromptInput.trim());
                    }
                  }}
                  placeholder="e.g. Submarine trapped in Mariana Trench with a hull leak..."
                  className="dashboard-story-input-full"
                />
              </div>

              <div className="dashboard-action-buttons-row">
                <button
                  onClick={() => handleGenerateStory(customPromptInput.trim())}
                  disabled={isGeneratingStory || !customPromptInput.trim()}
                  className="dashboard-launch-btn-primary"
                >
                  {isGeneratingStory ? '⚡ Synthesizing Custom Story...' : '🎮 Launch Custom Story'}
                </button>
              </div>

              {isGeneratingStory && (
                <div className="gb-loading-terminal" style={{ marginTop: '10px' }}>
                  <div className="gb-terminal-header">
                    <span className="live-pulse-dot-gb" />
                    <span>GEMINI SYNTHESIZING DYNAMIC STORY &amp; PERSONAS...</span>
                  </div>
                  <div className="gb-terminal-log">
                    <p>⚡ Calling Gemini LLM Engine...</p>
                    <p>👥 Selecting optimal character subset from 15 pixel portraits...</p>
                    <p>🌐 Generating world state causality (Wt) &amp; opening cutscene...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Themes & Surprise Me Section */}
            <div className="dashboard-presets-section">
              <div className="dashboard-presets-header-row">
                <span className="dashboard-section-label">OR CHOOSE A PRESET STORY / RANDOM GENERATOR:</span>
                <button
                  onClick={() => {
                    const rnd = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
                    setCustomPromptInput(rnd);
                    handleGenerateStory(rnd);
                  }}
                  disabled={isGeneratingStory}
                  className="dashboard-random-btn-standalone"
                >
                  🎲 Surprise Me! (Random Story)
                </button>
              </div>

              <div className="dashboard-presets-grid">
                {PRESET_DASHBOARD_THEMES.map((theme, idx) => (
                  <button
                    key={idx}
                    disabled={isGeneratingStory}
                    onClick={() => {
                      setCustomPromptInput(theme.prompt);
                      handleGenerateStory(theme.prompt);
                    }}
                    className="dashboard-preset-card"
                  >
                    <div className="preset-tag">{theme.tag}</div>
                    <div className="preset-title">{theme.title}</div>
                    <div className="preset-prompt">{theme.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Agent Architecture Blueprint Schematic */}
            <div className="dashboard-blueprint-container">
              <div className="blueprint-header-row">
                <span>⚙️ IEEE 4-AGENT CLOSED-LOOP SYSTEM ARCHITECTURE DIAGRAM</span>
                <span>PIPELINE FLOW: N_t ➔ C_t ➔ W_t ➔ R_t</span>
              </div>
              <div className="dashboard-agents-grid">
                <div className="dashboard-agent-card border-blue">
                  <span className="agent-card-title">1. Narrative Agent (Nt)</span>
                  <p className="agent-card-desc">Synthesizes graph scene nodes (Vt), branch transitions (Et), and narrative pacing.</p>
                </div>
                <div className="dashboard-agent-card border-green">
                  <span className="agent-card-title">2. Character Agent (Ct)</span>
                  <p className="agent-card-desc">Generates dialogue turns, emotional states, and maintains private memory streams.</p>
                </div>
                <div className="dashboard-agent-card border-yellow">
                  <span className="agent-card-title">3. World State Agent (Wt)</span>
                  <p className="agent-card-desc">Tracks environmental flags, door locks, and physical state causality.</p>
                </div>
                <div className="dashboard-agent-card border-purple">
                  <span className="agent-card-title">4. Evaluator Agent (Rt)</span>
                  <p className="agent-card-desc">Evaluates social empathy, assertiveness, agency, and trust progression (Delta T).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── 2. ACTIVE GAME VIEWPORT & CUTSCENES ── */
        <>
          {/* Cinematic Opening Cutscene Overlay */}
          <CinematicIntroOverlay
            isOpen={isIntroOpen}
            onComplete={() => setIsIntroOpen(false)}
            activeScenario={sessionState.activeScenario}
          />

          {/* System HUD Bar */}
          <header className="station-system-hud-bar">
            <div className="system-hud-left">
              <span className="station-brand-tag">
                {sessionState.activeScenario?.title || 'ADYTUM PROTOCOL'}
              </span>
              <span className="station-system-status">
                SYS-STATUS: {sessionState.activeScenario ? 'DYNAMIC AI SCENARIO' : 'QUARANTINE LOCKOUT'}
              </span>
            </div>

            <div className="system-hud-right">
              <button
                onClick={() => setIsDashboardView(true)}
                className="system-hud-btn-highlight"
                title="Return to Story Dashboard & Prompt Hub [G]"
              >
                <span>🎲 Story Hub [G]</span>
              </button>

              <button
                onClick={() => setIsJournalOpen((prev) => !prev)}
                className="system-hud-btn"
                title="Open Station Operations Codex & Dossiers [J]"
              >
                <span>📜 Codex [J]</span>
              </button>

              <button
                onClick={handleResetSession}
                className="system-hud-btn"
                title="Reset Game State to S0 (Start)"
              >
                <span>🔄 Reset</span>
              </button>

              <button
                onClick={handleToggleFullscreen}
                className="system-hud-btn"
                title="Toggle Fullscreen [F]"
              >
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen [F]'}</span>
              </button>

              <button
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                className="system-hud-btn"
                title="Open IEEE 4-Agent Live Deliberation Stream [TAB / I]"
              >
                <span className="live-pulse-dot-gb" />
                <span>Inspector [TAB]</span>
              </button>
            </div>
          </header>

          {/* Toast Notification */}
          {resetToast && (
            <div className="gameboy-toast-notification">
              ✓ {resetToast}
            </div>
          )}

          {/* Evaluator Toast */}
          {latestEvalToast && !resetToast && (
            <div className="gameboy-eval-toast">
              <div className="gb-eval-toast-header">
                <span>Evaluator Agent (Rt)</span>
                <span style={{ color: (latestEvalToast.trustDelta || 0) >= 0 ? '#9bbc0f' : '#8bac0f' }}>
                  {(latestEvalToast.trustDelta || 0) >= 0 ? `+${latestEvalToast.trustDelta}` : latestEvalToast.trustDelta} Trust
                </span>
              </div>
              <div className="gb-eval-toast-body">{latestEvalToast.feedback}</div>
            </div>
          )}

          {/* Retro Game Viewport */}
          <AdytumGameViewport
            activeCharacter={{
              ...activeCharObj,
              dialogue: activeDialogue
            }}
            onSend={handleSendDialogue}
            isLoading={isLoadingDialogue}
            currentTrust={currentTrust}
            introActive={isIntroOpen}
            activeEmotion={characterEmotions[activeCharId] || 'panicked'}
            worldFlags={sessionState.worldFlags}
            locationBadge={activeBadge}
            onSelectCharacter={(id) => {
              setActiveCharId(id);
              sfx.play('talk');
            }}
            availableCharacters={activeCharactersList}
          />
        </>
      )}

      {/* Story Generator Modal */}
      <StoryGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerateStory={handleGenerateStory}
        isGenerating={isGeneratingStory}
      />

      {/* Field Journal / Station Operations Codex Modal */}
      <FieldJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        activeScenario={sessionState.activeScenario}
      />

      {/* Full-Bleed Escape Resolution Cutscene Overlay */}
      <EscapeCutsceneOverlay
        isOpen={!!activeCutscene}
        endingType={activeCutscene || 'honor'}
        onRestart={handleResetSession}
        aggregateMetrics={sessionState.aggregateMetrics}
        sessionState={sessionState}
      />

      {/* 4-Agent Architecture Inspector Drawer */}
      <AgentInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        sessionState={sessionState}
        modelConfig={modelConfig}
        onModelConfigChange={(field, val) =>
          setModelConfig((prev) => ({ ...prev, [field]: val }))
        }
        onResetSession={handleResetSession}
        onRunFacultyDemo={(demoType) => {
          if (demoType === 'empathy_alex') {
            const firstId = activeCharactersList[0]?.id || 'aris';
            setActiveCharId(firstId);
            handleSendDialogue(
              'Take a deep breath. We will stabilize this station together. What do the primary gauges read?',
              firstId
            );
          } else if (demoType === 'trigger_cutscene') {
            setIsInspectorOpen(false);
            setActiveCutscene('honor');
          } else if (demoType === 'replay_intro') {
            setIsInspectorOpen(false);
            setIsIntroOpen(true);
          }
        }}
      />
    </main>
  );
}
