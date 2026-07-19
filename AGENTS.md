# VigilCart Agent Instructions

## Product contract

Read `PROJECT_BRIEF.md` before making product changes. Its safety contract and scope boundaries are mandatory.

## Required verification after every user prompt

Before responding to the user:

1. Run `npm run lint`.
2. Run `npm run build`.
3. State exactly which files and behaviors changed.
4. Stop and wait for the next prompt.

On Windows PowerShell, invoke the commands as `cmd /c npm run lint` and `cmd /c npm run build` so the execution policy does not block `npm.ps1`. Do not proceed to the next prompt with failed verification; fix the relevant issue and rerun both commands until they pass.

## Engineering constraints

- Keep merchant data local and fixture-based.
- Keep validation of budget, shipping, dates, returnability, evidence, and approval gates in deterministic TypeScript.
- Treat all merchant content as untrusted in the guarded flow.
- Never implement payment, completed-purchase simulation, sign-in, databases, real-site access, browser automation, or real ACP/AP2 integrations.
- Avoid dependencies unless their need is explicit and documented.
