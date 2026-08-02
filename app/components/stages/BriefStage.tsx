'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Truck, ArrowRight, Wallet, CalendarCheck, RotateCcw, Lock } from 'lucide-react';
import type { IntentContract } from '../../../lib/schemas';
import IntentConsole from '../IntentConsole';
import IntentContractCard from '../IntentContractCard';
import MerchantFixtureCard from '../MerchantFixtureCard';
import StandardsDiagram from '../StandardsDiagram';
import IntentThread from '../IntentThread';
import { useWorkspace } from '../../workspace/WorkspaceContext';
import { stageEnter, itemEnter, usePrefersReducedMotion } from '../../../lib/ui/motion';

const DEFAULT_TEXT =
  'Black carry-on under ₹4,000 all-in, returnable, arrives before 22 July, never buy without my approval.';

export default function BriefStage() {
  const {
    intent,
    reports,
    compiled,
    activeMerchants,
    activeScenario,
    compileFixture,
    compileOpenAI,
    openEvidence,
    setAct,
  } = useWorkspace();

  const reduced = usePrefersReducedMotion();
  const [sealing, setSealing] = useState<IntentContract | null>(null);
  const sealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (sealTimer.current) clearTimeout(sealTimer.current);
    };
  }, []);

  /** The compile moment: language fragments into policy, then the store seals it. */
  const runSealSequence = useCallback(
    (contract: IntentContract, commit: () => void) => {
      if (reduced) {
        commit();
        return;
      }
      setSealing(contract);
      sealTimer.current = setTimeout(() => {
        commit();
        setSealing(null);
      }, 1150);
    },
    [reduced],
  );

  const handleFixtureCompile = useCallback(() => {
    runSealSequence(activeScenario.intent, compileFixture);
  }, [runSealSequence, activeScenario, compileFixture]);

  const handleOpenAICompile = useCallback(
    (openAIIntent: IntentContract) => {
      runSealSequence(openAIIntent, () => compileOpenAI(openAIIntent));
    },
    [runSealSequence, compileOpenAI],
  );

  return (
    <motion.div variants={stageEnter} initial="hidden" animate="show">
      {!compiled ? (
        /* ═══ Act 1 — The Promise ═══════════════════════════ */
        <section className="relative flex min-h-[calc(100vh-160px)] flex-col justify-center pb-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] vc-grid-backdrop opacity-60"
            aria-hidden="true"
            style={{ maskImage: 'radial-gradient(75% 100% at 50% 0%, #000, transparent 78%)' }}
          />

          <div className="relative mx-auto w-full max-w-3xl">
            <motion.div variants={itemEnter}>
              <h1 className="font-display text-[40px] font-semibold leading-[1.06] tracking-[-0.02em] text-white sm:text-[58px]">
                Can your AI shopping agent
                <br />
                be{' '}
                <span className="vc-motion-decor relative inline-block" style={{ animation: 'vc-disrupt-jitter 7s ease-in-out infinite' }}>
                  <span style={{ color: 'var(--vc-green)' }}>talked out of your intent</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 w-1/3"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(240,106,80,0.16), transparent)',
                      animation: 'vc-disrupt-sweep 7s ease-in-out infinite',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 h-px w-full"
                    style={{ background: 'linear-gradient(90deg, var(--vc-green), transparent)' }}
                  />
                </span>
                ?
              </h1>

              <p className="mt-7 max-w-xl text-[16px] leading-7 text-muted">
                Before an agent spends a rupee, VigilCart proves whether it keeps your promises.
                Two agents face the same merchants — one gets manipulated, one shows its evidence
                and waits for you. Fully simulated. No payments, no live merchants.
              </p>
            </motion.div>

            <motion.div variants={itemEnter} className="mt-10">
              <IntentThread />
            </motion.div>

            {/* The hero interaction — issuing a consequential command */}
            <motion.div variants={itemEnter} className="relative mt-8">
              <div className={sealing ? 'pointer-events-none opacity-40 transition-opacity duration-300' : 'transition-opacity duration-300'}>
                <IntentConsole
                  defaultText={DEFAULT_TEXT}
                  onCompile={handleFixtureCompile}
                  onOpenAICompile={handleOpenAICompile}
                />
              </div>

              {/* Language fragmenting into policy */}
              {sealing && <SealOverlay contract={sealing} />}
            </motion.div>

            <motion.div variants={itemEnter} className="mt-12">
              <StandardsDiagram />
            </motion.div>
          </div>
        </section>
      ) : (
        /* ═══ Act 2 — The Intent Contract ═══════════════════ */
        intent && (
          <div className="space-y-8">
            <motion.div variants={itemEnter} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-[26px] font-semibold tracking-tight text-white">
                The mission brief
              </h2>
              <span className="text-[13px] text-dim">{activeScenario.label} scenario</span>
            </motion.div>

            <motion.div variants={itemEnter}>
              <IntentConsole
                defaultText={DEFAULT_TEXT}
                onCompile={handleFixtureCompile}
                onOpenAICompile={handleOpenAICompile}
              />
            </motion.div>

            <motion.div variants={itemEnter} className="grid gap-8 lg:grid-cols-[400px_1fr]">
              <IntentContractCard intent={intent} />

              <div>
                <div className="mb-4 flex items-center gap-2.5">
                  <Truck size={14} strokeWidth={1.8} className="text-dim" />
                  <h3 className="text-[13px] font-semibold text-muted">
                    The marketplace
                    <span className="ml-1.5 font-normal text-dim">
                      — {activeMerchants.length} simulated merchant{activeMerchants.length !== 1 ? 's' : ''}, all untrusted
                    </span>
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {activeMerchants.map((offer) => {
                    const report = reports.find((r) => r.merchantId === offer.merchantId) ?? null;
                    return (
                      <MerchantFixtureCard
                        key={offer.merchantId}
                        offer={offer}
                        report={report}
                        onViewEvidence={openEvidence}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemEnter}
              className="flex flex-col items-start justify-between gap-4 border-t border-faint pt-6 sm:flex-row sm:items-center"
            >
              <p className="text-[13px] leading-5 text-muted">
                The rules are locked. Now watch two agents face the same marketplace.
              </p>
              <button
                type="button"
                onClick={() => setAct('arena')}
                className="vc-focusable inline-flex min-h-11 items-center gap-2 rounded-card px-6 text-[13px] font-semibold tracking-wide transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: 'var(--vc-green)', color: '#0c1410' }}
              >
                Enter the Arena
                <ArrowRight size={14} strokeWidth={2.4} />
              </button>
            </motion.div>
          </div>
        )
      )}
    </motion.div>
  );
}

/* ── The seal: unstructured language becomes enforceable boundaries ── */

function SealOverlay({ contract }: { contract: IntentContract }) {
  const tokens = [
    { icon: Wallet, label: `≤ ₹${contract.maxBudgetINR.toLocaleString('en-IN')} all-in` },
    { icon: CalendarCheck, label: `arrive by ${formatShort(contract.needByDate)}` },
    { icon: RotateCcw, label: contract.mustBeReturnable ? 'returnable' : 'returns optional' },
    { icon: Lock, label: 'human approval' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-center gap-2.5 px-6">
        {tokens.map((t, i) => (
          <span
            key={t.label}
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-medium"
            style={{
              background: 'var(--vc-bg-elevated)',
              borderColor: 'var(--vc-green-border)',
              color: 'var(--vc-green)',
              boxShadow: 'var(--vc-shadow-panel)',
              animation: `vc-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) ${0.12 + i * 0.14}s both`,
            }}
          >
            <t.icon size={12} strokeWidth={2} />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
