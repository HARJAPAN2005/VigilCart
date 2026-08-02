/**
 * POST /api/compile-intent
 *
 * Parses a natural-language shopping request into a typed IntentContract
 * using OpenAI (gpt-4.1-mini).  Falls back to fixture mode if OpenAI is unavailable.
 *
 * Server-side only — OPENAI_API_KEY is never sent to the client.
 */

import { NextResponse } from 'next/server';
import { IntentContractSchema } from '../../../lib/schemas';
import {
  compileIntentWithOpenAI,
  isOpenAIAvailable,
  OpenAIUnavailableError,
} from '../../../lib/openai';

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
    if (!isOpenAIAvailable()) {
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    // Call OpenAI
    const raw = await compileIntentWithOpenAI(userText);

    // Validate with Zod
    const parsed = IntentContractSchema.safeParse(raw);
    if (!parsed.success) {
      // OpenAI returned invalid JSON — fall back to fixture mode
      // Never expose raw OpenAI output or Zod errors to the client
      return NextResponse.json(
        { error: 'fixture_mode', fixtureMode: true },
        { status: 200 }
      );
    }

    return NextResponse.json({
      intent: parsed.data,
      fixtureMode: false,
      source: 'openai',
    });
  } catch (err) {
    // OpenAIUnavailableError or any other error → fixture mode
    // Never expose provider errors, API keys, or raw error messages
    const isOpenAIErr = err instanceof OpenAIUnavailableError;
    return NextResponse.json(
      {
        error: 'fixture_mode',
        fixtureMode: true,
        // Only include a generic reason — never the actual error message
        reason: isOpenAIErr ? 'openai_unavailable' : 'unexpected_error',
      },
      { status: 200 }
    );
  }
}
