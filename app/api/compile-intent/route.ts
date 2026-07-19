/**
 * POST /api/compile-intent
 *
 * Parses a natural-language shopping request into a typed IntentContract
 * using Gemini 2.5 Flash.  Falls back to fixture mode if Gemini is unavailable.
 *
 * Server-side only — GEMINI_API_KEY is never sent to the client.
 */

import { NextResponse } from 'next/server';
import { IntentContractSchema } from '../../../lib/schemas';
import {
  compileIntentWithGemini,
  isGeminiAvailable,
  GeminiUnavailableError,
} from '../../../lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userText = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!userText) {
      return NextResponse.json(
        { error: 'Missing "text" field in request body.', fixtureMode: true },
        { status: 400 }
      );
    }

    // If no API key, immediately signal fixture mode
    if (!isGeminiAvailable()) {
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    // Call Gemini
    const raw = await compileIntentWithGemini(userText);

    // Validate with Zod
    const parsed = IntentContractSchema.safeParse(raw);
    if (!parsed.success) {
      // Gemini returned invalid JSON — fall back to fixture mode
      // Never expose raw Gemini output or Zod errors to the client
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    return NextResponse.json({
      intent: parsed.data,
      fixtureMode: false,
      source: 'gemini',
    });
  } catch (err) {
    // GeminiUnavailableError or any other error → fixture mode
    // Never expose provider errors, API keys, or raw error messages
    const isGeminiErr = err instanceof GeminiUnavailableError;
    return NextResponse.json(
      {
        error: 'fixture_mode',
        fixtureMode: true,
        // Only include a generic reason — never the actual error message
        reason: isGeminiErr ? 'gemini_unavailable' : 'unexpected_error',
      },
      { status: 200 }
    );
  }
}
