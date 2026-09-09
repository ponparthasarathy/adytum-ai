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
        sprite: '/gameboy/char_garrow.png',
        text: 'System telemetry confirms all emergency criteria met. Life support scrubbers green. Authorizing airlock release.'
      },
      {
        sprite: '/gameboy/char_corwin.png',
        text: 'The specialists step through the pressurized airlock into safety, the isolated sector sealed securely behind.'
      },
      {
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
        sprite: '/gameboy/char_sable.png',
        text: 'The encrypted survey telemetry drive is secured into the console as a decoy alarm pulls security away.'
      },
      {
        sprite: '/gameboy/char_shade.png',
        text: 'The heavy freight elevator ascends through the central shaft, carrying the team to the upper staging pad.'
      },
      {
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
        sprite: '/gameboy/char_lyra.png',
        text: 'Following the auxiliary schematics, the frozen exhaust duct release is forced open.'
      },
      {
        sprite: '/gameboy/char_malik.png',
        text: 'The scout guides the team through the sub-zero maintenance trench into safety.'
      },
      {
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

  // Build dynamic ending config if active scenario exists
  const ending = activeScenario
    ? {
        id: `ending_${endingType}`,
        title: activeScenario.title || 'Scenario Resolution',
        subtitle: activeScenario.genre || 'Multi-Agent Interactive Fiction',
        scenes: (activeScenario.characters || []).slice(0, 3).map((c, idx) => ({
          sprite: c.sprite,
          text:
            idx === 0
              ? `${c.name} monitors the console: "${activeScenario.extractionVectors?.[0]?.description || 'Emergency resolved.'}"`
              : idx === 1
              ? `${c.name} coordinates with the team to finalize the extraction vector and secure the perimeter.`
              : `With all personnel accounted for, ${c.name} confirms full mission success and crisis resolution.`
        }))
      }
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

    return () => clearInterval(timer);
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

      {/* Center Character Portrait */}
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
          <div className="fullbleed-chapter-label gameboy-kicker">CONTAINMENT RESOLUTION</div>
          <h1 className="fullbleed-main-title gameboy-title">{ending.title}</h1>
          <div className="fullbleed-sub-title gameboy-subtitle">{ending.subtitle}</div>
          <div className="fullbleed-advance-hint gameboy-hint">Click anywhere to proceed [Enter]</div>
        </div>
      )}

      {/* PHASE 2: Floating Atmospheric Narration */}
      {phase === 'epilogue' && (
        <div className="fullbleed-narrative-container gameboy-narrative-container">
          <div className="fullbleed-narration-header">
            <h2 className="fullbleed-epilogue-heading gameboy-heading">{ending.title}</h2>
            <span className="gb-scene-counter">
              Log Entry {sceneIndex + 1} of {ending.scenes.length}
            </span>
          </div>

          <p className="fullbleed-epilogue-paragraph gameboy-paragraph">
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
