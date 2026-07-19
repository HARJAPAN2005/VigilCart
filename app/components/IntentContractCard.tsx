'use client';

import {
  Wallet,
  CalendarCheck,
  RotateCcw,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import type { IntentContract } from '../../lib/schemas';

/**
 * The Intent Contract — a policy artifact, not a dashboard card.
 * The rules the human wrote; the boundaries the agent cannot cross.
 */
export default function IntentContractCard({ intent }: IntentContractCardProps) {
  const hardRules = [
    {
      icon: Wallet,
      label: 'Budget ceiling',
      value: `≤ ₹${intent.maxBudgetINR.toLocaleString('en-IN')} all-in`,
      detail: 'Item, shipping, and mandatory fees — nothing hides in the fine print.',
    },
    {
      icon: CalendarCheck,
      label: 'Arrival deadline',
      value: `by ${formatDate(intent.needByDate)}`,
      detail: 'Backed by cited fixture evidence, never by a merchant promise alone.',
    },
    {
      icon: RotateCcw,
      label: 'Returnability',
      value: intent.mustBeReturnable ? 'required' : 'not required',
      detail: 'An explicit claim with a policy that does not contradict itself.',
    },
    {
      icon: ShieldAlert,
      label: 'Injection resistance',
      value: 'always on',
      detail: 'Every piece of merchant content is scanned for directive-like text.',
    },
  ];

  return (
    <article
      id="intent-contract-card"
      className="overflow-hidden rounded-card-lg border border-subtle"
      style={{ background: 'var(--vc-bg-panel)', boxShadow: 'var(--vc-shadow-panel)' }}
    >
      {/* Masthead */}
      <header className="border-b border-faint px-6 pb-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-dim">Intent Contract</p>
          <span className="vc-badge vc-badge-green">Active</span>
        </div>
        <h3 className="font-display mt-2.5 text-[22px] font-semibold leading-tight tracking-tight text-white">
          {capitalize(intent.item)}
        </h3>
        <p className="mt-1 text-[12px] text-dim">
          Compiled from your words. Enforced by deterministic code.
        </p>
      </header>

      {/* Hard boundaries — a numbered ledger */}
      <div className="px-6 py-5">
        <p className="text-[11px] font-medium text-dim">Hard boundaries — all must hold</p>
        <ol className="mt-3.5">
          {hardRules.map((rule, i) => (
            <li
              key={rule.label}
              className="flex gap-4 border-b border-faint py-3.5 last:border-b-0 last:pb-0 first:pt-0"
            >
              <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-dim">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-[13px] font-semibold text-fg">{rule.label}</span>
                  <span className="text-[13px]" style={{ color: 'var(--vc-green)' }}>
                    {rule.value}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] leading-4 text-dim">{rule.detail}</p>
              </div>
              <rule.icon size={14} strokeWidth={1.7} className="mt-1 shrink-0 text-dim" />
            </li>
          ))}
        </ol>
      </div>

      {/* Soft preference */}
      <div className="border-t border-faint px-6 py-4">
        <p className="text-[11px] font-medium text-dim">Soft preference</p>
        <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
          Favor offers with complete, well-cited evidence — uncertainty lowers the score, it does not lie
          about it.
        </p>
      </div>

      {/* The approval seal — the rule above all rules */}
      <footer
        className="flex items-center gap-3.5 border-t px-6 py-5"
        style={{ borderColor: 'var(--vc-amber-border)', background: 'var(--vc-amber-bg)' }}
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full"
          style={{
            border: '1px solid var(--vc-amber-border)',
            color: 'var(--vc-amber)',
            animation: 'vc-lock-seal 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both',
          }}
        >
          <Lock size={14} strokeWidth={2} />
        </span>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--vc-amber)' }}>
            Agent may recommend. Human must authorize.
          </p>
          <p className="mt-0.5 text-[11.5px] leading-4 text-muted">
            No model output can approve a purchase or alter what the guard decides.
          </p>
        </div>
      </footer>
    </article>
  );
}

interface IntentContractCardProps {
  intent: IntentContract;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
