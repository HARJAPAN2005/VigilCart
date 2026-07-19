'use client';

import { motion } from 'motion/react';
import { useWorkspace } from '../../workspace/WorkspaceContext';
import { cn } from '../../../lib/utils';
import { easeOut } from '../../../lib/ui/motion';
import BriefStage from '../stages/BriefStage';
import ArenaStage from '../stages/ArenaStage';
import AttackStage from '../stages/AttackStage';
import VerdictStage from '../stages/VerdictStage';

/**
 * Renders the mission stages from the single workspace store.
 *
 * Guided mode: Brief/Verdict animate in/out via AnimatePresence (safe to
 * remount — they read from the store). Arena/Attack are mounted once and
 * toggled with `hidden` so their timers and edit state survive act switches.
 * There is exactly one instance of each stage; dashboard mode reuses the same
 * components stacked (one view mode renders at a time — never both).
 */
export default function StageShell() {
  const { activeAct, viewMode, compiled } = useWorkspace();

  if (viewMode === 'dashboard') {
    return (
      <div className="space-y-16">
        <BriefStage />
        {compiled && (
          <>
            <ArenaStage />
            <AttackStage />
            <VerdictStage />
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Persistent stateful stages — never unmounted while compiled. */}
      {compiled && (
        <>
          <div className={cn(activeAct !== 'arena' && 'hidden')}>
            <ArenaStage />
          </div>
          <div className={cn(activeAct !== 'attack' && 'hidden')}>
            <AttackStage />
          </div>
        </>
      )}

      {/* Stateless stages — remount on switch so the entrance replays. */}
      {(activeAct === 'brief' || activeAct === 'verdict') && (
        <motion.div
          key={activeAct}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: easeOut }}
        >
          {activeAct === 'brief' ? <BriefStage /> : <VerdictStage />}
        </motion.div>
      )}
    </div>
  );
}
