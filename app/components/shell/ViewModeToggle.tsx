'use client';

import { Route, LayoutGrid } from 'lucide-react';
import { useWorkspace, type ViewMode } from '../../workspace/WorkspaceContext';
import { cn } from '../../../lib/utils';

const OPTIONS: { id: ViewMode; icon: typeof Route; label: string }[] = [
  { id: 'guided', icon: Route, label: 'Guided' },
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
];

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useWorkspace();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-faint p-1"
      style={{ background: 'var(--vc-bg-card)' }}
      role="radiogroup"
      aria-label="View mode"
    >
      {OPTIONS.map((opt) => {
        const active = viewMode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setViewMode(opt.id)}
            className={cn(
              'vc-focusable inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-medium transition-colors',
              active ? 'text-fg' : 'text-dim hover:text-muted',
            )}
            style={active ? { background: 'var(--vc-bg-elevated)', border: '1px solid var(--vc-border)' } : { border: '1px solid transparent' }}
          >
            <opt.icon size={12} strokeWidth={2} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
