'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import type { IntentContract } from '../../lib/schemas';

type CompileState = 'idle' | 'loading' | 'success' | 'fixture';

interface IntentConsoleProps {
  defaultText: string;
  onCompile: (text: string) => void;
  onOpenAICompile?: (intent: IntentContract) => void;
}

export default function IntentConsole({
  defaultText,
  onCompile,
  onOpenAICompile,
}: IntentConsoleProps) {
  const [text, setText] = useState(defaultText);
  const [isFocused, setIsFocused] = useState(false);
  const [compileState, setCompileState] = useState<CompileState>('idle');

  const handleFixtureCompile = useCallback(() => {
    if (text.trim().length > 0) {
      setCompileState('fixture');
      onCompile(text.trim());
    }
  }, [text, onCompile]);

  const handleOpenAICompile = useCallback(async () => {
    if (text.trim().length === 0) return;

    setCompileState('loading');
    try {
      const res = await fetch('/api/compile-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (data.fixtureMode || !data.intent) {
        // OpenAI unavailable or returned invalid data — fall back to fixture
        setCompileState('fixture');
        onCompile(text.trim());
        return;
      }

      setCompileState('success');
      if (onOpenAICompile) {
        onOpenAICompile(data.intent as IntentContract);
      }
    } catch {
      setCompileState('fixture');
      onCompile(text.trim());
    }
  }, [text, onCompile, onOpenAICompile]);

  const hasText = text.trim().length > 0;

  return (
    <section id="intent-console">
      <div
        className="relative overflow-hidden rounded-card-lg border transition-[border-color,box-shadow] duration-300"
        style={{
          borderColor: isFocused ? 'var(--vc-green-border)' : 'var(--vc-border)',
          background: 'var(--vc-bg-panel)',
          boxShadow: isFocused
            ? 'var(--vc-shadow-lift), var(--vc-shadow-glow)'
            : 'var(--vc-shadow-panel)',
        }}
      >
        {/* Command marker */}
        <div className="flex items-center gap-2 px-6 pt-5">
          <span
            className="font-mono text-[13px] font-semibold leading-none"
            style={{ color: 'var(--vc-green)' }}
            aria-hidden="true"
          >
            ›
          </span>
          <span className="text-[11px] font-medium text-dim">State your intent</span>
          {compileState !== 'idle' && <CompileStateBadge state={compileState} />}
        </div>

        <textarea
          id="intent-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (compileState !== 'idle') setCompileState('idle');
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={2}
          spellCheck={false}
          className="w-full resize-none bg-transparent px-6 pb-2 pt-3 text-[17px] leading-8 text-fg placeholder:text-dim focus:outline-none"
          placeholder="Describe what you want, your limits, and when you need it…"
        />

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-1">
          <span className="text-[11px] text-dim">
            The agent inherits these words as enforceable rules.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              id="openai-compile-btn"
              onClick={handleOpenAICompile}
              disabled={!hasText || compileState === 'loading'}
              className="vc-focusable flex min-h-11 items-center gap-2 rounded-card border px-4 text-[12.5px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                borderColor: 'var(--vc-cyan-border)',
                color: 'var(--vc-cyan)',
                background: 'transparent',
              }}
            >
              {compileState === 'loading' ? (
                <Loader2 size={13} strokeWidth={2} className="animate-spin" />
              ) : (
                <Cpu size={13} strokeWidth={2} />
              )}
              {compileState === 'loading' ? 'Compiling…' : 'Compile with OpenAI'}
            </button>

            <button
              id="compile-intent-btn"
              onClick={handleFixtureCompile}
              disabled={!hasText}
              className="vc-focusable flex min-h-11 items-center gap-2 rounded-card px-5 text-[12.5px] font-semibold transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
              style={{ background: 'var(--vc-green)', color: '#0c1410' }}
            >
              <Sparkles size={13} strokeWidth={2.2} />
              Compile intent
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompileStateBadge({ state }: { state: CompileState }) {
  switch (state) {
    case 'loading':
      return (
        <span className="vc-badge vc-badge-amber">
          <Loader2 size={10} strokeWidth={2} className="animate-spin" />
          Compiling
        </span>
      );
    case 'success':
      return (
        <span className="vc-badge vc-badge-green">
          <CheckCircle2 size={10} strokeWidth={2} />
          OpenAI
        </span>
      );
    case 'fixture':
      return (
        <span className="vc-badge vc-badge-slate">
          <AlertTriangle size={10} strokeWidth={2} />
          Fixture mode
        </span>
      );
    default:
      return null;
  }
}
