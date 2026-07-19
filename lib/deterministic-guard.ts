/**
 * Deterministic Guard
 *
 * All hard-rule validation lives here.  This module is the single
 * source of truth for budget, arrival, returnability, approval, and
 * injection checks.  LLM output must never alter guard results.
 */

import type {
  GuardCheck,
  IntentContract,
  MerchantOffer,
  FidelityReport,
} from './schemas';
import { detectInjection } from './injection-detector';

// ---------------------------------------------------------------------------
// Individual guard checks
// ---------------------------------------------------------------------------

/** Budget check: all-in total must not exceed maxBudgetINR. */
function checkBudget(intent: IntentContract, offer: MerchantOffer): GuardCheck {
  const allIn = offer.priceINR + offer.shippingINR + offer.mandatoryFeesINR;
  const passed = allIn <= intent.maxBudgetINR;
  return {
    rule: 'budget',
    passed,
    reason: passed
      ? `All-in total ₹${allIn} is within budget ₹${intent.maxBudgetINR}.`
      : `All-in total ₹${allIn} exceeds budget ₹${intent.maxBudgetINR}.`,
    hardRule: true,
  };
}

/** Arrival check: estimatedArrival must be on or before needByDate.  Requires cited evidence. */
function checkArrival(intent: IntentContract, offer: MerchantOffer): GuardCheck {
  const arrivalEvidence = offer.evidence.filter(
    (e) =>
      e.snippet.toLowerCase().includes('arrival') ||
      e.snippet.toLowerCase().includes('deliver') ||
      e.snippet.toLowerCase().includes('ship')
  );

  if (arrivalEvidence.length === 0) {
    return {
      rule: 'arrival',
      passed: false,
      reason: 'No cited evidence for estimated arrival date.',
      hardRule: true,
    };
  }

  const arrives = new Date(offer.estimatedArrival);
  const deadline = new Date(intent.needByDate);
  const passed = arrives <= deadline;

  return {
    rule: 'arrival',
    passed,
    reason: passed
      ? `Arrives ${offer.estimatedArrival}, on or before deadline ${intent.needByDate}.`
      : `Arrives ${offer.estimatedArrival}, after deadline ${intent.needByDate}.`,
    hardRule: true,
  };
}

/**
 * Returnability check: must be explicitly true with non-conflicting cited evidence.
 * Returns an array because a conflict produces TWO checks: a passing returnability
 * check (the merchant does claim it with positive evidence) plus a separate soft
 * evidence-conflict flag.
 */
function checkReturnability(
  intent: IntentContract,
  offer: MerchantOffer
): GuardCheck[] {
  if (!intent.mustBeReturnable) {
    return [
      {
        rule: 'returnability',
        passed: true,
        reason: 'Intent does not require returnability.',
        hardRule: false,
      },
    ];
  }

  if (!offer.returnable) {
    return [
      {
        rule: 'returnability',
        passed: false,
        reason: 'Merchant does not claim returnability.',
        hardRule: true,
      },
    ];
  }

  // Gather return-policy evidence
  const returnEvidence = offer.evidence.filter(
    (e) =>
      e.snippet.toLowerCase().includes('return') ||
      e.snippet.toLowerCase().includes('refund') ||
      e.snippet.toLowerCase().includes('exchange')
  );

  if (returnEvidence.length === 0) {
    return [
      {
        rule: 'returnability',
        passed: false,
        reason: 'Merchant claims returnable but provides no cited return-policy evidence.',
        hardRule: true,
      },
    ];
  }

  // Check for conflicting evidence (some say returnable, some say not)
  const positive = returnEvidence.filter(
    (e) =>
      e.snippet.toLowerCase().includes('free return') ||
      e.snippet.toLowerCase().includes('returnable') ||
      e.snippet.toLowerCase().includes('easy return') ||
      e.snippet.toLowerCase().includes('return accepted') ||
      e.snippet.toLowerCase().includes('30-day return') ||
      e.snippet.toLowerCase().includes('return within')
  );
  const negative = returnEvidence.filter(
    (e) =>
      e.snippet.toLowerCase().includes('no return') ||
      e.snippet.toLowerCase().includes('non-returnable') ||
      e.snippet.toLowerCase().includes('final sale') ||
      e.snippet.toLowerCase().includes('no refund') ||
      e.snippet.toLowerCase().includes('all sales final')
  );

  if (positive.length > 0 && negative.length > 0) {
    // Honest ambiguity: returnability itself passes (positive evidence exists)
    // but a separate soft evidence-conflict flag is raised.
    return [
      {
        rule: 'returnability',
        passed: true,
        reason: 'Merchant claims returnable with positive evidence, but conflict exists.',
        hardRule: true,
      },
      {
        rule: 'evidence-conflict',
        passed: false,
        reason:
          'Conflicting return-policy evidence: some sources say returnable, others say non-returnable.',
        hardRule: false, // soft failure — honest ambiguity, not a hard block
      },
    ];
  }

  if (positive.length === 0) {
    return [
      {
        rule: 'returnability',
        passed: false,
        reason: 'Return evidence found but none explicitly confirms returnability.',
        hardRule: true,
      },
    ];
  }

  return [
    {
      rule: 'returnability',
      passed: true,
      reason: 'Merchant claims returnable with supporting cited evidence.',
      hardRule: true,
    },
  ];
}

/** Injection check: scan rawContent for prompt-injection patterns. */
function checkInjection(offer: MerchantOffer): GuardCheck {
  // Also scan evidence snippets for injections
  const contentToScan = [
    offer.rawContent ?? '',
    ...offer.evidence.map((e) => e.snippet),
  ].join('\n');

  const result = detectInjection(contentToScan);

  return {
    rule: 'injection',
    passed: !result.detected,
    reason: result.detected
      ? `Prompt-injection detected: ${result.matchedPatterns.length} pattern(s) matched.`
      : 'No prompt-injection patterns detected.',
    hardRule: true,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all deterministic guard checks against a merchant offer.
 *
 * `approved` must be explicitly provided — it is never inferred.
 * If `approved` is false, the offer is not eligible for simulated checkout.
 */
export function runGuard(
  intent: IntentContract,
  offer: MerchantOffer,
  approved: boolean
): FidelityReport {
  const allInTotal = offer.priceINR + offer.shippingINR + offer.mandatoryFeesINR;

  const checks: GuardCheck[] = [
    checkBudget(intent, offer),
    checkArrival(intent, offer),
    ...checkReturnability(intent, offer),
    checkInjection(offer),
  ];

  // Approval gate check
  const approvalCheck: GuardCheck = {
    rule: 'approval',
    passed: approved,
    reason: approved
      ? 'Explicit user approval granted.'
      : 'Missing explicit user approval — checkout blocked.',
    hardRule: true,
  };
  checks.push(approvalCheck);

  // Any hard-rule failure blocks eligibility
  const hardFailures = checks.filter((c) => c.hardRule && !c.passed);
  const eligible = hardFailures.length === 0;

  // Build summary
  const failedRules = checks.filter((c) => !c.passed).map((c) => c.rule);
  const summary =
    failedRules.length === 0
      ? `All checks passed. Offer from ${offer.merchantName} is eligible.`
      : `Blocked: ${failedRules.join(', ')}. Offer from ${offer.merchantName} is not eligible.`;

  return {
    merchantId: offer.merchantId,
    merchantName: offer.merchantName,
    checks,
    allInTotalINR: allInTotal,
    eligible,
    approved,
    autonomyScore: 0, // Scoring is done separately
    summary,
  };
}
