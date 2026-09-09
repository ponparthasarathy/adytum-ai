'use client';

import React, { useState } from 'react';
import { RANDOM_PROMPTS } from '@/lib/storyGenerator';

const SAMPLE_CHIPS = [
  { label: '🌊 Submarine Trench Leak', prompt: 'Submarine research vessel stranded at the bottom of the Mariana Trench with a hull leak and flickering power.' },
  { label: '🌆 Cyberpunk Tower Heist', prompt: 'Cyberpunk neon skyscraper vault heist trapped under an automated AI lockdown.' },
  { label: '⌛ Victorian Manor Time Loop', prompt: 'Haunted Victorian manor library caught in a recurring 30-minute time anomaly.' },
  { label: '🚀 Orbital Hydroponics Rupture', prompt: 'Orbital space station hydroponics bay facing severe atmospheric pressure loss.' },
  { label: '☣️ Post-Apocalyptic Metro Bunker', prompt: 'Post-apocalyptic underground metro bunker running out of clean water filters.' },
  { label: '⛰️ Alpine Peak Blizzard', prompt: 'High-altitude alpine research outpost surrounded by an unpredicted Category 5 snowstorm.' }
];

export default function StoryGeneratorModal({
  isOpen,
  onClose,
  onGenerateStory,
  isGenerating = false
}) {
  const [promptText, setPromptText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to generate dynamic AI story.');

  if (!isOpen) return null;

  const handleGenerateCustom = () => {
    if (isGenerating || !promptText.trim()) return;
    setStatusMessage('Gemini synthesizing world state & persona subset...');
    onGenerateStory(promptText.trim());
  };

  const handleGenerateRandom = () => {
    if (isGenerating) return;
    const randomChoice = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPromptText(randomChoice);
    setStatusMessage('Generating randomized AI story...');
    onGenerateStory(randomChoice);
  };

  const handleSelectChip = (chipPrompt) => {
    setPromptText(chipPrompt);
  };

  return (
    <div className="journal-thematic-backdrop" onClick={isGenerating ? null : onClose}>
      <div className="gameboy-story-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="gameboy-journal-header">
          <div className="journal-header-left">
            <span className="journal-seal-icon">🎲</span>
            <div className="journal-header-titles">
              <h2 className="journal-gothic-title">Dynamic AI Story Generator</h2>
              <span className="journal-gothic-sub">Powered by Gemini &amp; Multi-Agent Architecture</span>
            </div>
          </div>
          {!isGenerating && (
            <button onClick={onClose} className="gameboy-close-btn" title="Close Modal">
              ✕ Close
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="gameboy-story-modal-body">
          {/* Section 1: Intro Instructions */}
          <div className="gb-generator-intro-card">
            <p className="gb-generator-intro-text">
              Type a <strong>one-line story premise</strong> or click <strong>🎲 Random Story</strong>. Gemini will dynamically select the best <strong>3–6 character subset</strong> from your 10 GameBoy pixel portraits and craft a unique interactive scenario!
            </p>
          </div>

          {/* Section 2: Input Bar */}
          <div className="gb-prompt-input-wrapper">
            <label className="gb-input-label">YOUR ONE-LINE STORY PREMISE:</label>
            <div className="gb-input-row">
              <input
                type="text"
                value={promptText}
                disabled={isGenerating}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && promptText.trim()) {
                    handleGenerateCustom();
                  }
                }}
                placeholder="e.g. Submarine trapped in Mariana Trench with a hull leak..."
                className="gameboy-story-input"
              />

              <button
                onClick={handleGenerateRandom}
                disabled={isGenerating}
                className="gameboy-random-btn"
                title="Generate a completely randomized story prompt with Gemini"
              >
                🎲 Random Story
              </button>
            </div>
          </div>

          {/* Section 3: Clickable Sample Prompt Chips */}
          <div className="gb-chips-section">
            <span className="gb-chips-label">OR PICK A PRESET THEME:</span>
            <div className="gb-chips-container">
              {SAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  disabled={isGenerating}
                  onClick={() => handleSelectChip(chip.prompt)}
                  className={`gb-sample-chip ${promptText === chip.prompt ? 'active' : ''}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Live Generation Terminal / Status */}
          {isGenerating ? (
            <div className="gb-loading-terminal">
              <div className="gb-terminal-header">
                <span className="live-pulse-dot-gb" />
                <span>GEMINI MULTI-AGENT SYNTHESIS IN PROGRESS...</span>
              </div>
              <div className="gb-terminal-log">
                <p>⚡ Connecting to Gemini LLM Engine...</p>
                <p>👥 Selecting optimal character subset from 10 pixel portraits...</p>
                <p>🌐 Generating initial world state flags (Wt) and scene node (Vt)...</p>
                <p>📜 Synthesizing Field Journal dossiers &amp; 3 extraction vectors...</p>
              </div>
            </div>
          ) : (
            <div className="gb-action-bar">
              <button
                onClick={handleGenerateCustom}
                disabled={!promptText.trim()}
                className="gameboy-launch-story-btn"
              >
                ✨ Launch Custom AI Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
