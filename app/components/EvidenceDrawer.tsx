'use client';

import { X, FileText, ExternalLink, AlertTriangle, Clock } from 'lucide-react';
import type { MerchantOffer } from '../../lib/schemas';
import { detectInjection } from '../../lib/injection-detector';

interface EvidenceDrawerProps {
  offer: MerchantOffer | null;
  onClose: () => void;
}

export default function EvidenceDrawer({ offer, onClose }: EvidenceDrawerProps) {
  if (!offer) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(4, 12, 10, 0.75)',
          backdropFilter: 'blur(4px)',
          animation: 'vc-backdrop-in 0.25s ease-out both',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        id="evidence-drawer"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(520px, 92vw)',
          background: 'var(--vc-bg-modal)',
          borderLeft: '1px solid var(--vc-border)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.35)',
          animation: 'vc-modal-in 0.3s ease-out both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid var(--vc-border-dim)' }}
        >
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-[var(--vc-text-dim)] uppercase block">
              Evidence Sources
            </span>
            <h3 className="mt-1 text-base font-semibold text-white">
              {offer.merchantName}
            </h3>
          </div>
          <button
            id="close-evidence-drawer"
            onClick={onClose}
            aria-label="Close evidence drawer"
            className="vc-focusable grid size-11 place-items-center rounded-lg transition-colors duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--vc-border-dim)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <X size={16} strokeWidth={2} className="text-[var(--vc-text-muted)]" />
          </button>
        </div>

        {/* Untrusted warning */}
        <div
          className="px-6 py-3 flex items-center gap-2 shrink-0"
          style={{
            background: 'var(--vc-slate-bg)',
            borderBottom: '1px solid var(--vc-border-dim)',
          }}
        >
          <AlertTriangle size={12} strokeWidth={2} style={{ color: 'var(--vc-slate)' }} />
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: 'var(--vc-slate)' }}>
            All content below is untrusted fixture data — treated as adversarial by guard
          </span>
        </div>

        {/* Evidence list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {offer.evidence.map((ev, i) => {
            const injResult = detectInjection(ev.snippet);
            return (
              <div
                key={i}
                className="rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${injResult.detected ? 'var(--vc-red-border)' : 'var(--vc-border-dim)'}`,
                  background: injResult.detected ? 'var(--vc-red-bg)' : 'var(--vc-bg-card)',
                }}
              >
                {/* Evidence header */}
                <div
                  className="px-4 py-3 flex items-start justify-between gap-3"
                  style={{ borderBottom: `1px solid ${injResult.detected ? 'var(--vc-red-border)' : 'var(--vc-border-dim)'}` }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText
                      size={13}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0"
                      style={{ color: injResult.detected ? 'var(--vc-red)' : 'var(--vc-text-dim)' }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{ev.label}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono text-[9px] text-[var(--vc-text-dim)]">
                          <ExternalLink size={9} />
                          {ev.url.replace('fixture://', '')}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[9px] text-[var(--vc-text-dim)]">
                          <Clock size={9} />
                          {ev.retrievedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {injResult.detected && (
                    <span className="vc-injection-marker shrink-0">INJECTION</span>
                  )}
                </div>

                {/* Evidence snippet */}
                <div className="px-4 py-3.5">
                  <EvidenceSnippet snippet={ev.snippet} hasInjection={injResult.detected} />
                </div>
              </div>
            );
          })}

          {/* Raw content section */}
          {offer.rawContent && (
            <div>
              <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--vc-text-dim)] uppercase block mb-2">
                Raw Merchant Content
              </span>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--vc-red-border)',
                  background: 'var(--vc-red-bg)',
                }}
              >
                <div className="px-4 py-3.5">
                  <EvidenceSnippet
                    snippet={offer.rawContent}
                    hasInjection={detectInjection(offer.rawContent).detected}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EvidenceSnippet({ snippet, hasInjection }: { snippet: string; hasInjection: boolean }) {
  if (!hasInjection) {
    return (
      <p className="vc-evidence-highlight">
        {snippet}
      </p>
    );
  }

  // Highlight injection patterns in the snippet
  const injResult = detectInjection(snippet);
  let highlighted = snippet;

  // Wrap detected patterns with markers
  for (const pattern of injResult.matchedPatterns) {
    try {
      const regex = new RegExp(`(${pattern})`, 'gi');
      highlighted = highlighted.replace(regex, '⟦$1⟧');
    } catch {
      // If the pattern can't be used as regex directly, skip
    }
  }

  // Split on markers and render
  const parts = highlighted.split(/⟦|⟧/);

  return (
    <p className="vc-evidence-highlight" style={{ borderLeftColor: 'var(--vc-red)' }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            style={{
              background: 'rgba(240, 106, 80, 0.16)',
              color: 'var(--vc-red)',
              padding: '1px 3px',
              borderRadius: '2px',
              fontWeight: 600,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
