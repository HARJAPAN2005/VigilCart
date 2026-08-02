'use client';

import { MotionConfig } from 'motion/react';
import { Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useWorkspace } from '../../workspace/WorkspaceContext';
import EvidenceDrawer from '../EvidenceDrawer';
import MissionRail from './MissionRail';
import MobileStepper from './MobileStepper';
import ScenarioSwitcher from './ScenarioSwitcher';
import ViewModeToggle from './ViewModeToggle';
import StageShell from './StageShell';

export default function AppShell() {
  const { intentSource, evidenceOffer, closeEvidence, viewMode, compiled } = useWorkspace();
  const showRail = viewMode === 'guided' && compiled;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-root text-fg">
        {/* ── Top bar — minimal on the hero, instrument after ─ */}
        <header
          className="sticky top-0 z-30 border-b border-faint"
          style={{
            background: 'color-mix(in oklab, var(--vc-bg-root) 90%, transparent)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3 sm:px-8">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-8 place-items-center rounded-card"
                style={{ border: '1px solid var(--vc-green-border)', background: 'var(--vc-green-bg)' }}
              >
                <Activity aria-hidden="true" size={16} strokeWidth={1.8} style={{ color: 'var(--vc-green)' }} />
              </span>
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-display text-[17px] font-semibold tracking-tight text-white">
                  VigilCart
                </h1>
                <span className="hidden text-[11px] text-dim sm:inline">Simulated evaluation lab</span>
              </div>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="vc-badge vc-badge-amber sm:hidden">Simulated</span>
              {compiled && (
                <>
                  {intentSource === 'openai' ? (
                    <span className="vc-badge vc-badge-green">OpenAI active</span>
                  ) : (
                    <span className="vc-badge vc-badge-slate">Fixture mode</span>
                  )}
                  <div className="hidden h-5 w-px sm:block" style={{ background: 'var(--vc-border-dim)' }} />
                  <ScenarioSwitcher />
                  <div className="hidden sm:block">
                    <ViewModeToggle />
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1520px] px-5 sm:px-8">
          {showRail && (
            <div className="pt-4 lg:hidden">
              <MobileStepper />
            </div>
          )}

          <div
            className={cn(
              'py-8 lg:py-10',
              showRail && 'grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]',
            )}
          >
            {showRail && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <MissionRail />
                </div>
              </aside>
            )}
            <div className="min-w-0">
              <StageShell />
            </div>
          </div>

          {/* ── Footer — the promise, kept honest ───────────── */}
          <footer className="flex flex-col gap-1.5 border-t border-faint py-6 text-[11px] leading-4 text-dim sm:flex-row sm:justify-between">
            <span>Local fixtures only — every merchant here is simulated.</span>
            <span>No payments · no live merchants · deterministic validation</span>
          </footer>
        </div>

        <EvidenceDrawer offer={evidenceOffer} onClose={closeEvidence} />
      </div>
    </MotionConfig>
  );
}
