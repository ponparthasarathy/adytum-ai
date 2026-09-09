'use client';

import React, { useState } from 'react';

export default function AgentInspector({
  isOpen,
  onClose,
  sessionState,
  modelConfig,
  onModelConfigChange,
  onResetSession,
  onRunFacultyDemo
}) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'graph' | 'characters' | 'world' | 'evaluator' | 'faculty'

  if (!isOpen) return null;

  const worldFlags = sessionState?.worldFlags || {};
  const evaluations = sessionState?.evaluations || [];
  const sceneNodes = sessionState?.sceneNodes || [];
  const transitions = sessionState?.transitions || [];
  const characterMemories = sessionState?.characterMemories || { corwin: [], wren: [], sable: [], garrow: [] };
  const agentTraces = sessionState?.agentTraces || [];
  const aggregateMetrics = sessionState?.aggregateMetrics || {
    totalTurns: 0,
    avgEmpathy: 78,
    avgAssertiveness: 68,
    avgAgency: 72,
    avgPersonaConsistency: 95,
    avgNarrativeCoherence: 92,
    personaContradictionCount: 0
  };

  const corwinTrust = worldFlags.trust_corwin ?? 40;
  const wrenTrust = worldFlags.trust_wren ?? 35;
  const sableTrust = worldFlags.trust_sable ?? 25;
  const garrowTrust = worldFlags.trust_garrow ?? 20;

  const latestTrace = agentTraces.length > 0 ? agentTraces[agentTraces.length - 1] : null;

  return (
    <div className="inspector-drawer">
      {/* Header */}
      <div className="drawer-header">
        <div className="drawer-title">
          <span className="live-pulse-dot" />
          <span>ADYTUM · IEEE 4-Agent Architecture Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="fullscreen-toggle-btn"
          style={{ padding: '3px 8px', fontSize: '0.78rem' }}
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div className="drawer-tabs">
        {[
          { id: 'pipeline', label: '🔬 Trace' },
          { id: 'graph', label: '🌲 Graph' },
          { id: 'characters', label: '👥 Memory' },
          { id: 'world', label: '🌐 World' },
          { id: 'evaluator', label: '📊 Rubrics' },
          { id: 'faculty', label: '🎓 Demos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="drawer-content">
        {/* TAB 1: 4-Agent Pipeline Execution Trace */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="inspector-card">
              <div className="inspector-card-title">📐 Formal Closed-Loop State Transition</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45' }}>
                <code style={{ color: '#9fe1cb', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '3px' }}>
                  S_(t+1) = ℱ(S_t, a_t, Narrative, Character, WorldState, Evaluator)
                </code>
                <p style={{ marginTop: '6px' }}>
                  Every player turn passes through the 4-agent collaborative pipeline: Character (Ct), World State (Wt), Narrative (Nt), and Decoupled Evaluator (Rt).
                </p>
              </div>
            </div>

            {latestTrace ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚡ LATEST DELIBERATION TRACE (Turn #{latestTrace.turn || 1}):</span>
                  {latestTrace.turnLatencyMs && (
                    <span style={{ color: '#34d399' }}>{latestTrace.turnLatencyMs}ms</span>
                  )}
                </div>

                {/* 1. World State Agent */}
                <div className="agent-trace-card" style={{ borderLeft: '3px solid #38bdf8' }}>
                  <div className="agent-trace-header" style={{ color: '#38bdf8' }}>
                    <span>1. World State Agent (Wt)</span>
                    <span className="agent-badge">Physical Causality</span>
                  </div>
                  <div className="agent-trace-body">
                    <strong>Causality:</strong> {latestTrace.worldStateAgent?.causality || 'Locks and bindings verified.'}
                  </div>
                </div>

                {/* 2. Character Agent */}
                <div className="agent-trace-card" style={{ borderLeft: '3px solid #34d399' }}>
                  <div className="agent-trace-header" style={{ color: '#34d399' }}>
                    <span>2. Character Agent (Ct)</span>
                    <span className="agent-badge">{latestTrace.characterAgent?.character || 'Active NPC'}</span>
                  </div>
                  <div className="agent-trace-body">
                    <strong>Spoken:</strong> &quot;{latestTrace.characterAgent?.reply}&quot;
                    <div style={{ marginTop: '3px', color: '#94a3b8', fontSize: '0.74rem' }}>
                      Emotion: {latestTrace.characterAgent?.emotionalState} | Action: {latestTrace.characterAgent?.action}
                    </div>
                  </div>
                </div>

                {/* 3. Narrative Agent */}
                <div className="agent-trace-card" style={{ borderLeft: '3px solid #a855f7' }}>
                  <div className="agent-trace-header" style={{ color: '#a855f7' }}>
                    <span>3. Narrative Agent (Nt)</span>
                    <span className="agent-badge">Graph Node Advancement</span>
                  </div>
                  <div className="agent-trace-body">
                    <strong>Pacing:</strong> {latestTrace.narrativeAgent?.progression || 'Tension curve managed.'}
                  </div>
                </div>

                {/* 4. Evaluator Agent (Decoupled Novelty 3) */}
                <div className="agent-trace-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="agent-trace-header" style={{ color: '#f59e0b' }}>
                    <span>4. Evaluator Agent (Rt) [Decoupled Async]</span>
                    <span className="agent-badge">
                      {(latestTrace.evaluatorAgent?.trustDelta || 0) >= 0 ? `+${latestTrace.evaluatorAgent?.trustDelta}` : latestTrace.evaluatorAgent?.trustDelta} Trust
                    </span>
                  </div>
                  <div className="agent-trace-body">
                    <strong>Rubrics:</strong> Emp: {latestTrace.evaluatorAgent?.scores?.empathy}% | Ass: {latestTrace.evaluatorAgent?.scores?.assertiveness}% | Agc: {latestTrace.evaluatorAgent?.scores?.agency}%
                    <div style={{ marginTop: '3px', color: '#fcd34d', fontSize: '0.74rem' }}>
                      {latestTrace.evaluatorAgent?.feedback}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 16px', lineHeight: '1.5' }}>
                Awaiting player interaction. Speak to Corwin, Wren, Sable, or Garrow to observe synchronized multi-agent deliberation in real time.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Story Graph */}
        {activeTab === 'graph' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="inspector-card">
              <div className="inspector-card-title">Narrative Graph Milestones Vt ({sceneNodes.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sceneNodes.map((node) => (
                  <div key={node.id} className="flag-row">
                    <span style={{ fontWeight: 700 }}>{node.title}</span>
                    <span className="flag-badge flag-true">{node.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspector-card">
              <div className="inspector-card-title">Branch Transitions Et ({transitions.length})</div>
              {transitions.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Initial awakening. New edges generated upon dialogue turns.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {transitions.slice(-6).map((e, idx) => (
                    <div key={idx} className="flag-row">
                      <span style={{ color: '#9fe1cb' }}>{e.from} ➔ {e.to}</span>
                      <span style={{ color: '#cbd5e1' }}>&quot;{e.triggerAction?.slice(0, 24)}...&quot;</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Character Memories & Isolated Memory Streams (Ct) */}
        {activeTab === 'characters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'corwin', name: 'Corwin (Anthropologist)', trust: worldFlags.trust_corwin ?? 40, color: '#9bbc0f' },
              { id: 'wren', name: 'Wren (Botanist)', trust: worldFlags.trust_wren ?? 35, color: '#c8ff80' },
              { id: 'sable', name: 'Sable (Captor)', trust: worldFlags.trust_sable ?? 25, color: '#8bac0f' },
              { id: 'garrow', name: 'Garrow (Guard)', trust: worldFlags.trust_garrow ?? 20, color: '#9bbc0f' },
              { id: 'lyra', name: 'Lyra (Cryptographer)', trust: worldFlags.trust_lyra ?? 45, color: '#9bbc0f' },
              { id: 'shade', name: 'Shade (Broker)', trust: worldFlags.trust_shade ?? 30, color: '#8bac0f' },
              { id: 'elena', name: 'Elena (Medic)', trust: worldFlags.trust_elena ?? 40, color: '#c8ff80' },
              { id: 'torin', name: 'Torin (Tactician)', trust: worldFlags.trust_torin ?? 35, color: '#9bbc0f' },
              { id: 'malik', name: 'Malik (Scout)', trust: worldFlags.trust_malik ?? 30, color: '#8bac0f' },
              { id: 'scholar', name: 'Prof. Sterling (Leader)', trust: worldFlags.trust_scholar ?? 50, color: '#e0f8d0' }
            ].map((char) => (
              <div key={char.id} className="inspector-card">
                <div className="inspector-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: char.color }}>{char.name}</span>
                  <span style={{ color: char.trust >= 50 ? '#9bbc0f' : '#8bac0f' }}>
                    {char.trust >= 50 ? 'Ally (Trust >= 50%)' : 'Guarded'}
                  </span>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#8bac0f', margin: '4px 0' }}>
                  Trust: {char.trust}/100 | Memory Stream ({characterMemories[char.id]?.length || 0} turns)
                </div>

                <div style={{ maxHeight: '90px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {(characterMemories[char.id] || []).length === 0 ? (
                    <div style={{ color: '#306230', fontSize: '0.72rem' }}>No dialogue history in this private stream.</div>
                  ) : (
                    characterMemories[char.id].map((m, idx) => (
                      <div key={idx} style={{ fontSize: '0.74rem', color: m.role === 'user' ? '#9bbc0f' : '#e0f8d0' }}>
                        <strong>{m.role === 'user' ? 'Player' : char.name.split(' ')[0]}:</strong> &quot;{m.text}&quot;
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: World State (Wt) */}
        {activeTab === 'world' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="inspector-card">
              <div className="inspector-card-title">Live World State Flags (Wt)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(worldFlags).map(([key, val]) => (
                  <div key={key} className="flag-row">
                    <span>{key}</span>
                    <span className={`flag-badge ${val ? 'flag-true' : 'flag-false'}`}>
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspector-card">
              <div className="inspector-card-title">Session Reset</div>
              <button
                onClick={onResetSession}
                className="fullscreen-toggle-btn"
                style={{ width: '100%', marginTop: '6px', textAlign: 'center' }}
              >
                🔄 Reset State to S0 (Start)
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Evaluator Agent (Rt) & Research Metrics */}
        {activeTab === 'evaluator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Section 1: Evaluator Rubrics */}
            <div className="inspector-card">
              <div className="inspector-card-title">1. Evaluator Agent Rubrics (Rt)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <div className="flag-row">
                  <span>Empathy &amp; Social Learning (RQ3)</span>
                  <span style={{ color: '#d4915a', fontWeight: 700 }}>{aggregateMetrics.avgEmpathy}%</span>
                </div>
                <div className="flag-row">
                  <span>Assertiveness &amp; Intent</span>
                  <span style={{ color: '#d4915a', fontWeight: 700 }}>{aggregateMetrics.avgAssertiveness}%</span>
                </div>
                <div className="flag-row">
                  <span>Tactical Agency &amp; Problem Solving</span>
                  <span style={{ color: '#d4915a', fontWeight: 700 }}>{aggregateMetrics.avgAgency}%</span>
                </div>
              </div>
            </div>

            {/* Section 2: Automatic Structural State Metrics */}
            <div className="inspector-card">
              <div className="inspector-card-title">2. Automatic Structural State Metrics (Graph/Memory)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <div className="flag-row">
                  <span>Persona Consistency (RQ2 - 1-PCR)</span>
                  <span style={{ color: '#d4915a', fontWeight: 700 }}>{aggregateMetrics.avgPersonaConsistency}%</span>
                </div>
                <div className="flag-row">
                  <span>Narrative Coherence (RQ1)</span>
                  <span style={{ color: '#d4915a', fontWeight: 700 }}>{aggregateMetrics.avgNarrativeCoherence}%</span>
                </div>
              </div>
            </div>

            {/* Recent Evaluations */}
            <div className="inspector-card">
              <div className="inspector-card-title">Recent Decision Evaluations ({evaluations.length})</div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {evaluations.length === 0 ? (
                  <div style={{ color: '#a89a85', fontSize: '0.78rem' }}>No evaluations yet. Speak to any character to trigger evaluation.</div>
                ) : (
                  evaluations.slice(-5).reverse().map((ev, i) => (
                    <div key={ev.id || i} style={{ background: '#1a1410', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.76rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Turn vs {ev.npcId?.toUpperCase()} | Emp: {ev.scores?.empathy}%</span>
                        <span style={{ color: (ev.trustDelta || 0) >= 0 ? '#7a8b6f' : '#8b3a3a' }}>
                          {(ev.trustDelta || 0) >= 0 ? `+${ev.trustDelta}` : ev.trustDelta} Trust
                        </span>
                      </div>
                      <div style={{ color: '#e8dfd0', fontSize: '0.74rem', marginTop: '2px' }}>
                        {ev.feedback}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Faculty Demonstration Mode */}
        {activeTab === 'faculty' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="inspector-card">
              <div className="inspector-card-title">🎓 Live Faculty Demonstration Scenarios</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Trigger these research test cases to demonstrate psychological resistance, empathy alignment, and state causality live:
              </div>
            </div>

            <div className="inspector-card">
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.82rem', marginBottom: '3px' }}>
                💡 Demo 1: Empathetic De-escalation (Corwin)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Demonstrates how reassuring Corwin builds trust (+20) and triggers the physical action <code>loosen_ropes</code>.
              </div>
              <button
                onClick={() => onRunFacultyDemo && onRunFacultyDemo('empathy_alex')}
                className="adytum-send-btn"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                ▶ Test Empathy Route with Corwin
              </button>
            </div>

            <div className="inspector-card">
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.82rem', marginBottom: '3px' }}>
                🔒 Demo 2: Demanding Bossy Command (Sable)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Demonstrates psychological resistance (1-PCR) where captors mock empty threats and reduce trust (-15).
              </div>
              <button
                onClick={() => onRunFacultyDemo && onRunFacultyDemo('demanding_alex')}
                className="fullscreen-toggle-btn"
                style={{ width: '100%', fontSize: '0.8rem', borderColor: '#ef4444', color: '#f87171' }}
              >
                ▶ Test Hostile Command with Sable
              </button>
            </div>

            <div className="inspector-card">
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem', marginBottom: '3px' }}>
                🗡️ Demo 3: Strategic Honor Appeal (Garrow)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Demonstrates appealing to Garrow\'s soldier duty to trigger <code>unlock_door</code>.
              </div>
              <button
                onClick={() => onRunFacultyDemo && onRunFacultyDemo('bridge_mira')}
                className="adytum-send-btn"
                style={{ width: '100%', fontSize: '0.8rem', borderColor: '#38bdf8', background: 'rgba(14, 116, 144, 0.85)' }}
              >
                ▶ Test Honor Appeal with Garrow
              </button>
            </div>

            <div className="inspector-card">
              <div style={{ fontWeight: 700, color: '#e879f9', fontSize: '0.82rem', marginBottom: '3px' }}>
                🏆 Demo 4: Cinematic Escape Resolution Cutscene
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Triggers the full-screen cinematic ending epilogue and research evaluation scorecard.
              </div>
              <button
                onClick={() => onRunFacultyDemo && onRunFacultyDemo('trigger_cutscene')}
                className="fullscreen-toggle-btn"
                style={{ width: '100%', fontSize: '0.8rem', borderColor: '#c084fc', color: '#e879f9' }}
              >
                ▶ Trigger Escape Cutscene Preview
              </button>
            </div>

            <div className="inspector-card">
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem', marginBottom: '3px' }}>
                🎬 Demo 5: Theatrical Opening Prologue
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Replays the 5-beat full-bleed cinematic intro and seamless typewriter transition.
              </div>
              <button
                onClick={() => onRunFacultyDemo && onRunFacultyDemo('replay_intro')}
                className="fullscreen-toggle-btn"
                style={{ width: '100%', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                ▶ Replay Cinematic Intro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
