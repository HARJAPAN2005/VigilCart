'use client';

import { Check, Lock, ShieldCheck, Syringe, Ban } from 'lucide-react';
import {
  useWorkspace,
  ACTS,
  ACT_META,
} from '../../workspace/WorkspaceContext';
import { cn } from '../../../lib/utils';

export default function MissionRail() {
  const { activeAct, setAct, compiled, reports } = useWorkspace();
  const activeIndex = ACTS.indexOf(activeAct);

  const blocked = reports.filter((r) =>
    r.checks.some((c) => c.hardRule && !c.passed && c.rule !== 'approval'),
  ).length;
  const injections = reports.filter((r) =>
    r.checks.some((c) => c.rule === 'injection' && !c.passed),
  ).length;
  // "Held" only while an otherwise-eligible offer still awaits approval.
  const approvalHeld = reports.some((r) => {
    const hardFails = r.checks.filter((c) => c.hardRule && !c.passed && c.rule !== 'approval');
    return hardFails.length === 0 && r.checks.some((c) => c.rule === 'approval' && !c.passed);
  });

  return (
    <nav aria-label="Mission stages" className="flex h-full flex-col gap-7">
      <div>
        <p className="mb-3 text-[11px] font-medium text-dim">The mission</p>
        <ol className="space-y-0.5">
          {ACTS.map((act, i) => {
            const meta = ACT_META[act];
            const isActive = act === activeAct;
            const isDone = i < activeIndex;
            const locked = act !== 'brief' && !compiled;
            return (
              <li key={act}>
                <button
                  type="button"
                  disabled={locked}
                  aria-current={isActive ? 'step' : undefined}
                  onClick={() => !locked && setAct(act)}
                  className={cn(
                    'vc-focusable group flex w-full items-start gap-3 rounded-card px-2.5 py-2.5 text-left transition-colors',
                    locked ? 'cursor-not-allowed opacity-40' : 'hover:bg-hover',
                  )}
                  style={isActive ? { background: 'var(--vc-green-bg)' } : undefined}
                >
                  <StepDot index={meta.index} isActive={isActive} isDone={isDone} locked={locked} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[13px] font-semibold', isActive ? 'text-white' : 'text-muted')}>
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-dim">{meta.blurb}</span>
                  </span>
                  {locked && <Lock size={11} strokeWidth={2} className="mt-1 shrink-0 text-dim" />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Live safety readout */}
      {compiled && (
        <div className="mt-auto rounded-card-lg border border-faint p-4" style={{ background: 'var(--vc-bg-card)' }}>
          <p className="mb-2.5 text-[11px] font-medium text-dim">Safety readout</p>
          <ul className="space-y-2">
            <StatusRow Icon={Ban} color="var(--vc-red)" label="Offers blocked" value={blocked} />
            <StatusRow Icon={Syringe} color="var(--vc-amber)" label="Injection signals" value={injections} />
            <StatusRow
              Icon={ShieldCheck}
              color={approvalHeld ? 'var(--vc-amber)' : 'var(--vc-green)'}
              label="Approval gate"
              text={approvalHeld ? 'Held' : 'Clear'}
            />
          </ul>
        </div>
      )}
    </nav>
  );
}

function StepDot({
  index,
  isActive,
  isDone,
  locked,
}: {
  index: number;
  isActive: boolean;
  isDone: boolean;
  locked: boolean;
}) {
  const border = isActive || isDone ? 'var(--vc-green)' : 'var(--vc-border)';
  const bg = isDone ? 'var(--vc-green)' : isActive ? 'var(--vc-green-bg)' : 'transparent';
  const color = isDone ? 'var(--vc-bg-root)' : isActive ? 'var(--vc-green)' : 'var(--vc-text-dim)';
  return (
    <span
      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-colors"
      style={{ border: `1.5px solid ${border}`, background: bg, color }}
      aria-hidden="true"
    >
      {isDone ? <Check size={12} strokeWidth={3} /> : locked ? '' : index}
    </span>
  );
}

function StatusRow({
  Icon,
  color,
  label,
  value,
  text,
}: {
  Icon: typeof Ban;
  color: string;
  label: string;
  value?: number;
  text?: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <Icon size={12} strokeWidth={1.9} style={{ color }} />
      <span className="flex-1 text-[11.5px] text-muted">{label}</span>
      <span className="text-[11.5px] font-semibold tabular-nums" style={{ color }}>
        {text ?? value}
      </span>
    </li>
  );
}
