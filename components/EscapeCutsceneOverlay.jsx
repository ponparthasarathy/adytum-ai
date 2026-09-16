'use client';

import React, { useState, useEffect } from 'react';
import { sfx } from '@/lib/soundFx';

const DEFAULT_ENDING_CONFIGS = {
  honor: {
    id: 'ending_quarantine_override',
    title: 'Command Airlock Clearance',
    subtitle: 'Decontamination Release Authorized',
    scenes: [
      {
        speaker: 'Commander Vance',
        title: 'Security Chief',
        sprite: '/gameboy/char_garrow.png',
        text: 'System telemetry confirms all emergency criteria met. Life support scrubbers green. Authorizing airlock release.'
      },
      {
        speaker: 'Dr. Aris',
        title: 'Lead Geothermal Engineer',
        sprite: '/gameboy/char_corwin.png',
        text: 'The team steps through the pressurized airlock into safety, the isolated sector sealed securely behind.'
      },
      {
        speaker: 'Director Sterling',
        title: 'Expedition Director',
        sprite: '/gameboy/char_scholar.png',
        text: 'With all personnel accounted for, the expedition leader logs the successful resolution and protocol execution.'
      }
    ]
  },
  rogue: {
    id: 'ending_cargo_extraction',
    title: 'Contract Cargo Hoist Extraction',
    subtitle: 'Freight Lift Extraction Arranged',
    scenes: [
      {
        speaker: 'Nolan',
        title: 'Contract Supply Pilot',
        sprite: '/gameboy/char_sable.png',
        text: 'The encrypted survey telemetry drive is secured into the console as a decoy alarm pulls security away.'
      },
      {
        speaker: 'Shade',
        title: 'Comms Fixer',
        sprite: '/gameboy/char_shade.png',
        text: 'The heavy freight elevator ascends through the central shaft, carrying the team to the upper staging pad.'
      },
      {
        speaker: 'Director Sterling',
        title: 'Expedition Director',
        sprite: '/gameboy/char_scholar.png',
        text: 'The transport engines throttle up into the storm. Valuable research preserved, crew extraction complete.'
      }
    ]
  },
  stealth: {
    id: 'ending_ventilation_bypass',
    title: 'Auxiliary Exhaust Duct Traverse',
    subtitle: 'Service Tunnel Traversed into Shelter',
    scenes: [
      {
        speaker: 'Dr. Lyra',
        title: 'Systems Architect',
        sprite: '/gameboy/char_lyra.png',
        text: 'Following the auxiliary schematics, the frozen exhaust duct release is forced open.'
      },
      {
        speaker: 'Malik',
        title: 'Perimeter Scout',
        sprite: '/gameboy/char_malik.png',
        text: 'The scout guides the team through the sub-zero maintenance trench into safety.'
      },
      {
        speaker: 'Director Sterling',
        title: 'Expedition Director',
        sprite: '/gameboy/char_scholar.png',
        text: 'One by one, the crew arrives at the emergency shelter, securing the pressure hatch.'
      }
    ]
  }
};

