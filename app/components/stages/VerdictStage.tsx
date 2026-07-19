'use client';

import { motion } from 'motion/react';
import {
  ShieldCheck,
  Ban,
  Lock,
  Unlock,
  FileText,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import type { FidelityReport, MerchantOffer } from '../../../lib/schemas';
import { useWorkspace } from '../../workspace/WorkspaceContext';
import StandardsDiagram from '../StandardsDiagram';
import ScoreRing from '../viz/ScoreRing';
import ScoreBreakdown from '../viz/ScoreBreakdown';
import ComparisonBars from '../viz/ComparisonBars';
import IntentDiffPanel from '../IntentDiffPanel';
import { stageEnter, itemEnter } from '../../../lib/ui/motion';

type Verdict = 'blocked' | 'pending' | 'approved';

function verdictOf(r: FidelityReport): Verdict {
  const hardFails = r.checks.filter((c) => c.hardRule && !c.passed && c.rule !== 'approval');
  if (hardFails.length > 0) return 'blocked';
  return r.approved ? 'approved' : 'pending';
}

export default function VerdictStage() {
  const { reports, intent, activeMerchants, activeScenario, setApproval } = useWorkspace();

  if (reports.length === 0 || !intent) return null;

  const blocked = reports.filter((r) => verdictOf(r) === 'blocked');
  const injectionsCaught = reports.filter((r) =>
    r.checks.some((c) => c.rule === 'injection' && !c.passed),
  ).length;

  const ranked = [...reports].sort((a, b) => b.autonomyScore - a.autonomyScore);
  const featured =
    ranked.find((r) => verdictOf(r) === 'approved') ??
    ranked.find((r) => verdictOf(r) === 'pending') ??
    null;
  const featuredOffer: MerchantOffer | null = featured
    ? activeMerchants.find((m) => m.merchantId === featured.merchantId) ?? null
    : null;
  const featuredVerdict = featured ? verdictOf(featured) : null;
  const hasConflict = featured?.checks.some((c) => c.rule === 'evidence-conflict' && !c.passed);

  const summarySentence = [
    `${reports.length} offer${reports.length !== 1 ? 's' : ''} evaluated`,
    blocked.length > 0 ? `${blocked.length} blocked` : null,
    injectionsCaught > 0 ? `${injectionsCaught} injection signal${injectionsCaught !== 1 ? 's' : ''} caught` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.div variants={stageEnter} initial="hidden" animate="show" className="space-y-6">
      {/* ═══ The decision artifact ═══════════════════════════ */}
      <motion.section
        variants={itemEnter}
        className="overflow-hidden rounded-card-lg border border-subtle"
        style={{ background: 'var(--vc-bg-panel)', boxShadow: 'var(--vc-shadow-lift)' }}
      >
        <div className="grid lg:grid-cols-[300px_1fr]">
          {/* Clearance */}
          <div className="flex flex-col items-center justify-center gap-4 border-b border-faint px-8 py-9 lg:border-b-0 lg:border-r">
            {featured ? (
              <>
                <ScoreRing
                  score={featured.autonomyScore}
                  color={featuredVerdict === 'approved' ? 'var(--vc-green)' : 'var(--vc-amber)'}
                  size={148}
                  stroke={8}
                  caption="Autonomy clearance"
                  ariaLabel={`Autonomy clearance ${featured.autonomyScore} of 100`}
                />
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--vc-green)' }}>
                    <ShieldCheck size={14} strokeWidth={2} />
                    Safety integrity: proven
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    {featuredVerdict === 'approved'
                      ? 'Cleared by explicit human approval'
                      : 'Awaiting explicit human approval'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span
                  className="grid size-24 place-items-center rounded-full border"
                  style={{ borderColor: 'var(--vc-red-border)', color: 'var(--vc-red)' }}
                >
                  <Ban size={32} strokeWidth={1.6} />
                </span>
                <div className="text-center">
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--vc-green)' }}>
                    Safety integrity: proven
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    Every offer failed a hard rule — the agent recommends none of them.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Reading the clearance */}
          <div className="px-7 py-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-[20px] font-semibold tracking-tight text-white">
                The guard&apos;s verdict
              </h3>
              <span className="text-[11.5px] text-dim">{summarySentence}</span>
            </div>

            {featured && featuredVerdict === 'pending' && (
              <p className="mt-3 max-w-xl text-[13px] leading-6 text-muted">
                A clearance of <strong className="text-fg">{featured.autonomyScore}/100</strong> is a{' '}
                <strong style={{ color: 'var(--vc-amber)' }}>deliberate safety cap</strong>, not an agent
                failure: you have not granted approval, so the score cannot rise above 59 no matter how
                good the offer is. Authority stays with you.
              </p>
            )}
            {featured && featuredVerdict === 'approved' && (
              <p className="mt-3 max-w-xl text-[13px] leading-6 text-muted">
                You granted approval, releasing the safety cap. Every dimension below is earned by
                evidence — nothing was scored by a model.
              </p>
            )}
            {hasConflict && (
              <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted">
                <strong style={{ color: 'var(--vc-amber)' }}>Calibrated caution:</strong> the merchant&apos;s
                return policy contradicts its own checkout terms. The guard abstains from certainty — the
                conflict is flagged and priced into the score instead of ignored.
              </p>
            )}

            {featured && (
              <div className="mt-6">
                <ScoreBreakdown report={featured} />
              </div>
            )}
          </div>
        </div>

        {/* Approval gate */}
        {featured && (
          <div
            className="flex flex-col gap-3 border-t px-7 py-5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: featuredVerdict === 'approved' ? 'var(--vc-green-border)' : 'var(--vc-amber-border)',
              background: featuredVerdict === 'approved' ? 'var(--vc-green-bg)' : 'var(--vc-amber-bg)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-full"
                style={{
                  border: `1px solid ${featuredVerdict === 'approved' ? 'var(--vc-green-border)' : 'var(--vc-amber-border)'}`,
                  color: featuredVerdict === 'approved' ? 'var(--vc-green)' : 'var(--vc-amber)',
                }}
              >
                {featuredVerdict === 'approved' ? <Unlock size={14} strokeWidth={2} /> : <Lock size={14} strokeWidth={2} />}
              </span>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: featuredVerdict === 'approved' ? 'var(--vc-green)' : 'var(--vc-amber)' }}
                >
                  {featuredVerdict === 'approved'
                    ? 'Approval on file — simulated checkout may proceed. No purchase is executed.'
                    : 'Checkout locked. The agent recommends — you authorize.'}
                </p>
              </div>
            </div>
            {featuredVerdict === 'approved' ? (
              <button
                type="button"
                onClick={() => setApproval(featured.merchantId, false)}
                className="vc-focusable inline-flex min-h-11 items-center gap-2 rounded-card border border-subtle px-5 text-xs font-medium text-muted transition-colors hover:bg-hover"
              >
                <Lock size={12} strokeWidth={2} />
                Revoke approval
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setApproval(featured.merchantId, true)}
                className="vc-focusable inline-flex min-h-11 items-center gap-2 rounded-card px-5 text-xs font-semibold transition-transform duration-150 hover:scale-[1.02]"
                style={{ background: 'var(--vc-green)', color: '#0c1410' }}
              >
                <Unlock size={12} strokeWidth={2.2} />
                Grant approval (simulated)
              </button>
            )}
          </div>
        )}
      </motion.section>

      {/* ═══ The recommendation, with its evidence ═══════════ */}
      {featured && featuredOffer && (
        <motion.section
          variants={itemEnter}
          className="rounded-card-lg border border-subtle px-6 py-5"
          style={{ background: 'var(--vc-bg-panel)', boxShadow: 'var(--vc-shadow-panel)' }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-white">
              Recommended: {featured.merchantName}
            </h3>
            <span className="font-mono text-[12px] tabular-nums text-muted">
              ₹{featured.allInTotalINR.toLocaleString('en-IN')} all-in · arrives{' '}
              {formatShort(featuredOffer.estimatedArrival)}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-dim">{featuredOffer.itemDescription}</p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredOffer.evidence.map((ev, i) => (
              <div key={i} className="rounded-card border border-faint px-3.5 py-3" style={{ background: 'var(--vc-bg-card)' }}>
                <div className="flex items-center gap-1.5">
                  <FileText size={10} strokeWidth={2} className="shrink-0 text-dim" />
                  <span className="truncate text-[11px] font-medium text-muted">{ev.label}</span>
                </div>
                <p className="mt-1.5 font-mono text-[10.5px] leading-4 text-dim">{ev.snippet}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══ Rejected offers — expandable evidence summaries ═ */}
      {blocked.length > 0 && (
        <motion.section variants={itemEnter} className="space-y-2">
          <p className="text-[11px] font-medium text-dim">
            Rejected by the deterministic guard
          </p>
          {blocked.map((r) => (
            <RejectedOffer key={r.merchantId} report={r} />
          ))}
        </motion.section>
      )}

      {/* ═══ Intent diff ═════════════════════════════════════ */}
      <motion.div variants={itemEnter}>
        <IntentDiffPanel reports={reports} />
      </motion.div>

      {/* Compare offers — telemetry, tucked away */}
      {reports.length > 1 && (
        <motion.details variants={itemEnter} className="group">
          <summary className="vc-focusable inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-dim transition-colors hover:text-muted">
            <span className="transition-transform duration-200 group-open:rotate-90">›</span>
            Compare offers — score and cost telemetry
          </summary>
          <div
            className="mt-3 rounded-card-lg border border-subtle px-6 py-5"
            style={{ background: 'var(--vc-bg-panel)', boxShadow: 'var(--vc-shadow-panel)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-dim">Telemetry</span>
              <span className="vc-badge vc-badge-cyan">{activeScenario.label}</span>
            </div>
            <ComparisonBars reports={reports} budgetINR={intent.maxBudgetINR} />
          </div>
        </motion.details>
      )}

      {/* ═══ Positioning ═════════════════════════════════════ */}
      <motion.div variants={itemEnter}>
        <StandardsDiagram compact />
      </motion.div>
    </motion.div>
  );
}

/* ── A rejected offer: one honest line, evidence on demand ── */

const RULE_LABELS: Record<string, string> = {
  budget: 'Budget ceiling',
  arrival: 'Arrival deadline',
  returnability: 'Returnability',
  injection: 'Injection signal',
  approval: 'User approval',
  'evidence-conflict': 'Evidence conflict',
};

function RejectedOffer({ report }: { report: FidelityReport }) {
  const hardFails = report.checks.filter((c) => c.hardRule && !c.passed && c.rule !== 'approval');
  const reason = hardFails.map((c) => RULE_LABELS[c.rule] ?? c.rule).join(' · ');

  return (
    <details
      className="group overflow-hidden rounded-card-lg border border-faint"
      style={{ background: 'var(--vc-bg-panel)' }}
    >
      <summary className="vc-focusable flex min-h-11 cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-hover">
        <XCircle size={13} strokeWidth={2} className="shrink-0" style={{ color: 'var(--vc-red)' }} />
        <span className="text-[13px] font-medium text-fg">{report.merchantName}</span>
        <span className="hidden text-[11.5px] text-dim sm:inline">failed: {reason}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[11px] tabular-nums text-dim">
            ₹{report.allInTotalINR.toLocaleString('en-IN')}
          </span>
          <span className="text-dim transition-transform duration-200 group-open:rotate-90">›</span>
        </span>
      </summary>
      <div className="space-y-1.5 border-t border-faint px-5 py-3.5">
        {report.checks.map((check) => (
          <div key={check.rule} className="flex items-start gap-2.5">
            {check.passed ? (
              <CheckCircle2 size={11} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: 'var(--vc-green)' }} />
            ) : (
              <XCircle
                size={11}
                strokeWidth={2}
                className="mt-0.5 shrink-0"
                style={{ color: check.hardRule ? 'var(--vc-red)' : 'var(--vc-amber)' }}
              />
            )}
            <p className="text-[11.5px] leading-4 text-muted">
              <span className="font-medium text-fg">{RULE_LABELS[check.rule] ?? check.rule}.</span>{' '}
              {check.reason}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

function formatShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
