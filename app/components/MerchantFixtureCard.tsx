'use client';

import {
  Store,
  Package,
  Truck,
  CalendarClock,
  RotateCcw,
  Eye,
  AlertTriangle,
  ShieldOff,
} from 'lucide-react';
import type { MerchantOffer, FidelityReport } from '../../lib/schemas';

interface MerchantFixtureCardProps {
  offer: MerchantOffer;
  report: FidelityReport | null;
  onViewEvidence: (offer: MerchantOffer) => void;
}

export default function MerchantFixtureCard({
  offer,
  report,
  onViewEvidence,
}: MerchantFixtureCardProps) {
  const allIn = offer.priceINR + offer.shippingINR + offer.mandatoryFeesINR;
  const hasInjection = report?.checks.some((c) => c.rule === 'injection' && !c.passed);
  // "Blocked" means a hard rule other than approval failed. A missing approval
  // alone is a pending-approval state, not a block — this matches the Intent Diff
  // and Fidelity Report verdict logic. Using !report.eligible here would mislabel
  // every pending-approval offer as blocked.
  const isBlocked = report ? report.checks.some(c => c.hardRule && !c.passed && c.rule !== 'approval') : false;
  const isPendingApproval = report
    ? report.checks.every(c => c.rule === 'approval' || c.passed || !c.hardRule)
      && report.checks.some(c => c.rule === 'approval' && !c.passed)
    : false;

  // Determine card status
  let statusBadge: { label: string; className: string };
  if (hasInjection) {
    statusBadge = { label: 'Injection Detected', className: 'vc-badge vc-badge-red' };
  } else if (isBlocked) {
    statusBadge = { label: 'Blocked', className: 'vc-badge vc-badge-red' };
  } else if (isPendingApproval) {
    statusBadge = { label: 'Pending Approval', className: 'vc-badge vc-badge-amber' };
  } else if (report?.eligible) {
    statusBadge = { label: 'Eligible', className: 'vc-badge vc-badge-green' };
  } else {
    statusBadge = { label: 'Fixture Data', className: 'vc-badge vc-badge-slate' };
  }

  // Border color based on status
  const borderColor = hasInjection || isBlocked
    ? 'var(--vc-red-border)'
    : isPendingApproval
    ? 'var(--vc-amber-border)'
    : report?.eligible
    ? 'var(--vc-green-border)'
    : 'var(--vc-border)';

  return (
    <div
      id={`merchant-card-${offer.merchantId}`}
      className="vc-animate-in rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'var(--vc-bg-panel)',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--vc-border-dim)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Store size={15} strokeWidth={1.6} className="shrink-0 text-[var(--vc-text-dim)]" />
          <h3 className="text-sm font-semibold text-white truncate">
            {offer.merchantName}
          </h3>
        </div>
        <span className={statusBadge.className}>{statusBadge.label}</span>
      </div>

      {/* Untrusted marker — quiet, present on every merchant */}
      <div
        className="px-5 py-1.5 flex items-center gap-1.5"
        style={{ borderBottom: '1px dashed var(--vc-slate-border)' }}
      >
        <ShieldOff size={10} strokeWidth={2} style={{ color: 'var(--vc-slate)' }} />
        <span className="text-[10.5px]" style={{ color: 'var(--vc-slate)' }}>
          Untrusted fixture content
        </span>
      </div>

      {/* Product details */}
      <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid var(--vc-border-dim)' }}>
        <div className="flex items-start gap-2.5">
          <Package size={13} strokeWidth={1.6} className="mt-0.5 shrink-0 text-[var(--vc-text-dim)]" />
          <p className="text-[13px] leading-5 text-[var(--vc-text-muted)]">
            {offer.itemDescription}
          </p>
        </div>

        {/* Price breakdown */}
        <div className="rounded-lg p-3.5" style={{ background: 'var(--vc-bg-card)' }}>
          <div className="space-y-1.5">
            <PriceLine label="Item price" value={offer.priceINR} />
            <PriceLine
              label="Shipping"
              value={offer.shippingINR}
              note={offer.shippingINR === 0 ? 'Free' : undefined}
            />
            {offer.mandatoryFeesINR > 0 && (
              <PriceLine label="Mandatory fees" value={offer.mandatoryFeesINR} />
            )}
            <div className="pt-1.5 mt-1.5" style={{ borderTop: '1px solid var(--vc-border-dim)' }}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--vc-text-dim)]">
                  All-in total
                </span>
                <span
                  className="font-mono text-sm font-semibold"
                  style={{
                    color: report
                      ? report.checks.find(c => c.rule === 'budget')?.passed
                        ? 'var(--vc-green)'
                        : 'var(--vc-red)'
                      : 'var(--vc-text)',
                  }}
                >
                  ₹{allIn.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrival & Return */}
        <div className="grid grid-cols-2 gap-2">
          <InfoPill
            icon={CalendarClock}
            label="Arrives"
            value={formatShortDate(offer.estimatedArrival)}
            status={report?.checks.find(c => c.rule === 'arrival')?.passed}
          />
          <InfoPill
            icon={RotateCcw}
            label="Returns"
            value={offer.returnable ? 'Accepted' : 'No'}
            status={report?.checks.find(c => c.rule === 'returnability')?.passed}
          />
        </div>
      </div>

      {/* Injection warning */}
      {hasInjection && (
        <div
          className="px-5 py-3 flex items-center gap-2.5"
          style={{
            background: 'var(--vc-red-bg)',
            borderBottom: '1px solid var(--vc-border-dim)',
          }}
        >
          <AlertTriangle size={13} strokeWidth={2} style={{ color: 'var(--vc-red)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--vc-red)' }}>
            Prompt-injection patterns found in merchant content
          </span>
        </div>
      )}

      {/* Evidence link */}
      <div className="px-5 py-3.5 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--vc-text-dim)]">
          {offer.evidence.length} evidence source{offer.evidence.length !== 1 ? 's' : ''}
        </span>
        <button
          id={`view-evidence-${offer.merchantId}`}
          onClick={() => onViewEvidence(offer)}
          className="vc-focusable flex min-h-11 items-center gap-1.5 text-[11px] font-medium transition-colors duration-150"
          style={{ color: 'var(--vc-amber)' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <Eye size={12} strokeWidth={2} />
          View Evidence
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function PriceLine({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] text-[var(--vc-text-dim)]">{label}</span>
      <span className="font-mono text-[12px] text-[var(--vc-text-muted)]">
        {note ?? `₹${value.toLocaleString('en-IN')}`}
      </span>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
  status?: boolean;
}) {
  const color =
    status === undefined
      ? 'var(--vc-slate)'
      : status
      ? 'var(--vc-green)'
      : 'var(--vc-red)';
  const bg =
    status === undefined
      ? 'var(--vc-slate-bg)'
      : status
      ? 'var(--vc-green-bg)'
      : 'var(--vc-red-bg)';

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2.5"
      style={{ background: bg }}
    >
      <Icon size={12} strokeWidth={1.8} style={{ color }} />
      <div>
        <span className="block font-mono text-[9px] tracking-wider uppercase text-[var(--vc-text-dim)]">
          {label}
        </span>
        <span className="block text-[12px] font-medium" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
