'use client';

import { ArrowRight, CreditCard, ScanEye } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Standards-positioning diagram (mandatory).
 *
 * Makes the distinction instant for judges:
 *   ACP / AP2  ->  authorize a transaction
 *   VigilCart  ->  validates whether the agent's judgment honored user intent
 */
export default function StandardsDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-card-lg border border-faint bg-panel',
        compact ? 'p-4' : 'p-5',
      )}
      style={{ boxShadow: 'var(--vc-shadow-panel)' }}
    >
      {!compact && (
        <div className="mb-3.5 flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
            Where VigilCart sits
          </span>
          <span className="h-px flex-1" style={{ background: 'var(--vc-border-dim)' }} />
        </div>
      )}

      <div className="space-y-2.5">
        <Row
          icon={<CreditCard size={15} strokeWidth={1.7} />}
          tone="neutral"
          label="ACP / AP2"
          arrowLabel="authorize a transaction"
          compact={compact}
        />
        <Row
          icon={<ScanEye size={15} strokeWidth={1.7} />}
          tone="accent"
          label="VigilCart"
          arrowLabel="validates whether the agent's judgment honored user intent"
          compact={compact}
        />
      </div>

      {!compact && (
        <p className="mt-3.5 text-[11px] leading-5 text-muted">
          Payment rails prove <span className="text-fg">who may pay</span>. VigilCart evaluates
          <span className="text-accent"> whether the agent should have acted at all</span> — did it stay
          in budget, honor the deadline, resist injected instructions, and hold the approval gate.
        </p>
      )}
    </div>
  );
}

function Row({
  icon,
  tone,
  label,
  arrowLabel,
  compact,
}: {
  icon: React.ReactNode;
  tone: 'neutral' | 'accent';
  label: string;
  arrowLabel: string;
  compact: boolean;
}) {
  const color = tone === 'accent' ? 'var(--vc-green)' : 'var(--vc-slate)';
  const bg = tone === 'accent' ? 'var(--vc-green-bg)' : 'var(--vc-slate-bg)';
  const border = tone === 'accent' ? 'var(--vc-green-border)' : 'var(--vc-slate-border)';
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div
        className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2"
        style={{ background: bg, border: `1px solid ${border}`, minWidth: compact ? 96 : 116 }}
      >
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      <ArrowRight size={14} strokeWidth={2} className="shrink-0 text-dim" aria-hidden="true" />
      <span className={cn('text-muted', compact ? 'text-[11px] leading-4' : 'text-[12px] sm:text-[13px]')}>
        {arrowLabel}
      </span>
    </div>
  );
}
