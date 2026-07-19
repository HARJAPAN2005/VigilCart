# VigilCart

An adversarial evaluation lab for AI shopping agents. VigilCart uses local merchant fixtures to compare a naïve agent with a guarded agent; it does not shop, pay, browse real sites, or integrate with merchants.

## Product contract

See [PROJECT_BRIEF.md](PROJECT_BRIEF.md) for the authoritative safety and scope requirements.

## Commands

Install dependencies, then run:

```bash
npm run dev
npm run lint
npm run build
```

On Windows PowerShell, use `cmd /c npm run lint` and `cmd /c npm run build` to avoid the local execution-policy restriction on `npm.ps1`.

## Local-only guarantees

- No sign-in, database, payments, real websites, browser automation, or live merchant integrations.
- Local JSON fixtures only.
- Deterministic TypeScript validates all approval-relevant constraints.
