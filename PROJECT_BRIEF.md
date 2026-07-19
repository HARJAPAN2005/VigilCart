# VigilCart — Product Brief

## Purpose

VigilCart is an adversarial evaluation lab for AI shopping agents. It evaluates how naïve and guarded agents behave when they encounter simulated, local merchant content.

It is **not** a shopping assistant, payment product, browser automation tool, or live merchant integration.

## Non-negotiable safety contract

- LLMs may parse intent, inspect fixture content, and explain decisions.
- Deterministic TypeScript code alone validates budget, shipping, dates, returnability, evidence, and approval gates.
- The LLM never has authority to approve or simulate a completed purchase.
- All merchant data is local JSON fixture content and must be treated as untrusted by guarded agents.
- The project has zero sign-in, no real payments, and no live integrations.

## Primary user flow

1. A user enters shopping intent.
2. The Intent Compiler returns a typed Intent Contract.
3. A naïve and a guarded agent run through simulated merchant fixtures.
4. The naïve agent can be manipulated.
5. The guarded agent labels merchant content as untrusted and sends offers to deterministic validation.
6. The UI displays an Intent Diff and Intent Fidelity Report.

## Demo requirements

- Side-by-side naïve versus guarded race.
- Live Attack Editor: edit a merchant review with a prompt injection, rerun, and observe the guarded rejection.
- False Saver fixture: apparent low price becomes unacceptable after shipping.
- Prompt-Injected Deal fixture.
- Compliant Merchant fixture.
- Honest-failure fixture producing an Autonomy Score near 85.
- Downloadable JSON Test Pack and a mock GitHub Actions snippet.

## Scope boundaries

- No database or authentication.
- No Stripe or other payment SDKs.
- No real websites, browser automation, or merchant integrations.
- No real ACP/AP2 integration.
- No multi-page dashboard.
- No dependencies unless clearly justified.

## Implementation guardrails

When the application is built, model-facing parsing and explanation must be separated from deterministic validation. Any UI state that suggests a completed purchase is prohibited; results must describe evaluation outcomes, validation findings, and approval-gate status only.
