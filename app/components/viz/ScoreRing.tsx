'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../../lib/ui/motion';

interface ScoreRingProps {
  /** 0-100 */
  score: number;
  color: string;
  /** Outer diameter in px. */
  size?: number;
  /** Stroke width in px. */
  stroke?: number;
  /** Center label; defaults to the score number. */
  label?: React.ReactNode;
  /** Small caption under the number. */
  caption?: string;
  /** Accessible description. */
  ariaLabel?: string;
}

/**
 * Bespoke animated SVG progress ring. Animates stroke-dashoffset from empty to
 * the target on mount; jumps straight to the target under reduced motion.
 */
export default function ScoreRing({
  score,
  color,
  size = 96,
  stroke = 6,
  label,
  caption,
  ariaLabel,
}: ScoreRingProps) {
  const reduced = usePrefersReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    if (reduced) {
      el.style.transition = 'none';
      el.style.strokeDashoffset = String(offset);
      return;
    }
    el.style.strokeDashoffset = String(circumference);
    el.getBoundingClientRect(); // force reflow so the transition plays
    el.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)';
    el.style.strokeDashoffset = String(offset);
  }, [offset, circumference, reduced]);

  const center = size / 2;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `Autonomy score ${clamped} out of 100`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          ref={arcRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? (
          <span className="text-xl font-bold tabular-nums leading-none" style={{ color }}>
            {clamped}
          </span>
        )}
        {caption && (
          <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--vc-text-dim)]">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
