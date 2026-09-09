'use client';

import React, { useState } from 'react';

const DEFAULT_DOSSIERS = [
  {
    id: 'aris',
    name: 'Dr. Aris',
    tag: 'Lead Geothermal / Trapped',
    sprite: '/gameboy/char_corwin.png',
    sub: 'Geothermal Specialist · Sub-Level 3',
    body: 'Brilliant engineer suffering hypothermia from ruptured coolant lines. Calmed by steady dialogue. At 50% trust, coordinates manual bypass.'
  },
  {
    id: 'kael',
    name: 'Kael',
    tag: 'Atmospheric Sensor / Trapped',
    sprite: '/gameboy/char_wren.png',
    sub: 'Sensor Analyst · Sub-Level 3',
    body: 'Struggling with glycol vapor inhalation. Empathetic psychological reassurance stabilizes him to map auxiliary exhaust ducts.'
  },
  {
    id: 'nolan',
    name: 'Nolan',
    tag: 'Contract Pilot / Contractor',
    sprite: '/gameboy/char_sable.png',
    sub: 'Transport Pilot · Upper Staging Pad',
    body: 'Cynical freelance transport pilot with access to the freight hoist. Respects valuable research data trades and extraction wagers.'
  },
  {
    id: 'vance',
    name: 'Commander Vance',
    tag: 'Security Chief / Command',
    sprite: '/gameboy/char_garrow.png',
    sub: 'Outpost Security Commander · Central Control',
    body: 'Solemn officer enforcing automated quarantine. Persuaded to authorize decontamination airlock release through verified life-support data.'
  }
];

export default function FieldJournalModal({ isOpen, onClose, activeScenario = null }) {
  const [activeTab, setActiveTab] = useState('dossiers');

  if (!isOpen) return null;

  // Build active dossiers list from scenario or default
  const dossiersList = activeScenario && activeScenario.characters && activeScenario.characters.length > 0
    ? activeScenario.characters.map((c) => ({
        id: c.id,
        name: c.name,
        tag: `${c.title} / ${c.category.toUpperCase()}`,
        sprite: c.sprite,
        sub: `${c.title} · Personnel Unit`,
        body: c.personaSummary || 'Operative in the active emergency zone.'
      }))
    : DEFAULT_DOSSIERS;

  const scenarioTitle = activeScenario?.title || 'ADYTUM Field Codex';
  const scenarioGenre = activeScenario?.genre || 'Interactive Fiction Incident Log';
  const scenarioDesc = activeScenario?.description || 'Sub-level ambient parameters plunging. Coordinate across operatives to achieve extraction.';
  const userPromptText = activeScenario?.userPrompt ? `"${activeScenario.userPrompt}"` : 'Containment Protocol S0';

  const extractionList = activeScenario?.extractionVectors || [
    { title: '🟢 Vector 1: Command Authorization', description: 'Reassure engineering specialists and transmit verified life support telemetry to authorize airlock release.' },
    { title: '🟡 Vector 2: Tactical Cargo Hoist', description: 'Negotiate data trades and supply wagers to secure immediate elevator extraction.' },
    { title: '🔵 Vector 3: Ventilation Duct Traverse', description: 'Map auxiliary exhaust ducts to bypass locked blast doors and reach surface shelters.' }
  ];

  return (
    <div className="journal-thematic-backdrop" onClick={onClose}>
      <div className="journal-parchment-book gameboy-journal-box" onClick={(e) => e.stopPropagation()}>
        {/* Book Header / GameBoy Bezel */}
        <div className="journal-leather-header gameboy-journal-header">
          <div className="journal-header-left">
            <span className="journal-seal-icon">📜</span>
            <div className="journal-header-titles">
              <h2 className="journal-gothic-title">{scenarioTitle}</h2>
              <span className="journal-gothic-sub">{scenarioGenre} · {userPromptText}</span>
            </div>
          </div>
          <button onClick={onClose} className="journal-close-btn gameboy-close-btn" title="Close Codex [ESC]">
            ✕ Close [ESC]
          </button>
        </div>

        {/* Thematic Bookmark Tabs */}
        <div className="journal-bookmark-tabs gameboy-journal-tabs">
          {[
            { id: 'dossiers', label: `👥 Active Personnel (${dossiersList.length})` },
            { id: 'backstory', label: '📖 Incident Log & Mission' },
            { id: 'strategies', label: '🗝️ Extraction Vectors' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`journal-bookmark-btn gameboy-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GameBoy Content Body */}
        <div className="journal-parchment-body gameboy-journal-content">
          {/* TAB 1: Personnel Dossiers */}
          {activeTab === 'dossiers' && (
            <div className="journal-entry-section">
              <div className="journal-entry-header">
                <span className="journal-entry-date">SCENARIO PERSONNEL ROSTER · {dossiersList.length} OPERATIVES</span>
                <h3 className="journal-entry-title">Active Operative Profiles &amp; Affordances</h3>
              </div>

              <div className="journal-dossier-grid gameboy-dossier-grid">
                {dossiersList.map((char) => (
                  <div key={char.id} className="journal-dossier-card gameboy-dossier-card">
                    <div className="dossier-top-row">
                      <img src={char.sprite} alt={char.name} className="dossier-pixel-avatar" />
                      <div className="dossier-meta">
                        <div className="dossier-header-row">
                          <span className="dossier-name">{char.name}</span>
                          <span className="dossier-tag">{char.tag}</span>
                        </div>
                        <div className="dossier-sub">{char.sub}</div>
                      </div>
                    </div>
                    <p className="dossier-body">{char.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Backstory & Incident */}
          {activeTab === 'backstory' && (
            <div className="journal-entry-section">
              <div className="journal-entry-header">
                <span className="journal-entry-date">MISSION DIRECTIVE &amp; CONTEXT</span>
                <h3 className="journal-entry-title">{scenarioTitle}</h3>
              </div>

              <p className="journal-entry-text">
                {scenarioDesc}
              </p>

              <div className="journal-worn-note gameboy-note">
                <div className="worn-note-kicker">EMERGENCY DIRECTIVE</div>
                <p>
                  Operate through <strong>empathetic de-escalation</strong>, <strong>technical problem solving</strong>, and <strong>assertive negotiation</strong> to build trust ($C_t$) with active specialists and achieve a resolution.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Extraction Vectors */}
          {activeTab === 'strategies' && (
            <div className="journal-entry-section">
              <div className="journal-entry-header">
                <span className="journal-entry-date">OPERATIONAL EXTRACTION PROTOCOLS</span>
                <h3 className="journal-entry-title">Resolution &amp; Extraction Vectors</h3>
              </div>

              {extractionList.map((vec, idx) => (
                <div key={idx} className="journal-strategy-card gameboy-strategy-card">
                  <div className="strategy-card-title">{vec.title}</div>
                  <div className="strategy-card-body">{vec.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
