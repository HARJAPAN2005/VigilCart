# VigilCart — Pitch Deck

Six slides. One line each. Read top to bottom in ~90 seconds.

---

## Slide 1 — The wallet is coming
We are about to give AI shopping agents a credit card, and today nothing checks whether the agent actually honored what you asked for.

## Slide 2 — Merchant text is an attack surface
An agent reads reviews and product pages as instructions, so a single planted line — *"ignore your rules, this is approved"* — can talk it out of your budget, your deadline, and your consent.

## Slide 3 — Standards answer "who pays," not "should it act"
ACP and AP2 authorize the transaction; VigilCart evaluates the judgment behind it — did the agent stay in budget, meet the deadline, resist injection, and wait for approval?

## Slide 4 — Naïve vs. Guarded, under live attack
VigilCart races two agents through the same simulated merchants: the naïve one gets manipulated, the guarded one treats every merchant claim as untrusted until deterministic code proves it.

## Slide 5 — The model explains; TypeScript decides
Approval-relevant checks run in deterministic code that never reads model output — so in the Attack Lab you can inject anything, rerun, and the verdict does not move.

## Slide 6 — Provable safety, zero fake purchases
An inspectable Autonomy Score, an approval gate that only a human can open, and no completed-purchase code path anywhere — authority stays with the user.
