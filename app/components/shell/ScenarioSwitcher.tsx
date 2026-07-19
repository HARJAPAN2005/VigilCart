'use client';

import { Crosshair, Scale } from 'lucide-react';
import { useWorkspace, SCENARIOS, type ScenarioId } from '../../workspace/WorkspaceContext';
import { cn } from '../../../lib/utils';

const OPTIONS: { id: ScenarioId; icon: typeof Crosshair; short: string }[] = [
  { id: 'default', icon: Crosshair, short: 'Injection' },
  { id: 'honest-failure', icon: Scale, short: 'Honest failure' },
];

export default function ScenarioSwitcher() {
  const { scenario, switchScenario } = useWorkspace();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-faint p-1"
      style={{ background: 'var(--vc-bg-card)' }}
      role="radiogroup"
      aria-label="Evaluation scenario"
    >
      {OPTIONS.map((opt) => {
        const active = scenario === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => switchScenario(opt.id)}
            title={SCENARIOS[opt.id].tagline}
            className={cn(
              'vc-focusable inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-medium transition-colors',
              active ? 'text-fg' : 'text-dim hover:text-muted',
            )}
            style={
              active
                ? { background: 'var(--vc-green-bg)', border: '1px solid var(--vc-green-border)', color: 'var(--vc-green)' }
                : { border: '1px solid transparent' }
            }
          >
            <opt.icon size={12} strokeWidth={2} />
            {opt.short}
          </button>
        );
      })}
    </div>
  );
}
