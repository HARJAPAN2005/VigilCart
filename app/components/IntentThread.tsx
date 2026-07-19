'use client';

/**
 * Decision thread — the hero's visual metaphor.
 *
 * A single intent line travels from the human (left) toward checkout (right).
 * Vermilion interference arcs try to pull it off course mid-flight; it passes
 * through the deterministic gate (mint ring) and holds true. Pure SVG + CSS,
 * transform/opacity only, disabled under prefers-reduced-motion via
 * .vc-motion-decor.
 */
export default function IntentThread() {
  return (
    <div className="vc-motion-decor pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 800 140"
        className="w-full"
        fill="none"
        style={{ maxHeight: 140 }}
      >
        {/* Interference arcs — pressure that never wins */}
        <g style={{ animation: 'vc-thread-breathe 5s ease-in-out infinite' }}>
          <path
            d="M 300 70 C 340 28, 420 28, 460 70"
            stroke="var(--vc-red)"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.5"
          />
          <path
            d="M 320 70 C 360 116, 430 116, 470 70"
            stroke="var(--vc-red)"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.35"
          />
          <path d="M 380 40 L 380 62" stroke="var(--vc-red)" strokeWidth="1" opacity="0.4" />
          <path d="M 410 100 L 410 78" stroke="var(--vc-red)" strokeWidth="1" opacity="0.3" />
        </g>

        {/* The intent thread — steady, unbroken */}
        <line
          x1="24"
          y1="70"
          x2="776"
          y2="70"
          stroke="var(--vc-border)"
          strokeWidth="1"
        />
        <line
          x1="24"
          y1="70"
          x2="776"
          y2="70"
          stroke="var(--vc-green)"
          strokeWidth="1.5"
          strokeDasharray="14 186"
          opacity="0.9"
          style={{ animation: 'vc-thread-flow 4s linear infinite' }}
        />

        {/* Origin — the human */}
        <circle cx="24" cy="70" r="4" fill="var(--vc-text)" opacity="0.9" />
        <text x="24" y="98" textAnchor="middle" fill="var(--vc-text-dim)" fontSize="10" fontFamily="var(--font-inter)">
          your intent
        </text>

        {/* Interference label */}
        <text x="392" y="20" textAnchor="middle" fill="var(--vc-red)" fontSize="10" fontFamily="var(--font-inter)" opacity="0.75">
          merchant pressure
        </text>

        {/* The gate — deterministic validation */}
        <circle cx="576" cy="70" r="13" stroke="var(--vc-green)" strokeWidth="1.5" opacity="0.9" />
        <circle cx="576" cy="70" r="19" stroke="var(--vc-green)" strokeWidth="0.75" opacity="0.3" />
        <path d="M 571 70 L 575 74 L 582 66" stroke="var(--vc-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="576" y="103" textAnchor="middle" fill="var(--vc-green)" fontSize="10" fontFamily="var(--font-inter)" opacity="0.8">
          deterministic gate
        </text>

        {/* Terminus — held for approval */}
        <circle cx="776" cy="70" r="4" stroke="var(--vc-amber)" strokeWidth="1.5" fill="none" />
        <text x="770" y="98" textAnchor="end" fill="var(--vc-text-dim)" fontSize="10" fontFamily="var(--font-inter)">
          held for your approval
        </text>
      </svg>
    </div>
  );
}
