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
    subtitle: 'Multi-Agent Story Engine',
    sprite: null,
    duration: 3200
  }
];

export default function CinematicIntroOverlay({ isOpen, onComplete, activeScenario = null }) {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasFinishedRef = useRef(false);

  // Build beats dynamically from active scenario if provided
  const introBeats = activeScenario
    ? [
        {
          id: 'beat_1_blackout',
          type: 'blackout',
          text: activeScenario.locationBadge || 'EMERGENCY INCIDENT ZONE',
          duration: 2500
        },
        {
          id: 'beat_2_flashback',
          type: 'flashback',
          text: `${activeScenario.title}: ${activeScenario.genre}`,
          sprite: activeScenario.characters?.[0]?.sprite || '/gameboy/char_corwin.png',
          duration: 3800
        },
        {
          id: 'beat_3_rupture',
          type: 'narration',
          text: activeScenario.description || 'An emergency crisis has occurred.',
          sprite: activeScenario.characters?.[1]?.sprite || '/gameboy/char_wren.png',
          duration: 4200
        },
        {
          id: 'beat_4_awakening',
          type: 'narration',
          text: `Active Operatives: ${activeScenario.characters?.map((c) => c.name).join(', ')}. Coordinate to resolve the emergency.`,
          sprite: activeScenario.characters?.[2]?.sprite || '/gameboy/char_sable.png',
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
      ]
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

      {/* Sprite / Incident Art */}
      {currentBeat.sprite && (
        <div className="intro-sprite-layer fadeInOut">
          <img
            src={currentBeat.sprite}
            alt="Scenario Art"
            className="gameboy-intro-pixel-art"
          />
        </div>
      )}

      {/* BEAT 1: Opening location tag */}
      {currentBeat.type === 'blackout' && (
        <div className="intro-center-container fadeInOut">
          <p className="intro-opening-text gameboy-green-text">
            &ldquo;{currentBeat.text}&rdquo;
          </p>
        </div>
      )}

      {/* BEATS 2, 3 & 4: Incident Narration */}
      {(currentBeat.type === 'narration' || currentBeat.type === 'flashback') && (
        <div className="intro-narration-container fadeInOut gameboy-narration-box">
          <p className="intro-narration-paragraph">
            {currentBeat.text}
          </p>
        </div>
      )}

      {/* BEAT 5: Cinematic Title Reveal */}
      {currentBeat.type === 'title' && (
        <div className="intro-title-container fadeInOut">
          <div className="intro-title-kicker gameboy-kicker">IEEE MULTI-AGENT ADVENTURE</div>
          <h1 className="intro-main-title gameboy-title">{currentBeat.title}</h1>
          <div className="intro-sub-title gameboy-subtitle">{currentBeat.subtitle}</div>
        </div>
      )}

      {/* Skip Button */}
      {showSkip && !isFadingOut && (
        <button
          onClick={handleSkipAll}
          className="intro-skip-btn gameboy-skip-btn"
          title="Skip prologue and enter station"
        >
          Skip Prologue [Enter] →
        </button>
      )}
    </div>
  );
}
