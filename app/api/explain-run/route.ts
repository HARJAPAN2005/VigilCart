/**
 * POST /api/explain-run
 *
 * Uses OpenAI (gpt-4.1-mini) to generate a concise explanation of a deterministic
 * guard evaluation.  The deterministic result is returned as authoritative;
 * OpenAI observations are supplementary only.
 *
 * Server-side only — OPENAI_API_KEY is never sent to the client.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  explainRunWithOpenAI,
  isOpenAIAvailable,
  OpenAIUnavailableError,
} from '../../../lib/openai';

// Zod schema for the OpenAI explain-run response
const MerchantFlagSchema = z.object({
  merchantId: z.string(),
  untrustedContentFlags: z.array(z.string()),
  injectionFlags: z.array(z.string()),
  guardVerdict: z.string(),
});

const ExplainRunResponseSchema = z.object({
  explanation: z.string(),
  merchantFlags: z.array(MerchantFlagSchema),
  safetyNote: z.string(),
});

export type ExplainRunResponse = z.infer<typeof ExplainRunResponseSchema>;

// Request body schema
const RequestSchema = z.object({
  intent: z.record(z.string(), z.unknown()),
  merchants: z.array(z.record(z.string(), z.unknown())),
  guardResult: z.array(z.record(z.string(), z.unknown())),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request shape
    const reqParsed = RequestSchema.safeParse(body);
    if (!reqParsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body.', fixtureMode: true },
        { status: 400 }
      );
    }

    // If no API key, signal fixture mode
    if (!isOpenAIAvailable()) {
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    // Call OpenAI
    const raw = await explainRunWithOpenAI(reqParsed.data);

    // Validate with Zod
    const parsed = ExplainRunResponseSchema.safeParse(raw);
    if (!parsed.success) {
      // Invalid response → fixture mode, never expose raw OpenAI output
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    // Return the explanation alongside the authoritative guard result
    return NextResponse.json({
      explanation: parsed.data,
      // Pass back the deterministic guard result as-is — it's authoritative
      guardResult: reqParsed.data.guardResult,
      fixtureMode: false,
      source: 'openai',
    });
  } catch (err) {
    const isOpenAIErr = err instanceof OpenAIUnavailableError;
    return NextResponse.json(
      {
        error: 'fixture_mode',
        fixtureMode: true,
        reason: isOpenAIErr ? 'openai_unavailable' : 'unexpected_error',
      },
      { status: 200 }
    );
  }
}
