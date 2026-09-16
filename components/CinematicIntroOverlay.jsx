'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '@/lib/soundFx';

const DEFAULT_INTRO_BEATS = [
  {
    id: 'beat_1_blackout',
    type: 'blackout',
    text: 'Deep Sector Emergency. Incident Active.',
    bg: null,
    duration: 2500
  },
  {
    id: 'beat_2_flashback',
    type: 'flashback',
    text: 'An advanced research outpost experiencing a critical system crisis.',
    sprite: '/gameboy/char_scholar.png',
    duration: 3800
  },
  {
    id: 'beat_3_rupture',
    type: 'narration',
    text: 'Emergency Lockdown Triggered: Containment bulkheads seal as warning alarms echo through the facility.',
    sprite: '/gameboy/char_corwin.png',
    duration: 4000
  },
  {
    id: 'beat_4_awakening',
    type: 'narration',
    text: 'Now: Coordinate across specialists using technical problem solving, empathy, and tactical negotiation to escape.',
    sprite: '/gameboy/char_lyra.png',
    duration: 4000
  },
  {
    id: 'beat_5_title',
    type: 'title',
    title: 'DYNAMIC FICTION',
    title: 'ADYTUM FICTION',
    subtitle: 'IEEE Multi-Agent Story Engine',
    sprite: null,
    duration: 3200
  }
];

export default function CinematicIntroOverlay({ isOpen, onComplete, activeScenario = null }) {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasFinishedRef = useRef(false);

  // Build beats dynamically from active scenario with balanced male & female representation
  const introBeats = activeScenario && activeScenario.characters?.length > 0
    ? (() => {
        const chars = activeScenario.characters;
        const char1 = chars[0];
        // Select char2 of different gender if available to ensure gender diversity in cutscene
        const char2 = chars.find((c) => c.gender !== char1.gender) || chars[1] || chars[0];
        const char3 = chars.find((c) => c.id !== char1.id && c.id !== char2.id) || chars[chars.length - 1] || char1;

        return [
          {
            id: 'beat_1_blackout',
            type: 'blackout',
            text: activeScenario.locationBadge || `${activeScenario.title?.toUpperCase()} · INCIDENT ACTIVE`,
            duration: 2500
          },
          {
            id: 'beat_2_flashback',
            type: 'flashback',
            speaker: char1.name,
            title: char1.title,
            text: `SCENARIO: ${activeScenario.title} (${activeScenario.genre}). ${activeScenario.description}`,
            sprite: char1.sprite || '/gameboy/char_corwin.png',
            duration: 4000
          },
          {
            id: 'beat_3_rupture',
            type: 'narration',
            speaker: char2.name,
            title: char2.title,
            text: char2.dialogue || `${char2.name} monitors emergency telemetry as the crisis escalates.`,
            sprite: char2.sprite || '/gameboy/char_lyra.png',
            duration: 4200
          },
          {
            id: 'beat_4_awakening',
            type: 'narration',
            speaker: char3.name,
            title: char3.title,
            text: `Active Operatives: ${chars.map((c) => `${c.name} (${c.title})`).join(', ')}. Establish trust and coordinate your escape.`,
            sprite: char3.sprite || '/gameboy/char_garrow.png',
            duration: 4200
          },
          {
            id: 'beat_5_title',
            type: 'title',
            title: activeScenario.title || 'DYNAMIC INTERACTIVE STORY',
            subtitle: activeScenario.genre || 'Multi-Agent Interactive Fiction',
            sprite: null,
            duration: 3200
          }
        ];
      })()
    : DEFAULT_INTRO_BEATS;

  useEffect(() => {
    if (!isOpen) return;
    setCurrentBeatIndex(0);
    hasFinishedRef.current = false;
    setIsFadingOut(false);
    const skipTimer = setTimeout(() => setShowSkip(true), 1200);
    return () => clearTimeout(skipTimer);
  }, [isOpen, activeScenario]);

  const triggerFadeOutAndComplete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete && onComplete();
    }, 600);
  };

  // Handle beat timers
  useEffect(() => {
    if (!isOpen) return;

    const currentBeat = introBeats[currentBeatIndex];
    if (!currentBeat) {
      triggerFadeOutAndComplete();
      return;
    }

    if (currentBeatIndex === 1) {
      sfx.play('click');
    }

    const timer = setTimeout(() => {
      if (currentBeatIndex < introBeats.length - 1) {
        setCurrentBeatIndex((prev) => prev + 1);
      } else {
        triggerFadeOutAndComplete();
      }
    }, currentBeat.duration);

    return () => clearTimeout(timer);
  }, [isOpen, currentBeatIndex, introBeats]);

  if (!isOpen) return null;

  const currentBeat = introBeats[currentBeatIndex] || introBeats[0];

  const handleAdvanceOrSkip = () => {
    if (isFadingOut) return;
    if (currentBeatIndex < introBeats.length - 1) {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      triggerFadeOutAndComplete();
    }
  };

  const handleSkipAll = (e) => {
    e.stopPropagation();
    triggerFadeOutAndComplete();
  };

  return (
    <div
      className={`cinematic-intro-overlay gameboy-intro ${isFadingOut ? 'fading-out' : ''}`}
      onClick={handleAdvanceOrSkip}
    >
      <div className="gameboy-crt-scanlines" />

      {/* Sprite / Incident Art Frame */}
      {currentBeat.sprite && (
        <div className="intro-sprite-layer fadeInOut">
          <img
            key={currentBeat.sprite}
            src={currentBeat.sprite}
            alt="Scenario Art"
            className="gameboy-intro-pixel-art"
          />
        </div>
      )}

      {/* BEAT 1: Opening location tag */}
      {currentBeat.type === 'blackout' && (
        <div className="intro-center-container fadeInOut">
          <span className="live-pulse-dot-gb" style={{ marginBottom: '12px' }} />
          <p className="intro-opening-text gameboy-green-text">
            &ldquo;{currentBeat.text}&rdquo;
          </p>
        </div>
      )}

      {/* BEATS 2, 3 & 4: Incident Narration & Character Badges */}
      {(currentBeat.type === 'narration' || currentBeat.type === 'flashback') && (
        <div className="intro-narration-container fadeInOut gameboy-narration-box">
          {currentBeat.speaker && (
            <div className="intro-char-badge-header">
              <span className="gb-intro-speaker-name">{currentBeat.speaker}</span>
              {currentBeat.title && (
                <span className="gb-intro-speaker-title">[{currentBeat.title}]</span>
              )}
            </div>
          )}
          <p className="intro-narration-paragraph">
            {currentBeat.text}
          </p>
        </div>
      )}

      {/* BEAT 5: Cinematic Title Reveal */}
      {currentBeat.type === 'title' && (
        <div className="intro-title-container fadeInOut">
          <div className="intro-title-kicker gameboy-kicker">IEEE MULTI-AGENT STORY ENGINE</div>
          <h1 className="intro-main-title gameboy-title">{currentBeat.title}</h1>
          <div className="intro-sub-title gameboy-subtitle">{currentBeat.subtitle}</div>
          <div className="intro-click-hint" style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Click anywhere or press Enter to launch scenario...
          </div>
        </div>
      )}

      {/* Skip Button */}
      {showSkip && !isFadingOut && (
        <button
          onClick={handleSkipAll}
          className="intro-skip-btn gameboy-skip-btn"
          title="Skip prologue and enter story"
        >
          Skip Prologue [Enter] →
        </button>
      )}
    </div>
  );
}
