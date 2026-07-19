'use client';

/**
 * Shared motion primitives.
 *
 * Global reduced-motion is handled by <MotionConfig reducedMotion="user"> at the
 * shell root, which neutralises transform/opacity animations. This hook is for
 * imperative cases (SVG stroke animation) that motion cannot see.
 */

import { useSyncExternalStore } from 'react';
import type { Variants, Transition } from 'motion/react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1];

/** Entrance for a whole stage. */
export const stageEnter: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut, staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Child item inside a staggered container. */
export const itemEnter: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

/** Simple fade for overlays. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: easeOut } },
};
