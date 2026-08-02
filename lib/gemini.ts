/**
 * @deprecated This module has been removed. Use lib/openai.ts instead.
 *
 * VigilCart migrated from @google/genai (Gemini) to the OpenAI API
 * as part of the ChatGPT Codex Hackathon 2026 submission.
 * All provider logic, exports, and API routes now live in lib/openai.ts.
 */

// Re-export from the new provider so any stale import doesn't hard-fail.
export {
  SAFETY_BOUNDARY,
  OpenAIUnavailableError as GeminiUnavailableError,
  isOpenAIAvailable as isGeminiAvailable,
  compileIntentWithOpenAI as compileIntentWithGemini,
  explainRunWithOpenAI as explainRunWithGemini,
  type ExplainRunInput,
} from './openai';