export default function EscapeCutsceneOverlay({
  endingType = 'honor',
  isOpen,
  onRestart,
  aggregateMetrics,
  sessionState
}) {
  const [phase, setPhase] = useState('title');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeScenario = sessionState?.activeScenario;

  // Build dynamic ending config aligned with active scenario characters & vectors with gender balance
  const ending = activeScenario && activeScenario.characters?.length > 0
    ? (() => {
        const chars = activeScenario.characters;
        const char1 = chars[0];
        const char2 = chars.find((c) => c.gender !== char1.gender) || chars[1] || chars[0];
        const char3 = chars.find((c) => c.id !== char1.id && c.id !== char2.id) || chars[chars.length - 1] || char1;
        const selectedChars = [char1, char2, char3].filter((c, i, self) => self.findIndex((t) => t.id === c.id) === i);

        return {
          id: `ending_${endingType}`,
          title: activeScenario.title || 'Scenario Resolution',
          subtitle: activeScenario.genre || 'Multi-Agent Interactive Fiction',
          scenes: selectedChars.map((c, idx) => {
            const vectorText = activeScenario.extractionVectors?.[idx]?.description || activeScenario.extractionVectors?.[0]?.description || 'Emergency resolved.';
            let text = '';
            if (idx === 0) {
              text = `${c.name} (${c.title}) monitors the console: "${vectorText}"`;
            } else if (idx === 1) {
              text = `${c.name} coordinates with the team to bypass sector locks and secure the extraction route.`;
            } else {
              text = `With all operatives accounted for, ${c.name} confirms total mission success and crisis resolution.`;
            }

            return {
              speaker: c.name,
              title: c.title,
              sprite: c.sprite,
              text
            };
          })
        };
      })()
    : DEFAULT_ENDING_CONFIGS[endingType] || DEFAULT_ENDING_CONFIGS.honor;

  const currentScene = ending.scenes[sceneIndex] || ending.scenes[0] || { sprite: '/gameboy/char_corwin.png', text: 'Scenario completed successfully.' };

  // Handle initial reset & audio
  useEffect(() => {
    if (!isOpen) {
      setPhase('title');
      setSceneIndex(0);
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    sfx.play('victory');
    setPhase('title');
    setSceneIndex(0);
    setDisplayedText('');

    const titleTimer = setTimeout(() => {
      setPhase('epilogue');
    }, 2000);

    return () => clearTimeout(titleTimer);
  }, [isOpen, endingType, activeScenario]);

  // Typewriter effect during epilogue phase for current scene
  useEffect(() => {
    if (!isOpen || phase !== 'epilogue') return;

    let idx = 0;
    const fullText = currentScene.text || '';
    setDisplayedText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      idx += 1;
      setDisplayedText(fullText.slice(0, idx));
      if (idx % 3 === 0) {
        sfx.play('talk');
      }

      if (idx >= fullText.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 18);

    return () => clearTimeout(timer);
  }, [isOpen, phase, sceneIndex, currentScene.text]);

  if (!isOpen) return null;

  const handleSkipOrAdvance = () => {
    if (phase === 'title') {
      setPhase('epilogue');
    } else if (isTyping) {
      setDisplayedText(currentScene.text || '');
      setIsTyping(false);
    } else if (sceneIndex < ending.scenes.length - 1) {
      setSceneIndex((prev) => prev + 1);
      sfx.play('click');
    }
  };

  const metrics = aggregateMetrics || {
    totalTurns: 4,
    avgEmpathy: 88,
    avgAssertiveness: 75,
    avgAgency: 80,
    avgPersonaConsistency: 95,
    avgNarrativeCoherence: 94
  };

  const isFinalScene = sceneIndex === ending.scenes.length - 1;

  return (
    <div className="fullbleed-ending-overlay gameboy-ending-overlay" onClick={handleSkipOrAdvance}>
      <div className="gameboy-crt-scanlines" />

      {/* Center Character Portrait Frame */}
      {currentScene.sprite && (
        <div className="gameboy-cutscene-sprite-frame">
          <img
            key={currentScene.sprite}
            src={currentScene.sprite}
            alt="Ending Scene"
            className="gameboy-cutscene-pixel-art"
          />
        </div>
      )}

      {/* PHASE 1: Centered Cinematic Title */}
      {phase === 'title' && (
        <div className="fullbleed-title-container gameboy-title-container">
          <div className="fullbleed-chapter-label gameboy-kicker">SCENARIO RESOLUTION</div>
          <h1 className="fullbleed-main-title gameboy-title">{ending.title}</h1>
          <div className="fullbleed-sub-title gameboy-subtitle">{ending.subtitle}</div>
          <div className="fullbleed-advance-hint gameboy-hint">Click anywhere to proceed [Enter]</div>
        </div>
      )}

      {/* PHASE 2: Floating Atmospheric Narration */}
      {phase === 'epilogue' && (
        <div className="fullbleed-narrative-container gameboy-narrative-container">
          <div className="fullbleed-narration-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {currentScene.speaker && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{currentScene.speaker}</span>
                  {currentScene.title && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>[{currentScene.title}]</span>
                  )}
                </div>
              )}
            </div>
            <span className="gb-scene-counter">
              Log Entry {sceneIndex + 1} of {ending.scenes.length}
            </span>
          </div>

          <p className="fullbleed-epilogue-paragraph gameboy-paragraph" style={{ marginTop: '10px' }}>
            {displayedText}
            {isTyping && <span className="gameboy-cursor" />}
          </p>

          {!isTyping && !isFinalScene && (
            <div className="gb-advance-cta">
              Click to continue debriefing... →
            </div>
          )}

          {/* Research Metrics & Replay Link */}
          {isFinalScene && !isTyping && (
            <div className="fullbleed-footnote-bar gameboy-footnote-bar">
              <div className="fullbleed-stats-line gb-stats-line">
                <span>Empathy {metrics.avgEmpathy}%</span>
                <span className="dot-sep">·</span>
                <span>Agency {metrics.avgAgency}%</span>
                <span className="dot-sep">·</span>
                <span>Persona Fidelity {metrics.avgPersonaConsistency}%</span>
                <span className="dot-sep">·</span>
                <span>Coherence {metrics.avgNarrativeCoherence}%</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestart && onRestart();
                }}
                className="fullbleed-replay-link gameboy-replay-btn"
                title="Reset and explore another scenario vector"
              >
                ↻ Replay Another Vector
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
