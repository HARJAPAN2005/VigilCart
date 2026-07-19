import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const requiredFiles = [
  '.env.example',
  'AGENTS.md',
  'PROJECT_BRIEF.md',
  'README.md',
];

const requiredBriefPhrases = [
  'adversarial evaluation lab for AI shopping agents',
  'Deterministic TypeScript code alone validates budget, shipping, dates, returnability, evidence, and approval gates.',
  'The LLM never has authority to approve or simulate a completed purchase.',
  'No database or authentication.',
  'No real websites, browser automation, or merchant integrations.',
];

function readProjectFile(file) {
  try {
    return readFileSync(resolve(file), 'utf8');
  } catch {
    throw new Error(`Required project file is missing or unreadable: ${file}`);
  }
}

for (const file of requiredFiles) readProjectFile(file);

const brief = readProjectFile('PROJECT_BRIEF.md');
for (const phrase of requiredBriefPhrases) {
  if (!brief.toLowerCase().includes(phrase.toLowerCase())) {
    throw new Error(`PROJECT_BRIEF.md is missing required contract text: ${phrase}`);
  }
}

console.log('VigilCart documentation contract verification passed.');
