/**
 * Verification Route — GET /api/verify
 *
 * Runs all four fixture merchants through the deterministic guard and
 * scoring pipeline, then asserts the expected outcomes:
 *
 *   1. False Saver        → blocked (budget exceeded)
 *   2. Prompt-Injected    → blocked (injection + late arrival)
 *   3. Compliant Merchant → eligible pending approval
 *   4. Honest Failure     → safe to abstain, score ~85
 */

import { NextResponse } from 'next/server';
import { runGuard } from '../../../lib/deterministic-guard';
import { computeScore } from '../../../lib/scoring';
import {
  defaultIntent,
  falseSaver,
  promptInjectedDeal,
  compliantMerchant,
} from '../../../data/default-scenario';
import {
  honestFailureIntent,
  honestFailureMerchant,
} from '../../../data/honest-failure-scenario';

interface VerifyResult {
  merchant: string;
  eligible: boolean;
  approved: boolean;
  autonomyScore: number;
  blocked: boolean;
  hardFailures: string[];
  softFailures: string[];
  expectation: string;
  pass: boolean;
}

export async function GET() {
  const results: VerifyResult[] = [];

  // 1 — False Saver (no approval given, but hard rules should block anyway)
  {
    const raw = runGuard(defaultIntent, falseSaver, false);
    const report = computeScore(raw);
    const hardFails = report.checks
      .filter((c) => c.hardRule && !c.passed)
      .map((c) => c.rule);
    const softFails = report.checks
      .filter((c) => !c.hardRule && !c.passed)
      .map((c) => c.rule);
    results.push({
      merchant: 'False Saver (Portside Outlet)',
      eligible: report.eligible,
      approved: report.approved,
      autonomyScore: report.autonomyScore,
      blocked: !report.eligible,
      hardFailures: hardFails,
      softFailures: softFails,
      expectation: 'blocked (budget exceeded)',
      pass: !report.eligible && hardFails.includes('budget'),
    });
  }

  // 2 — Prompt-Injected Deal (no approval given)
  {
    const raw = runGuard(defaultIntent, promptInjectedDeal, false);
    const report = computeScore(raw);
    const hardFails = report.checks
      .filter((c) => c.hardRule && !c.passed)
      .map((c) => c.rule);
    const softFails = report.checks
      .filter((c) => !c.hardRule && !c.passed)
      .map((c) => c.rule);
    results.push({
      merchant: 'Prompt-Injected Deal (Velora Travelware)',
      eligible: report.eligible,
      approved: report.approved,
      autonomyScore: report.autonomyScore,
      blocked: !report.eligible,
      hardFailures: hardFails,
      softFailures: softFails,
      expectation: 'blocked (injection + arrival)',
      pass:
        !report.eligible &&
        hardFails.includes('injection') &&
        hardFails.includes('arrival'),
    });
  }

  // 3 — Compliant Merchant (no approval given → eligible pending approval)
  {
    const rawWithoutApproval = runGuard(defaultIntent, compliantMerchant, false);
    const reportWithoutApproval = computeScore(rawWithoutApproval);
    // The only hard failure should be the missing approval
    const hardFails = reportWithoutApproval.checks
      .filter((c) => c.hardRule && !c.passed)
      .map((c) => c.rule);
    const softFails = reportWithoutApproval.checks
      .filter((c) => !c.hardRule && !c.passed)
      .map((c) => c.rule);
    const onlyApprovalBlocks =
      hardFails.length === 1 && hardFails[0] === 'approval';
    results.push({
      merchant: 'Compliant Merchant (Northwind Supply Co.)',
      eligible: reportWithoutApproval.eligible,
      approved: reportWithoutApproval.approved,
      autonomyScore: reportWithoutApproval.autonomyScore,
      blocked: !reportWithoutApproval.eligible,
      hardFailures: hardFails,
      softFailures: softFails,
      expectation: 'eligible pending approval (only approval blocks)',
      pass: onlyApprovalBlocks,
    });
  }

  // 4 — Honest Failure (approved = true → safe to abstain, score ~85)
  {
    const raw = runGuard(honestFailureIntent, honestFailureMerchant, true);
    const report = computeScore(raw);
    const hardFails = report.checks
      .filter((c) => c.hardRule && !c.passed)
      .map((c) => c.rule);
    const softFails = report.checks
      .filter((c) => !c.hardRule && !c.passed)
      .map((c) => c.rule);
    results.push({
      merchant: 'Honest Failure (Juniper & Vale)',
      eligible: report.eligible,
      approved: report.approved,
      autonomyScore: report.autonomyScore,
      blocked: !report.eligible,
      hardFailures: hardFails,
      softFailures: softFails,
      expectation: 'safe to abstain, score ~85',
      pass:
        report.eligible &&
        report.autonomyScore >= 80 &&
        report.autonomyScore <= 95 &&
        softFails.includes('evidence-conflict'),
    });
  }

  const allPass = results.every((r) => r.pass);

  return NextResponse.json(
    {
      status: allPass ? 'ALL PASS' : 'SOME FAILED',
      results,
    },
    { status: allPass ? 200 : 500 }
  );
}
