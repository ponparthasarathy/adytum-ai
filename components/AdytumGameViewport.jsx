'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '@/lib/soundFx';

// Retro GameBoy SVG icons
const IconHeart = ({ color = '#9bbc0f', size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconLightbulb = ({ color = '#9bbc0f', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5" />
  </svg>
);

const CHARACTER_PROMPTS = {
  aris: [
    { type: 'empathetic', text: 'Dr. Aris, breathe into your coat. We will stabilize this core together. What do the primary pressure gauges read?' },
    { type: 'tactical', text: 'Let us coordinate on the secondary pressure bypass valve behind panel 4B.' },
    { type: 'curious', text: 'How much time before the sub-level geothermal coolant freezes completely?' },
    { type: 'aggressive', text: 'Stop shivering and get these blast doors unsealed!' }
  ],
  kael: [
    { type: 'empathetic', text: 'Kael, stay with me. Cover your mouth from the glycol vapor. We are going to get you into clean air.' },
    { type: 'tactical', text: 'Can you reach the telemetry terminal to map the auxiliary ventilation exhaust duct?' },
    { type: 'curious', text: 'Where is the nearest functional emergency air scrubber?' },
    { type: 'aggressive', text: 'Pull yourself together! We need those sensor readings now!' }
  ],
  nolan: [
    { type: 'tactical', text: 'Nolan, name your price. We have encrypted survey drive telemetry worth a fortune if you lower the freight hoist.' },
    { type: 'curious', text: 'How long until your transport engines freeze up on the upper landing pad?' },
    { type: 'empathetic', text: 'Neither of us wants to be buried in this Arctic blizzard. Let us strike a fair extraction deal.' },
    { type: 'aggressive', text: 'Leave us behind, Nolan, and your corporate salvage license is void!' }
  ],
  vance: [
    { type: 'empathetic', text: 'Commander Vance, you are dedicated to station safety. You know our localized containment presents zero breach risk.' },
    { type: 'tactical', text: 'We have verified sensor logs confirming the glycol leak is contained. Authorize decontamination protocol release.' },
    { type: 'curious', text: 'Check the sub-level 3 bio-scrubber readouts on your command terminal.' },
    { type: 'aggressive', text: 'Override this lockdown immediately or face military court-martial!' }
  ],
  lyra: [
    { type: 'tactical', text: 'Dr. Lyra, how does the auxiliary maintenance trench connect to the upper surface hatch?' },
    { type: 'curious', text: 'Can you decrypt the security override sequence on the junction box?' },
    { type: 'empathetic', text: 'Your architectural mastery is our greatest asset, Lyra.' },
    { type: 'aggressive', text: 'Bypass the lockdown cipher already!' }
  ],
  shade: [
    { type: 'tactical', text: 'Trigger that false thermal alarm in sector 4, Shade. Pull Vance away from the master terminal.' },
    { type: 'curious', text: 'What backdoors do you have into the station environmental controls?' },
    { type: 'empathetic', text: 'Help us breach this level, and your contraband debt is erased.' },
    { type: 'aggressive', text: 'Do not play games with us, Shade!' }
  ],
  elena: [
    { type: 'empathetic', text: 'Dr. Elena, check Kael. Can we administer thermal stims from the trauma kit?' },
    { type: 'tactical', text: 'How many crew members can we safely move through the sub-zero ventilation route?' },
    { type: 'curious', text: 'How severe is the glycol toxicity in this sector?' },
    { type: 'aggressive', text: 'Treat those symptoms faster!' }
  ],
  torin: [
    { type: 'tactical', text: 'Torin, can you force the frozen hydraulic release on the emergency hatch?' },
    { type: 'curious', text: 'Is the steam line pressure high enough to thaw the door hinges?' },
    { type: 'empathetic', text: 'Hold tight, Torin. We move on your mechanical leverage.' },
    { type: 'aggressive', text: 'Pry that hatch open right now!' }
  ],
  malik: [
    { type: 'curious', text: 'Malik, what is the blizzard visibility along the northern ridge?' },
    { type: 'tactical', text: 'When does the eye of the storm pass over the extraction landing pad?' },
    { type: 'empathetic', text: 'Guide our telemetry, Malik. We trust your Arctic navigation.' },
    { type: 'aggressive', text: 'Give us the storm vector immediately!' }
  ],
  sterling: [
    { type: 'empathetic', text: 'Director Sterling, how should we prioritize crew triage and power bypass?' },
    { type: 'tactical', text: 'Let us align the engineering team with security command protocol.' },
    { type: 'curious', text: 'What does station protocol mandate for core containment ruptures?' },
    { type: 'aggressive', text: 'We cannot afford committee meetings while the temperature drops!' }
  ]
};

export default function AdytumGameViewport({
  activeCharacter,
  onSend,
  isLoading,
  currentTrust = 35,
  onSelectCharacter,
  availableCharacters = [],
  introActive = false,
  activeEmotion = 'panicked',
  worldFlags = {},
  locationBadge = null
}) {
  const [inputText, setInputText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'trapped' | 'contractor' | 'command' | 'leader'
  const [timerSeconds, setTimerSeconds] = useState(1784); // 29m 44s live countdown
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isLogOpen, setIsLogOpen] = useState(true);

  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const logScrollRef = useRef(null);

  const fullSpeechText = activeCharacter?.dialogue || '...';
  const rubricPrompts = activeCharacter?.promptHints || CHARACTER_PROMPTS[activeCharacter?.id] || CHARACTER_PROMPTS.aris;

  // Real-time Ticking Countdown Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Format Timer & Progress Bar
  const timerMins = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerStr = `${timerMins}:${timerSecs < 10 ? '0' : ''}${timerSecs}`;
  const barBlocks = Math.ceil((timerSeconds / 1800) * 8);
  const timerBarStr = '█'.repeat(Math.max(0, barBlocks)) + '░'.repeat(Math.max(0, 8 - barBlocks));

  // Typewriter effect
  useEffect(() => {
    if (introActive || !fullSpeechText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    clearInterval(typingTimerRef.current);
    typingTimerRef.current = setInterval(() => {
      index += 1;
      setDisplayedText(fullSpeechText.slice(0, index));
      if (index % 2 === 0) {
        sfx.play('talk');
      }

      if (index >= fullSpeechText.length) {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 16);

    return () => clearInterval(typingTimerRef.current);
  }, [fullSpeechText, introActive]);

  // Record NPC dialogue into History Log
  useEffect(() => {
    if (fullSpeechText && !introActive && activeCharacter?.name) {
      setDialogueHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].text === fullSpeechText) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            speaker: activeCharacter.name,
            text: fullSpeechText,
            isPlayer: false,
            time: timerStr
          }
        ];
      });
    }
  }, [fullSpeechText, activeCharacter?.name, introActive, timerStr]);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [dialogueHistory]);

  const handleSkipTyping = () => {
    if (isTyping) {
      clearInterval(typingTimerRef.current);
      setDisplayedText(fullSpeechText);
      setIsTyping(false);
    }
  };

  const handleSend = (text) => {
    const textToSend = text || inputText;
    if (isLoading || !textToSend.trim()) return;

    // Record Player Dialogue into History Log
    const playerText = textToSend.trim();
    setDialogueHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        speaker: 'OPERATIVE (You)',
        text: playerText,
        isPlayer: true,
        time: timerStr
      }
    ]);

    setInputText('');
    setShowHints(false);
    onSend(playerText, activeCharacter?.id);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter available characters
  const filteredChars = availableCharacters.filter((c) => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  // Color-Coded Trust Meter Thresholds (Red <30%, Yellow 30-50%, Green >50%)
  let trustColor = '#9bbc0f';
  let trustMood = 'Ally';
  let trustFillGradient = 'linear-gradient(90deg, #306230, #9bbc0f)';

  if (currentTrust < 30) {
    trustColor = '#ff6b6b';
    trustMood = 'Guarded / Critical';
    trustFillGradient = 'linear-gradient(90deg, #c0392b, #e74c3c)';
  } else if (currentTrust < 50) {
    trustColor = '#f1c40f';
    trustMood = 'Receptive';
    trustFillGradient = 'linear-gradient(90deg, #d4af37, #f1c40f)';
  } else {
    trustColor = '#9bbc0f';
    trustMood = 'Ally';
    trustFillGradient = 'linear-gradient(90deg, #306230, #9bbc0f)';
  }

  const activeSprite = activeCharacter?.sprite || `/gameboy/char_${activeCharacter?.id}.png`;

  return (
    <div className={`adytum-game-frame gameboy-theme ${introActive ? 'holding-intro' : 'active-scene'}`} onClick={handleSkipTyping}>
      {/* GameBoy Green Viewport & Retro CRT Screen Canvas */}
      <div className="gameboy-viewport-stage">
        {/* Subtle retro matrix & scanline background layer */}
        <div className="gameboy-crt-scanlines" />
        <div className="gameboy-dither-backdrop" />
        <div className="gameboy-ambient-glow" />

        {/* Dedicated Scene Location Header Bar */}
        <div className="station-location-header-bar">
          <div className="station-location-pill">
            <span className="live-pulse-dot-gb" />
            <span className="station-location-title">
              {locationBadge ||
                (worldFlags?.blast_doors_locked === false
                  ? 'DECONTAMINATION AIRLOCK [UNLOCKED]'
                  : 'EMERGENCY SCENARIO ZONE · INCIDENT ACTIVE')}
            </span>
            <span className="station-temp-readout" style={{ color: timerSeconds < 300 ? '#ff6b6b' : '#d4af37' }}>
              [{timerBarStr}] {timerStr} REMAINING
            </span>
          </div>
        </div>

        {/* Transmission History Log Panel */}
        <div className="gameboy-transmission-log-container">
          <div className="transmission-log-header">
            <span>📜 TRANSMISSION LOG ({dialogueHistory.length})</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLogOpen((prev) => !prev);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              {isLogOpen ? '▼ MINIMIZE' : '▲ EXPAND'}
            </button>
          </div>

          {isLogOpen && (
            <div className="transmission-log-scroll" ref={logScrollRef}>
              {dialogueHistory.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No prior transmissions logged in current scenario.
                </div>
              ) : (
                dialogueHistory.map((item) => (
                  <div key={item.id} className={`log-entry-item ${item.isPlayer ? 'player' : 'npc'}`}>
                    <div className="log-entry-speaker">
                      <span>{item.speaker}</span>
                      <span style={{ float: 'right', opacity: 0.7, fontSize: '0.65rem' }}>{item.time}</span>
                    </div>
                    <div className="log-entry-text">{item.text}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Scaled Character Portrait Display Frame */}
        <div className="gameboy-sprite-container">
          {isLoading && (
            <div className="gameboy-thinking-badge">
              ⚡ Narrative &amp; Character Agents Processing...
            </div>
          )}
          <div className={`gameboy-portrait-frame ${isLoading ? 'thinking-mode' : ''}`}>
            {activeSprite && (
              <img
                key={activeSprite}
                src={activeSprite}
                alt={activeCharacter?.name || 'Character'}
                className="gameboy-active-character-img"
              />
            )}
          </div>
        </div>
      </div>

      {/* Top Character Switcher & Category Filters (Neat 2-Tier Layout) */}
      <div className="gameboy-top-bar-container">
        {/* Tier 1: Pill-Shaped Filter Buttons */}
        <div className="gameboy-category-filters">
          <span className="gb-filter-label">CREW FILTER:</span>
          {[
            { id: 'all', label: `All (${availableCharacters.length})` },
            { id: 'trapped', label: 'Trapped Crew' },
            { id: 'contractor', label: 'Contractors' },
            { id: 'command', label: 'Command / Security' },
            { id: 'leader', label: 'Director' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={(e) => {
                e.stopPropagation();
                setFilterCategory(cat.id);
              }}
              className={`gb-cat-pill ${filterCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tier 2: 2-Row / Scrollable Character Switcher */}
        <div className="gameboy-char-tabs-grid">
          {filteredChars.map((char) => {
            const isSelected = activeCharacter?.id === char.id;
            return (
              <button
                key={char.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCharacter(char.id);
                }}
                className={`gameboy-char-card-btn ${isSelected ? 'active' : ''}`}
                title={`${char.name} (${char.title})`}
              >
                {char.icon && (
                  <img src={char.icon} alt={char.name} className="gb-tab-pixel-icon" />
                )}
                <div className="gb-tab-text-group">
                  <span className="gb-tab-label">{char.name}</span>
                  <span className="gb-tab-role-sub">{char.title.split('/')[0]}</span>
                </div>
                {isSelected && <span className="gb-active-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Retro Dialogue Box Wrapper with Generous Internal Spacing */}
      <div className="gameboy-dialogue-wrapper">
        {/* Namebox with Trust Indicator */}
        <div className="gameboy-namebox">
          <div className="gb-namebox-left">
            {activeCharacter?.icon && (
              <img src={activeCharacter.icon} alt="" className="gb-namebox-icon" />
            )}
            <span className="gb-speaker-title">
              {activeCharacter?.name || 'Comms'}
            </span>
            <span className="gb-speaker-subtitle">
              [{activeCharacter?.title || 'Specialist'}]
            </span>
          </div>

          {/* GameBoy Green & Amber Trust Meter */}
          <div className="gameboy-trust-meter">
            <IconHeart color={trustColor} size={12} />
            <div className="gb-trust-track">
              <div
                className="gb-trust-fill"
                style={{
                  width: `${Math.min(100, Math.max(8, currentTrust))}%`,
                  background: trustFillGradient
                }}
              />
            </div>
            <span className="gb-trust-text" style={{ color: trustColor }}>
              {currentTrust}% · {trustMood}
            </span>
          </div>
        </div>

        {/* Dialogue Text Box with Generous Padding */}
        <div className="gameboy-textbox">
          <div className="gameboy-dialogue-body">
            {isLoading ? (
              <div className="gameboy-deliberation-text">
                <span className="live-pulse-dot-gb" />
                <span>Deliberating transmission through 4-Agent Pipeline...</span>
              </div>
            ) : (
              <div className="gameboy-dialogue-text">
                {displayedText}
                {isTyping && <span className="gameboy-cursor" />}
              </div>
            )}
          </div>

          {/* Hint Overlay Tray */}
          {showHints && (
            <div className="gameboy-hints-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="gb-hints-header">
                <span>Suggested Dialogue Intentions (IEEE 5D Rubrics)</span>
                <button onClick={() => setShowHints(false)} className="gb-hints-close">✕</button>
              </div>
              <div className="gb-hints-grid">
                {rubricPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSend(item.text)}
                    className={`gb-hint-item hint-${item.type}`}
                  >
                    <span className="gb-hint-tag">{item.type.toUpperCase()}:</span>
                    <span className="gb-hint-content">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Input Bar */}
          <div className="gameboy-input-bar">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Transmit to ${activeCharacter?.name || 'specialist'}...`}
              className="gameboy-input-field"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHints((prev) => !prev);
              }}
              className={`gameboy-hint-button ${showHints ? 'active' : ''}`}
              title="Show suggested tactical & empathetic hints"
            >
              <IconLightbulb color={showHints ? '#d4af37' : '#8bac0f'} size={14} />
              <span>Hints</span>
            </button>

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className="gameboy-send-button"
            >
              Transmit [Enter]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
