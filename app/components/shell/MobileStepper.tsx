'use client';

import { Check, Lock } from 'lucide-react';
import { useWorkspace, ACTS, ACT_META } from '../../workspace/WorkspaceContext';
import { cn } from '../../../lib/utils';

export default function MobileStepper() {
  const { activeAct, setAct, compiled } = useWorkspace();
  const activeIndex = ACTS.indexOf(activeAct);

  return (
    <nav
      aria-label="Mission stages"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8"
    >
      {ACTS.map((act, i) => {
        const meta = ACT_META[act];
        const isActive = act === activeAct;
        const isDone = i < activeIndex;
        const locked = act !== 'brief' && !compiled;
        return (
          <button
            key={act}
            type="button"
            disabled={locked}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => !locked && setAct(act)}
            className={cn(
              'vc-focusable inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-medium transition-colors',
              locked && 'cursor-not-allowed opacity-40',
            )}
            style={{
              background: isActive ? 'var(--vc-green-bg)' : 'var(--vc-bg-card)',
              borderColor: isActive ? 'var(--vc-green-border)' : 'var(--vc-border-dim)',
              color: isActive ? 'var(--vc-green)' : 'var(--vc-text-muted)',
            }}
          >
            <span className="grid size-4 place-items-center font-mono text-[10px] font-bold">
              {isDone ? <Check size={11} strokeWidth={3} /> : locked ? <Lock size={10} strokeWidth={2.2} /> : meta.index}
            </span>
            {meta.label}
          </button>
        );
      })}
    </nav>
  );
}
