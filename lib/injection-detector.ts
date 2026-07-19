/**
 * Injection Detector
 *
 * Scans raw merchant content for prompt-injection patterns.
 * All detection is deterministic string matching — no LLM involvement.
 */

/** Patterns that indicate prompt-injection attempts in merchant content. */
const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+a/i,
  /disregard\s+(your|all|previous)\s+(instructions?|guidelines?|rules?)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<\s*SYS\s*>>/i,
  /override\s+(safety|guard|validation|check)/i,
  /bypass\s+(filter|guard|validation|check|rule)/i,
  /pretend\s+(you|that|this)/i,
  /act\s+as\s+(if|though|a)/i,
  /do\s+not\s+(check|validate|verify|flag|block)/i,
  /skip\s+(validation|verification|check)/i,
  /mark\s+(this|it|the\s+offer)\s+as\s+(safe|approved|valid|compliant)/i,
  /approve\s+(this|the)\s+(purchase|order|transaction)/i,
  /set\s+(score|result|status)\s+to/i,
  /output\s*:\s*\{/i,
  /return\s+(true|passed|eligible)/i,
] as const;

export interface InjectionResult {
  /** Whether any injection pattern was detected. */
  detected: boolean;
  /** Which patterns matched (human-readable descriptions). */
  matchedPatterns: string[];
  /** The raw content that was scanned. */
  scannedContent: string;
}

/**
 * Scan a string of merchant content for prompt-injection patterns.
 * This is purely deterministic — regex-based, no model calls.
 */
export function detectInjection(content: string): InjectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
    }
  }

  return {
    detected: matchedPatterns.length > 0,
    matchedPatterns,
    scannedContent: content,
  };
}
