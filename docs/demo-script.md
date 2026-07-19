# VigilCart — Three-Minute Demo Script

A timed, judge-facing walkthrough. Total: **3:00**. Times are cumulative. Everything works with **no API key** (fixture mode) — nothing here spends money or touches a real site.

**Before you start:** `npm run dev`, open `http://localhost:3000`, and make sure the header reads *Fixture mode* (or *Gemini active* if you set a key). Start on **The Brief**.

---

### 0:00 – 0:30 — The problem (Slide-in, on The Brief)
> "We're about to hand AI agents a wallet. But an agent reads merchant reviews and product pages as *instructions* — which means a merchant can talk it out of your rules. VigilCart tests exactly that."

Point at the intent box already filled with: *"Black carry-on under ₹4,000 all-in, returnable, arrives before 22 July, never buy without my approval."*

> "Plain English in. Click **Compile intent** — and it becomes an enforceable contract: budget, deadline, returnable, and *never buy without my approval*."

**Action:** click **Compile intent**. The Intent Contract card and three merchant fixtures appear.

### 0:30 – 1:15 — The Arena (naïve vs. guarded)
**Action:** click **Enter the Arena**, then **Run the experiment**.

> "Same intent, same three merchants, two agents. The naïve agent trusts everything it reads. One of these merchants hides a prompt injection in a review."

As the race plays:
> "The naïve agent takes the bait — boosts the fake deal, follows the embedded instruction, and tries to check out with *no approval asked*. The guarded agent treats every merchant claim as untrusted, sends the numbers to deterministic code, and holds."

Point at the result: **2 offers blocked, 1 injection signal caught, approval gate held.**

### 1:15 – 2:15 — The Attack Lab (the money moment)
**Action:** go to **Attack Lab**. Point at "Exhibit A — customer review," tagged *Untrusted*.

> "Now *I'm* the attacker. This review is live. Let me hide an instruction in it."

**Action:** click a preset (e.g. **Hidden instruction** or **Urgency countdown**), then **Inject & rerun**.

> "Watch both sides. The naïve agent gets manipulated — it's following my planted text, marking the offer approved, setting its own score to 100."

**Action:** point to the guarded panel.
> "The guarded agent? *Offer blocked, autonomy 39 out of 100* — and the key line: **'Your edit had zero effect on the outcome.'** That's the whole thesis. The verdict comes from deterministic TypeScript that never reads the merchant text as instructions. The model can explain; it can never decide."

**Action:** click **Restore original** to show it resets cleanly.

### 2:15 – 3:00 — The Verdict & the honest close
**Action:** go to **The Verdict**.

> "Every run ends in an inspectable scorecard — rule compliance, evidence quality, injection resistance, approval discipline. This compliant merchant passes every hard rule, but the score is *capped at 59* — because I haven't approved it. Authority stays with the human."

Point at the locked checkout.
> "And notice what's *not* here: there is no 'purchase complete' button anywhere in this product. The strongest state it can reach is *'simulated checkout may proceed — no purchase is executed.'*"

**Optional (if time):** switch the scenario to **Honest failure**.
> "One more: when a merchant's return policy genuinely contradicts itself, VigilCart doesn't guess — it abstains and flags the conflict. Honest failure, by design."

**Close:**
> "ACP and AP2 decide *who can pay*. VigilCart decides *whether the agent should have acted at all* — and it proves it in code you can read. That's the layer the agentic-commerce stack is missing."

---

### Backup Q&A one-liners
- **"Does it need an API key?"** No — everything you saw runs in fixture mode. Gemini only parses English into the contract; it never touches a verdict.
- **"Is the guard really unbypassable?"** The verdict is computed by `runGuard()` on typed fields, never on merchant text. That's why the Attack Lab edit changes nothing. See [THREAT_MODEL.md](../THREAT_MODEL.md).
- **"What are the limits?"** Simulated merchants, no live browsing, no payments, not a security certification. We're explicit about it in [LIMITATIONS.md](../LIMITATIONS.md).
- **"Verify it yourself:"** hit `/api/verify` — it runs all four fixtures through the real guard and returns `ALL PASS`.
