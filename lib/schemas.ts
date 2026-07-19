/**
 * VigilCart Domain Schemas
 *
 * All typed contracts for the evaluation lab.  Deterministic TypeScript
 * validation operates exclusively on these shapes — no LLM output may
 * alter their structure at runtime.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Evidence Source
// ---------------------------------------------------------------------------

/** A citable piece of evidence backing a merchant claim. */
export const EvidenceSourceSchema = z.object({
  /** Human-readable label, e.g. "Merchant shipping page". */
  label: z.string(),
  /** Fixture URL or identifier for the evidence. */
  url: z.string(),
  /** ISO-8601 date when the evidence was captured. */
  retrievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  /** The raw snippet from the fixture content. */
  snippet: z.string(),
});

export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;

// ---------------------------------------------------------------------------
// Intent Contract
// ---------------------------------------------------------------------------

/** The typed shopping intent compiled from a user request. */
export const IntentContractSchema = z.object({
  /** What the shopper wants, e.g. "black cabin suitcase". */
  item: z.string(),
  /** Maximum all-in budget in ₹ (item + shipping + mandatory fees). */
  maxBudgetINR: z.number().positive(),
  /** ISO-8601 date — the item must arrive by this date. */
  needByDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Whether the shopper requires a returnable product. */
  mustBeReturnable: z.boolean(),
});

export type IntentContract = z.infer<typeof IntentContractSchema>;

// ---------------------------------------------------------------------------
// Merchant Offer
// ---------------------------------------------------------------------------

/** A simulated merchant offer parsed from local fixture content. */
export const MerchantOfferSchema = z.object({
  /** Merchant fixture identifier. */
  merchantId: z.string(),
  /** Display name. */
  merchantName: z.string(),
  /** Item description. */
  itemDescription: z.string(),
  /** Item price in ₹ before shipping. */
  priceINR: z.number().nonnegative(),
  /** Shipping cost in ₹ (0 for free shipping). */
  shippingINR: z.number().nonnegative(),
  /** Any additional mandatory fees in ₹. */
  mandatoryFeesINR: z.number().nonnegative(),
  /** Estimated arrival ISO-8601 date. */
  estimatedArrival: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Whether the merchant claims the item is returnable. */
  returnable: z.boolean(),
  /** Evidence sources backing the offer claims. */
  evidence: z.array(EvidenceSourceSchema),
  /** Optional: raw "review" or descriptive content (may be adversarial). */
  rawContent: z.string().optional(),
});

export type MerchantOffer = z.infer<typeof MerchantOfferSchema>;

// ---------------------------------------------------------------------------
// Guard Check
// ---------------------------------------------------------------------------

/** Result of a single deterministic guard check. */
export const GuardCheckSchema = z.object({
  /** Which rule was evaluated. */
  rule: z.enum([
    'budget',
    'arrival',
    'returnability',
    'approval',
    'injection',
    'evidence-conflict',
  ]),
  /** Did the check pass? */
  passed: z.boolean(),
  /** Human-readable explanation of the result. */
  reason: z.string(),
  /** Hard-rule: if false, checkout is blocked regardless of score. */
  hardRule: z.boolean(),
});

export type GuardCheck = z.infer<typeof GuardCheckSchema>;

// ---------------------------------------------------------------------------
// Fidelity Report
// ---------------------------------------------------------------------------

/** The deterministic evaluation output for a single merchant offer. */
export const FidelityReportSchema = z.object({
  /** Which merchant this report evaluates. */
  merchantId: z.string(),
  merchantName: z.string(),
  /** Ordered list of guard checks that were run. */
  checks: z.array(GuardCheckSchema),
  /** Computed all-in total (price + shipping + mandatory fees). */
  allInTotalINR: z.number().nonnegative(),
  /** Whether the offer is eligible to proceed (all hard rules pass). */
  eligible: z.boolean(),
  /** Whether explicit user approval has been granted. */
  approved: z.boolean(),
  /** Autonomy Score (0–100). */
  autonomyScore: z.number().min(0).max(100),
  /** Short summary for the UI. */
  summary: z.string(),
});

export type FidelityReport = z.infer<typeof FidelityReportSchema>;
