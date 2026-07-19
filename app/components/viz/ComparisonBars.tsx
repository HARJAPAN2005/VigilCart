'use client';

import type { FidelityReport } from '../../../lib/schemas';

interface ComparisonBarsProps {
  reports: FidelityReport[];
  budgetINR: number;
}

type Verdict = 'blocked' | 'pending' | 'eligible';

function verdictOf(report: FidelityReport): Verdict {
  const hardFails = report.checks.filter((c) => c.hardRule && !c.passed && c.rule !== 'approval');
  if (hardFails.length > 0) return 'blocked';
  if (report.checks.some((c) => c.rule === 'approval' && !c.passed)) return 'pending';
  return 'eligible';
}

const VERDICT_COLOR: Record<Verdict, string> = {
  blocked: 'var(--vc-red)',
  pending: 'var(--vc-amber)',
  eligible: 'var(--vc-green)',
};

const VERDICT_LABEL: Record<Verdict, string> = {
  blocked: 'Blocked',
  pending: 'Pending',
  eligible: 'Eligible',
};

export default function ComparisonBars({ reports, budgetINR }: ComparisonBarsProps) {
  if (reports.length === 0) return null;

  // Budget bar scale: the largest of budget or any all-in total defines 100%.
  const maxTotal = Math.max(budgetINR, ...reports.map((r) => r.allInTotalINR));
  const budgetPct = (budgetINR / maxTotal) * 100;

  return (
    <div className="space-y-5">
      {/* Autonomy scores */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--vc-text-dim)]">
            Autonomy score
          </span>
          <span className="text-[10.5px] text-[var(--vc-text-dim)]">0 – 100</span>
        </div>
        <div className="space-y-2.5">
          {reports.map((r) => {
            const v = verdictOf(r);
            const color = VERDICT_COLOR[v];
            return (
              <div key={r.merchantId} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-[var(--vc-text-muted)]" title={r.merchantName}>
                  {r.merchantName}
                </span>
                <div className="relative h-4 flex-1 overflow-hidden rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-md transition-[width] duration-700 ease-out"
                    style={{ width: `${r.autonomyScore}%`, background: color, boxShadow: `0 0 10px ${color}44` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums" style={{ color }}>
                  {r.autonomyScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-in total vs budget */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--vc-text-dim)]">
            All-in total vs budget
          </span>
          <span className="text-[10.5px] text-[var(--vc-text-dim)]">
            ₹{budgetINR.toLocaleString('en-IN')} ceiling
          </span>
        </div>
        <div className="space-y-2.5">
          {reports.map((r) => {
            const overBudget = r.allInTotalINR > budgetINR;
            const color = overBudget ? 'var(--vc-red)' : 'var(--vc-cyan)';
            const pct = (r.allInTotalINR / maxTotal) * 100;
            return (
              <div key={r.merchantId} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-[11px] text-[var(--vc-text-muted)]" title={r.merchantName}>
                  {r.merchantName}
                </span>
                <div className="relative h-4 flex-1 overflow-hidden rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-md transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}44` }}
                  />
                  {/* Budget ceiling marker */}
                  <div
                    className="absolute inset-y-0"
                    style={{ left: `${budgetPct}%`, width: 2, background: 'var(--vc-text-muted)', opacity: 0.6 }}
                    aria-hidden="true"
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums" style={{ color }}>
                  ₹{r.allInTotalINR.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10.5px] text-[var(--vc-text-dim)]">
          Vertical marker = budget ceiling. Bars past it exceed the all-in budget.
        </p>
      </div>
    </div>
  );
}
