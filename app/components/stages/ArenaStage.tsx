'use client';

import { AlertTriangle } from 'lucide-react';
import AgentArena from '../AgentArena';
import { useWorkspace, FLAGSHIP_INTENT, FLAGSHIP_MERCHANTS } from '../../workspace/WorkspaceContext';
import StageHeader from './StageHeader';

/**
 * The Arena always replays the flagship prompt-injection scenario (the tuned
 * naive-vs-guarded race). The scenario switcher governs the Brief fixtures and
 * the Verdict; a note clarifies this when a non-flagship scenario is active.
 */
export default function ArenaStage() {
  const { intent, scenario } = useWorkspace();
  const raceIntent = intent ?? FLAGSHIP_INTENT;

  return (
    <div className="space-y-6">
      <StageHeader
        eyebrow="Act 3 — The experiment"
        title="The Arena"
        blurb="Two agents, one marketplace, one hidden attack. Watch what each of them does with content it was never supposed to trust."
      />

      {scenario !== 'default' && (
        <div
          className="flex items-center gap-2.5 rounded-card border border-faint px-4 py-3"
          style={{ background: 'var(--vc-amber-bg)' }}
        >
          <AlertTriangle size={13} strokeWidth={2} style={{ color: 'var(--vc-amber)' }} />
          <p className="text-[12px] leading-4 text-muted">
            The Arena replays the flagship <span style={{ color: 'var(--vc-amber)' }}>prompt-injection</span>{' '}
            scenario. Switch back to it in the top bar to align the Arena with the Brief and Verdict.
          </p>
        </div>
      )}

      <AgentArena intent={raceIntent} merchants={FLAGSHIP_MERCHANTS} />
    </div>
  );
}
