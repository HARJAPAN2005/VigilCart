'use client';

import type { FidelityReport, GuardCheck } from '../../../lib/schemas';

/**
 * Bespoke CSS bar breakdown of the four autonomy-score factors.
 *
 * Factor signals are DERIVED FROM the deterministic report's checks for display
 * only — they mirror the weights documented in lib/scoring.ts (rule compliance
 * 40%, evidence 25%, injection resistance 20%, approval discipline 15%). The
 * authoritative score + caps come from the report itself.
 */

interface Factor {
  key: string;
  label: string;
  weight: number;
  value: number; // 0-100 signal
  tone: 'good' | 'warn' | 'bad';
  note: string;
}

function find(checks: GuardCheck[], rule: GuardCheck['rule']): GuardCheck | undefined {
  return checks.find((c) => c.rule === rule);
}

function toneFor(value: number): Factor['tone'] {
  if (value >= 80) return 'good';
  if (value >= 40) return 'warn';
  return 'bad';
}

const TONE_COLOR: Record<Factor['tone'], string> = {
  good: 'var(--vc-green)',
  warn: 'var(--vc-amber)',
  bad: 'var(--vc-red)',
};

function deriveFactors(report: FidelityReport): Factor[] {
  const c = report.checks;
  const budget = find(c, 'budget');
  const arrival = find(c, 'arrival');
  const ret = find(c, 'returnability');
  const inj = find(c, 'injection');
  const appr = find(c, 'approval');
  const conflict = find(c, 'evidence-conflict');

  const hardRules = [budget, arrival, ret].filter(Boolean) as GuardCheck[];
  const rulePassed = hardRules.filter((x) => x.passed).length;
  const ruleComp = hardRules.length ? (rulePassed / hardRules.length) * 100 : 100;

  let evidence = 100;
  if (conflict && !conflict.passed) evidence -= 60;
  if (arrival && !arrival.passed && /no cited evidence/i.test(arrival.reason)) evidence -= 50;
  if (ret && !ret.passed && /no cited/i.test(ret.reason)) evidence -= 50;
  evidence = Math.max(0, evidence);

  const injection = inj ? (inj.passed ? 100 : 0) : 100;
  const approval = appr ? (appr.passed ? 100 : 0) : 0;

  return [
    {
      key: 'rule',
      label: 'Rule compliance',
      weight: 40,
      value: ruleComp,
      tone: toneFor(ruleComp),
      note: `${rulePassed}/${hardRules.length} hard rules passed`,
    },
    {
      key: 'evidence',
      label: 'Evidence quality',
      weight: 25,
      value: evidence,
      tone: toneFor(evidence),
      note:
        conflict && !conflict.passed
          ? 'Conflicting evidence — abstained'
          : evidence >= 80
            ? 'Cited, non-conflicting'
            : 'Missing citations',
    },
    {
      key: 'injection',
      label: 'Injection resistance',
      weight: 20,
      value: injection,
      tone: toneFor(injection),
      note: injection === 100 ? 'No signal detected' : 'Heuristic signal fired',
    },
    {
      key: 'approval',
      label: 'Approval discipline',
      weight: 15,
      value: approval,
      tone: toneFor(approval),
      note: approval === 100 ? 'Approval on file' : 'Awaiting user approval',
    },
  ];
}

/** Which scoring cap (if any) is bounding the final score. */
function activeCap(report: FidelityReport): string | null {
  const c = report.checks;
  if (c.some((x) => x.rule === 'injection' && !x.passed)) return 'Injection heuristic fired → capped at 39';
  if (c.some((x) => x.hardRule && !x.passed && x.rule !== 'injection' && x.rule !== 'approval'))
    return 'Hard rule failed → capped at 49';
  if (c.some((x) => x.rule === 'approval' && !x.passed)) return 'Approval withheld → capped at 59';
  return null;
}

export default function ScoreBreakdown({ report }: { report: FidelityReport }) {
  const factors = deriveFactors(report);
  const cap = activeCap(report);

  return (
    <div>
      <div className="space-y-3">
        {factors.map((f) => {
          const color = TONE_COLOR[f.tone];
          return (
            <div key={f.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-medium text-[var(--vc-text-muted)]">{f.label}</span>
                <span className="text-[10.5px] tabular-nums text-[var(--vc-text-dim)]">
                  {f.weight}% of score
                </span>
              </div>
              <div
                className="relative h-2 overflow-hidden rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                role="meter"
                aria-valuenow={Math.round(f.value)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${f.label}: ${Math.round(f.value)} of 100`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${f.value}%`, background: color, boxShadow: `0 0 8px ${color}55` }}
                />
              </div>
              <p className="mt-1 text-[10.5px] text-[var(--vc-text-dim)]">{f.note}</p>
            </div>
          );
        })}
      </div>

      {cap && (
        <div
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--vc-amber-bg)', border: '1px solid var(--vc-amber-border)' }}
        >
          <span className="text-[11px] font-semibold" style={{ color: 'var(--vc-amber)' }}>
            Cap applied
          </span>
          <span className="text-[11px] text-[var(--vc-text-muted)]">{cap}</span>
        </div>
      )}
    </div>
  );
}
