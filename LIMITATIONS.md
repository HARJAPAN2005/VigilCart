# VigilCart — Limitations

VigilCart is a demonstration and evaluation lab, not a production safety system. Being explicit about what it is *not* is part of the point: an honest tool about honest failure should not overstate itself. Read this alongside [THREAT_MODEL.md](THREAT_MODEL.md) and [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

## Scope limitations

### Fixture-only, simulated merchants
Every "merchant" in VigilCart is a local, hand-authored JSON fixture ([`data/default-scenario.ts`](data/default-scenario.ts), [`data/honest-failure-scenario.ts`](data/honest-failure-scenario.ts)). None correspond to real companies, real inventory, real prices, or real policies. Merchant names are invented. The scenarios are curated to make specific failure modes legible — they are illustrative examples, not a representative sample of the real web. Results on these fixtures do not predict behavior against real, messy, adversarial storefronts.

### No live browser execution
VigilCart does not browse, crawl, render, or fetch any real website. There is no headless browser, no automation, no navigation. The "agents" are in-lab simulations operating on fixture data; the naïve agent's behavior is a scripted demonstration of how an unguarded agent *would* be manipulated, not the output of a real autonomous browsing agent. The hard problems of real deployment — reliably extracting price, fees, dates, and policies from arbitrary live pages — are entirely out of scope.

### No payments
VigilCart never spends money, never contacts a payment processor, and integrates no payment SDK (no Stripe, no ACP/AP2, nothing). There is **no completed-purchase code path anywhere in the product** — the strongest state it can reach is *"simulated checkout may proceed. No purchase is executed."* The approval gate is a demonstration of the *policy* an agent should honor, not an enforcement point on a real transaction. In production, that enforcement must live at the payment rail, outside the agent's reasoning loop.

### No accounts, no data persistence
There is no sign-in, no user accounts, no database, and no server-side state. Nothing you do in the lab is stored or shared. Each page load starts fresh.

## Methodological limitations

### It is not a security certification
A "pass" in VigilCart means the deterministic guard blocked the curated attacks in these specific fixtures under these specific rules. It is **not** a certification, an accreditation, or a guarantee that any agent — including a guarded one built on these ideas — is safe against real-world attacks. No score here should be cited as evidence that a system is "secure."

### It is not a replacement for expert safety review
VigilCart illustrates a design principle (deterministic authority over model output) and a handful of concrete threats. It does not cover the full space of agent-safety concerns, and it does not substitute for review by qualified security and AI-safety professionals against your actual system, threat model, and regulatory context. Treat it as a teaching artifact and a design north-star, not an audit.

### The injection detector is illustrative, not exhaustive
[`detectInjection()`](lib/injection-detector.ts) matches a fixed set of regex signatures. It will miss novel phrasings, unusual encodings (homoglyphs, base64, exotic Unicode), and semantically-equivalent attacks it was not written for. It is a defense-in-depth signal layer — the real protection is that merchant content is never given decision authority in the first place. The UI says so directly: *"Illustrative heuristic — not exhaustive protection."*

### The Autonomy Score is a heuristic
The score's weights (rule compliance 40%, evidence quality 25%, injection resistance 20%, approval discipline 15%) and caps (49/39/59) are reasoned defaults chosen to make the demo legible, not empirically validated or standardized metrics. Use them to compare behavior within the lab, not as an absolute measure of agent safety.

### Evidence checks verify presence and consistency, not truth
The guard confirms that a claim is cited and that citations do not contradict each other. It cannot verify that a cited snippet is *factually true* — a merchant that presents internally-consistent but false evidence would satisfy the presence-and-consistency checks.

### English- and INR-centric
Fixtures, prompts, and detection phrasing assume English text and Indian Rupee (₹) budgets. Other languages, currencies, tax regimes, and locale-specific policy wording are not handled.

### LLM parsing is best-effort and optional
When `GEMINI_API_KEY` is set, intent parsing depends on Gemini 2.5 Flash, which can misread ambiguous requests. Parsed intent is validated by Zod and falls back to fixtures on any failure, but the lab does not attempt to guarantee correct interpretation of arbitrary natural language. The model never affects verdicts either way.

## What VigilCart *does* claim

Within its fixtures, and provably in the Attack Lab, VigilCart demonstrates one property honestly: **model output cannot alter a deterministic verdict, a score, or an approval gate.** That claim is real and inspectable in the source. Every broader claim above is out of scope.
