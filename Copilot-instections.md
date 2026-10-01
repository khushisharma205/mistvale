Read these files first, in this exact order, before you write any code:

1. BRAND.md                          — Mistvale brand and design rules (binding)
2. The assessment brief (the file named "Developer Assessment — Rescue the
   Mistvale tea.txt" or README.md) — business rules R1–R8, constraints,
   deliverables, judging rubric
3. AGENT.md                          — the full implementation plan I wrote for
   you: bug inventory, design system, section order, acceptance checklist
4. PROMPTS.md                        — my AI prompt log, so you can see the
   approach that has already been validated
5. index.html                        — the broken store you are fixing

Do not skim. Do not summarise them back to me. Read every line of AGENT.md
and BRAND.md and the assessment brief. Only after you have read all five
files, begin implementation.

## What you are building
A single, rewritten `index.html` — all CSS and JS inside it — that turns the
current broken Mistvale tea store into one the brand would be proud to launch.
Same file name. Same folder. Nothing else added to the repo except images.

## Follow AGENT.md exactly
AGENT.md is the authoritative plan. It contains:
- §1 hard constraints (never break)
- §2 the 8 business rules (R1–R8) with exact formulas
- §3 every known bug, grouped by severity, with the fix for each
- §4 the design system (colours, type, spacing, motion, components)
- §5 SEO + structured data requirements
- §6 accessibility requirements
- §7 performance requirements
- §8 the suggested rebuild order
- §9 the acceptance checklist (this is the definition of "done")
- §10 deliverables
- Appendix A: suggested DOM structure

Do not skip any section. Do not invent your own interpretation of a rule —
implement the exact wording in AGENT.md.

## Non-negotiable constraints (do not violate these even if it "looks better")
- ONE HTML file. All CSS + JS stay inside `index.html`. No separate `.css`
  or `.js`.
- NO frameworks, NO libraries. No jQuery, Tailwind, Bootstrap, React,
  animate.css, Font Awesome, icon fonts. Google Fonts is allowed (one
  `<link>` with `display=swap`, families Fraunces + Inter only).
- `PRODUCTS[i].id`, `.name`, `.price` are READ-ONLY. Never mutate.
- The checkout form contract is sacred:
    <form id="checkout-form"
          action="https://mistvale.example/cart/checkout"
          method="POST">
      <input type="hidden" name="items">
      <input type="hidden" name="coupon">
    </form>
  On Checkout: fill `items` with `JSON.stringify([{id, qty}, …])`, fill
  `coupon` with the applied code or `""`, then `form.submit()`. Never alert.
- Do not touch the `API` object between `// ---- API START` and
  `// ---- API END`. Fix how the page uses it, not the API itself.
- Do not change the footer legal paragraph (ref MV-LGL-07). Leave it byte-
  identical to the original.
- Do not invent facts. Only use company facts from BRAND.md and product facts
  from `PRODUCTS`. No invented ratings, reviews, awards, press, "Shark Tank",
  "10,000+ customers", "Diwali Sale", countdown timers, Facebook/YouTube
  icons, or "BEST TEA IN THE WORLD".
- If something is contradictory or unknowable, pick a sensible temporary
  choice, add a `// TODO(question):` comment in the code, and list it in
  NOTES.md under "Questions for the team". Do not guess silently.

## Implementation order (follow AGENT.md §8)
1. Strip the `<head>`: remove all CDN links (jQuery, animate.css,
   Font Awesome). Keep charset, viewport, title, meta, one Google Fonts link,
   one `<style>`.
2. Rewrite the CSS from scratch using BRAND tokens as CSS custom properties.
3. Rebuild header, hero, add trust strip.
4. Rebuild shop (filter chips, search, sort, grid) driven by a single `state`
   object and one `render()` function. All events mutate `state` and call
   `render()`. Attach listeners ONCE at init via event delegation — never
   inside a render function.
5. Rebuild the cart drawer with per-line +/−/remove working correctly, R2
   enforced, and R3 coupon logic (case-insensitive, 10% eligible only, cap
   ₹150, min subtotal ₹399, gift boxes excluded, idempotent).
6. Rebuild the delivery check with `.then().catch()`, a request token to
   guard against stale responses, and a terminal state for every case.
7. Wire the checkout form to the contract above.
8. Add FAQ accordion (accessible, `aria-expanded`), inline newsletter, footer.
9. Add JSON-LD: Organization/OnlineStore + 8 Products (aggregateRating ONLY
   for products with a real `rating` field) + FAQPage from the approved
   answers, verbatim.
10. Delete the auto-popup newsletter and the countdown entirely.

## Fix every bug in AGENT.md §3
That section lists every known bug — 24 JS bugs, 15 design/brand violations,
9 content/copy violations, and the missing required sections. Fix all of them.
If you find a bug that is not in the list, fix it too and note it in NOTES.md.

## Definition of done
You are done ONLY when every item on the AGENT.md §9 acceptance checklist
passes. Before you reply "done", walk through that checklist line by line
and confirm each item passes. If any item fails, fix it and re-audit. Do not
mark an item as passing if you did not actually verify it.

## Also produce (short, in the same reply as the finished file)
- A "what changed" summary grouped as: bugs fixed, design, UX, SEO, a11y,
  perf.
- A list of anything from AGENT.md you could not complete in one pass, so I
  can follow up in a second turn.

## Do not
- Do not paste the file in ten chunks. Give me the complete `index.html` in
  one block at the end of your reply.
- Do not add a README, a build step, a package.json, a test folder, or any
  other file. Only `index.html` changes.
- Do not ask me clarifying questions you can answer yourself from BRAND.md,
  AGENT.md, or the assessment brief. Read first, decide, then implement. Only
  ask if a decision is genuinely contradictory and un-guessable — and in
  that case, pick the safest option, add a `TODO(question):` comment, and
  keep moving.

Start now. Read all five files, then implement.