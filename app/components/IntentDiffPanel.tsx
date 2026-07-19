'use client';

import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Diff,
} from 'lucide-react';
import type { GuardCheck, FidelityReport } from '../../lib/schemas';

interface IntentDiffPanelProps {
  reports: FidelityReport[];
}

const RULE_LABELS: Record<string, string> = {
  budget: 'Budget Ceiling',
  arrival: 'Arrival Deadline',
  returnability: 'Returnability',
  injection: 'Injection Scan',
  approval: 'User Approval',
  'evidence-conflict': 'Evidence Conflict',
};

const RULE_ORDER: string[] = [
  'budget',
  'arrival',
  'returnability',
  'injection',
  'evidence-conflict',
  'approval',
];

export default function IntentDiffPanel({ reports }: IntentDiffPanelProps) {
  if (reports.length === 0) return null;

  // Collect unique rules across all reports
  const allRules = RULE_ORDER.filter((rule) =>
    reports.some((r) => r.checks.some((c) => c.rule === rule))
  );

  return (
    <section
      id="intent-diff-panel"
      className="vc-animate-in rounded-xl overflow-hidden"
      style={{
        animationDelay: '0.3s',
        background: 'var(--vc-bg-panel)',
        border: '1px solid var(--vc-border)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--vc-border-dim)' }}
      >
        <Diff size={16} strokeWidth={1.8} style={{ color: 'var(--vc-green)' }} />
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Intent Diff
        </h2>
        <span className="ml-auto font-mono text-[9px] tracking-[0.15em] text-[var(--vc-text-dim)] uppercase">
          Contract vs. offers
        </span>
      </div>

      {/* Diff table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 500 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--vc-border-dim)' }}>
              <th className="px-5 py-3 text-left font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--vc-text-dim)]">
                Rule
              </th>
              {reports.map((r) => (
                <th
                  key={r.merchantId}
                  className="px-4 py-3 text-center font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--vc-text-dim)]"
                >
                  {r.merchantName.length > 20
                    ? r.merchantName.slice(0, 18) + '…'
                    : r.merchantName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRules.map((rule) => (
              <tr
                key={rule}
                className="transition-colors duration-100"
                style={{ borderBottom: '1px solid var(--vc-border-dim)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--vc-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td className="px-5 py-3 font-medium text-[var(--vc-text-muted)]">
                  {RULE_LABELS[rule] ?? rule}
                </td>
                {reports.map((r) => {
                  const check = r.checks.find((c) => c.rule === rule);
                  return (
                    <td key={r.merchantId} className="px-4 py-3">
                      <DiffCell check={check} />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Summary row */}
            <tr style={{ background: 'var(--vc-bg-card)' }}>
              <td className="px-5 py-3 font-mono text-[10px] tracking-wider uppercase font-semibold text-white">
                Verdict
              </td>
              {reports.map((r) => {
                const hardFails = r.checks.filter(c => c.hardRule && !c.passed && c.rule !== 'approval');
                const onlyApproval = hardFails.length === 0 && r.checks.some(c => c.rule === 'approval' && !c.passed);
                return (
                  <td key={r.merchantId} className="px-4 py-3 text-center">
                    {hardFails.length > 0 ? (
                      <span className="vc-badge vc-badge-red">Blocked</span>
                    ) : onlyApproval ? (
                      <span className="vc-badge vc-badge-amber">Pending</span>
                    ) : (
                      <span className="vc-badge vc-badge-green">Eligible</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DiffCell({ check }: { check?: GuardCheck }) {
  if (!check) {
    return (
      <div className="flex flex-col items-center gap-1">
        <HelpCircle size={16} strokeWidth={1.5} style={{ color: 'var(--vc-slate)' }} />
        <span className="font-mono text-[9px] text-[var(--vc-slate)]">N/A</span>
      </div>
    );
  }

  if (check.passed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <CheckCircle2 size={16} strokeWidth={1.8} style={{ color: 'var(--vc-green)' }} />
        <span className="font-mono text-[9px] text-[var(--vc-green)] text-center max-w-[120px] leading-3">
          Pass
        </span>
      </div>
    );
  }

  if (!check.hardRule) {
    // Soft failure → amber "uncertain"
    return (
      <div className="flex flex-col items-center gap-1">
        <HelpCircle size={16} strokeWidth={1.8} style={{ color: 'var(--vc-amber)' }} />
        <span className="font-mono text-[9px] text-[var(--vc-amber)] text-center max-w-[120px] leading-3">
          Uncertain
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <XCircle size={16} strokeWidth={1.8} style={{ color: 'var(--vc-red)' }} />
      <span className="font-mono text-[9px] text-[var(--vc-red)] text-center max-w-[120px] leading-3">
        Fail
      </span>
    </div>
  );
}
