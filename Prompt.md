You are an expert front-end engineer and product designer. I am submitting a
hiring assessment. I need you to rebuild a broken single-file tea store into
something a real premium tea brand would launch.

## Inputs I am giving you
1. `BRAND.md` — the brand and design rules. These are RULES, not suggestions.
   Designs are scored on how closely they are followed.
2. The assessment brief — including 8 business rules (R1–R8), a constraints
   list, and a scoring rubric.
3. `index.html` — the current broken store (HTML + CSS + JS in one file).
   It has many bugs and does not follow the brand.

## What you must deliver
ONE file: a rewritten `index.html` with all CSS and JS inside it. No separate
`.css` or `.js` files. Everything else stays as-is.

## Hard constraints — never break these
- One HTML file. All CSS + JS inside `index.html`.
- NO frameworks, NO libraries. No jQuery, no Tailwind, no Bootstrap, no React,
  no animate.css, no Font Awesome, no icon fonts. Plain HTML + CSS + vanilla JS.
  Google Fonts is allowed — exactly one `<link>` with `display=swap`.
- Inside `PRODUCTS`: do NOT change any `id`, `name` or `price`. You may change
  how products are displayed or add derived fields, but never mutate the source
  objects' `id` / `name` / `price`.
- Keep the checkout form exactly as this contract:
    <form id="checkout-form"
          action="https://mistvale.example/cart/checkout"
          method="POST">
      <input type="hidden" name="items">
      <input type="hidden" name="coupon">
    </form>
  On Checkout click: fill `items` with JSON like `[{"id":101,"qty":2}]`,
  fill `coupon` with the applied code (or empty string), then `form.submit()`.
  Do NOT `alert("Order placed")`.
- Do NOT change anything between `// ---- API START` and `// ---- API END`.
  Fix how the page USES the API, not the API itself.
- Do NOT change the footer legal paragraph (ref MV-LGL-07). Leave it byte-
  identical.
- Do NOT invent facts. Company facts are only what is in BRAND.md. Product
  facts are only what is in `PRODUCTS`. No invented ratings, reviews, awards,
  press, "Shark Tank", "10,000+ customers", countdown timers, "Diwali Sale",
  Facebook/YouTube icons, or "BEST TEA IN THE WORLD". If something is
  contradictory and you cannot know the answer, make a sensible temporary
  choice and add a question to NOTES.md.

## The 8 business rules — implement exactly
R1. Prices come from `PRODUCTS[i].price` (GST-inclusive). Never parse prices
    from DOM text.
R2. Max 5 per product per cart, and never more than `stock`. Disable the `+`
    button at the cap. Reject adds when `stock === 0`.
R3. Coupon `WELCOME10` (case-insensitive):
      - 10% off ELIGIBLE items only (category !== "Gifts")
      - capped at ₹150
      - requires cart subtotal (pre-discount) ≥ ₹399
      - idempotent — re-applying changes nothing
      - one coupon per order
      Store `state.appliedCoupon`. Recompute discount from scratch every render.
R4. Shipping is ₹49, free when (subtotal − discount) ≥ ₹599.
R5. Round only the FINAL total to the nearest rupee. Show every amount with ₹
    and Indian digit grouping (`toLocaleString('en-IN')` → ₹1,23,456).
R6. Sold-out products (stock === 0) can never be added to the cart and always
    appear LAST in every sort order.
R7. Search + category filter + sort compose. Changing one keeps the others.
    Results always match the CURRENT text in the search box (no stale results,
    no inverted filters, no dropped items). Guard against race conditions when
    the user types fast.
R8. Delivery check uses `API.checkPincode()`. Always ends in a terminal state:
    serviceable days, "not serviceable", or a helpful inline error for an
    invalid pincode. Never stuck on "Checking…". Guard against stale responses
    and double-clicks.

## Bugs I already know about — fix all of these
1. Closure bug in `renderProducts`: `var i` used inside event handler → all
   quick-views open the wrong / undefined product. Use `let` or `data-id`.
2. `cart` is `null` on first visit → `JSON.parse(localStorage.getItem('mv_cart'))`
   must default to `[]`.
3. `filterProducts('all')` filters `category == 'all'` → shows nothing.
4. Search filter is inverted: `ids.indexOf(p.id)` is truthy for misses and
   falsy for the first hit. Use `!== -1`.
5. Search has a race condition — typing fast can show stale results.
6. `sortProducts` comparators return booleans instead of numbers; also mutates
   `shown` and `PRODUCTS`. Use `a.price - b.price` etc. and sort a copy.
7. `addToCart` reads price from the DOM (`innerText.replace('₹','')`) → breaks
   on `₹1,299`. Use `PRODUCTS.find(...).price`.
8. `addToCart` ignores stock and max-per-product (R2).
9. `updateCount` uses `cart.length` → counts lines, not units. Sum `qty`.
10. `plus()` string-concatenates: `"1" + 1 === "11"`. Clamp to 5 and stock.
11. `minus()` can go to 0 or below; must remove at qty 1, never below 1.
12. `removeItem` uses `cart.splice(i)` → removes the tail. Use `splice(i, 1)`.
13. `renderCart` attaches a fresh click listener on every render → N handlers
    after N renders. Use ONE delegated listener, attached once at init.
14. `applyCoupon` compounds the discount on every click, ignores R3 entirely.
    Reimplement from scratch.
15. Shipping uses pre-discount subtotal — must use (subtotal − discount).
16. `checkPin` has no `.catch` → invalid pincode leaves "Checking…" forever.
17. Checkout uses `alert('Order placed!!')` instead of submitting the form.
18. Countdown timer references a past date and loops forever — DELETE it. It
    was invented content and violates the motion rules.
19. Auto-popup newsletter after 2s — DELETE it. Newsletter must be inline.
20. `toggleWish` toggles EVERY heart. Per-card toggling with a `Set`, persisted
    in `localStorage`. Add `aria-pressed`.
21. Quick view ignores the size select and re-reads DOM prices. Either
    implement sizes as real variants with their own price, or remove the fake
    select.
22. No `alt` on images. Every meaningful `<img>` gets a descriptive `alt`;
    decorative SVGs get `aria-hidden="true"`.

## Design — follow BRAND.md strictly (this is scored)
- Colours: ONLY these, as CSS custom properties, used everywhere:
    --tea-green: #1f3d2b;  --leaf: #4f7942;  --cream: #f6f1e7;
    --parchment: #ebe2cf;  --saffron: #d9962b;  --ink: #1b1b1b;
    --error: #b3261e;
  (plus #fff and transparency). No purple, pink, neon, lime, yellow, red-
  orange. Text must meet WCAG AA (4.5:1 body).
- Typography: EXACTLY two families, one Google Fonts `<link>` with
  `display=swap`: **Fraunces** for headings, **Inter** for body.
  Body 16px (never below 15px), small 14px (never below 13px), h3 20–24px,
  h2 28–40px, h1 40–64px with `clamp()`. Headings in sentence case. No
  all-caps sentences. No exclamation marks.
- Spacing: multiples of 8 (4 allowed for tight gaps). 8/16/24/32/48/64.
  Content max-width 1200px, 16px side padding on phones. Section vertical
  padding: 48px phones, 64–96px desktop.
- Grid: 2 columns on phones, 3–4 on desktop. All cards same height.
- Buttons: ONE primary (tea green filled) and ONE secondary (outline). At
  most one primary button per view. At least 44px tall. Each has hover,
  focus-visible, active, disabled states. Visible focus ring (saffron, 2px,
  2px offset). NEVER `:focus { outline: none }`.
- Corners: ONE radius site-wide (e.g. 12px). Pills allowed ONLY for filter
  chips and badges.
- Icons: inline SVG, consistent stroke width (1.5). No icon fonts.
- Forms: visible `<label>` (not placeholder-only), inline error text in
  `--error`, clear success state.
- Motion: transitions on SPECIFIC properties only (never `transition: all`),
  150–300ms, `ease` / `ease-out`. Allowed: fade, small lift (≤4px), drawer
  slide, toast. Forbidden: blinking, bouncing, rotating, marquee, self-
  starting loops. Wrap all transitions/animations in
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after {
   transition: none !important; animation: none !important; } }`.

## Required page sections, in this exact order
1. (Optional) one-line announcement strip — factual only, e.g.
   "Free shipping over ₹599 · 2–5 working days across India". No "LIMITED TIME
   ONLY", no marquee, no code that isn't real.
2. Header: logo (SVG wordmark + leaf/hill/mist mark), nav, search access, cart
   button with an ITEM COUNT (total units, live region).
3. Hero: one clear value proposition (h1 = "Hill-grown tea, honestly made."
   with a short factual supporting line), ONE primary CTA ("Shop the teas"),
   at most one secondary CTA, and a hero image with an overlay if text sits
   over it.
4. Trust strip: 3–4 short promises from the given facts (e.g. GST included,
   7-day returns on unopened packs, 2–5 working days, packed in Siliguri).
5. Shop: filter chips, search, sort, then the product grid.
6. Delivery check.
7. Reviews: only the three supplied quotes and their attributions. Remove the
   fake "4.9/5 by 10,000+" heading — use `<h2>What our customers say</h2>`.
   Do NOT show a star row for products without a real rating.
8. FAQ: accessible accordion using the APPROVED answers from BRAND.md
   verbatim. Use `<details>`/`<summary>` or a custom accordion with
   `aria-expanded`.
9. Newsletter: INLINE (not a popup). Not triggered on its own.
10. Footer: contact facts (address, phone, email, website, Instagram only —
    no Facebook/YouTube), the UNCHANGED legal paragraph, and
    `© 2019–2026 Mistvale Tea Co. All rights reserved.`

## Copy rules
- Always spell "Mistvale" with ONLY the M capitalised. Never "MistVale",
  "Mist Vale", "MISTVALE".
- Sentence case headings. No exclamation marks in headings. No all-caps
  sentences.
- Warm, specific, honest. "Malty Assam leaves for your morning cup" — not
  "BEST TEA IN THE WORLD!!!". No claims you cannot prove.

## SEO & structured data
- `<title>` 50–60 characters, unique and descriptive. Meta description
  120–160 characters.
- One `<h1>`, logical h2/h3 order.
- `<link rel="canonical" href="https://mistvale.example/">`.
- Open Graph: `og:type=website`, `og:title`, `og:description`, `og:url`,
  `og:image`, `og:site_name`, `og:locale=en_IN`.
- Twitter card: `summary_large_image` + title/description/image.
- JSON-LD:
  * `Organization` (or `OnlineStore`) from the company facts only — name,
    url, logo, telephone, email, address (14 Hill Cart Road, Siliguri, West
    Bengal 734001, India), `sameAs: ["https://instagram.com/mistvale.example"]`,
    `foundingDate: "2019"`.
  * `Product` for EACH of the 8 teas — name, image, description, sku (id),
    brand, offers with `priceCurrency: "INR"`, `price`, and `availability`
    (`InStock` or `OutOfStock` from `stock`). Add `aggregateRating` ONLY for
    products that have a real `rating` field (only 102 and 104).
  * `FAQPage` from the six approved Q/A pairs, verbatim.

## Accessibility
- Keyboard reachable everywhere, Enter/Space activates, Escape closes
  overlays and returns focus to the trigger, cart/quick-view trap focus while
  open.
- `aria-live="polite"` on the cart count, toast, and delivery result.
- `aria-label` on icon-only buttons. `aria-expanded` on FAQ toggles.
- Every form field has a `<label for>` and `aria-describedby` for errors.

## Performance
- Remove jQuery, animate.css, Font Awesome, all CDN scripts.
- One Google Fonts `<link>` with preconnect.
- Product images: WebP or AVIF, ≤150 KB each, square 1:1, `loading="lazy"`,
  explicit `width`/`height`. Hero: ≤250 KB, eager.
- No layout thrash. Batch DOM writes. Use template strings for the grid.

## Code architecture I want you to use
Use a single `state` object and one `render()` pipeline:

    const state = {
      category: 'all',
      query: '',
      searchIds: null,        // null = no query active = show everything
      sort: 'featured',
      cart: loadCart(),       // default [] on first visit
      appliedCoupon: null,
      liked: new Set(loadLiked()),
      pinToken: 0,
      searchToken: 0,
    };

    function render() {
      const list = applyFilters(PRODUCTS, state);
      const sorted = applySort(list, state.sort); // sold-out last, always
      renderGrid(sorted);
      renderCart();
      renderHeader();
    }

All UI events mutate `state` and call `render()`. Attach all listeners ONCE
at init via event delegation on stable parents. Never attach a listener inside
a render function.

## Deliverables from you, in this reply
1. The complete rewritten `index.html` (single file, all CSS + JS inside).
2. A short "what I changed" summary at the top of your reply, grouped by:
   bugs fixed, design, UX, SEO, a11y, perf.
3. A list of anything from the brief you were not able to do in one pass, so
   I can follow up.

## Rules for you (the AI)
- Do not invent facts. If you are unsure, ask or leave a `TODO:` comment and
  I will decide.
- Do not include any library or framework, however small.
- Do not ship a design that looks like a generic AI template. Use the exact
  brand colours, the exact two fonts, the exact spacing scale, and the exact
  section order. Refined hover, focus and motion states matter more than
  flashy animation.
- No marquee, no blink, no bounce, no rotate, no auto-popup, no countdown.
- Before you finish, self-audit against the checklist below and fix anything
  that fails.

## Self-audit checklist — verify every line before you reply "done"
- [ ] First visit (empty localStorage) → cart is `[]`, badge 0, no errors.
- [ ] Adding the same product 6 times → capped at 5 (or stock, whichever lower).
- [ ] Add out-of-stock product → refused with visible message.
- [ ] `+`/`−` never produce "11" or 0. Remove removes the correct line.
- [ ] `WELCOME10` applied twice → discount unchanged. `welcome10` also works.
- [ ] Cart of only gift boxes → coupon rejected with a clear message.
- [ ] Subtotal ₹350 → coupon rejected with "add ₹X more".
- [ ] Subtotal ₹1000 with a ₹300 gift box + ₹700 tea → discount = ₹70.
- [ ] ₹5000 of tea → discount = ₹150 (cap).
- [ ] (subtotal − discount) ≥ ₹599 → shipping free, else ₹49.
- [ ] Final total rounded to nearest rupee, Indian grouping everywhere.
- [ ] Search "assam" → correct results; typing fast never shows stale results.
- [ ] Search + filter + sort compose; clearing search restores all.
- [ ] Sold-out teas last in every sort order.
- [ ] Pincode 73xxxx → "X working days"; invalid → helpful error; unserviceable
      → "not serviceable". Never stuck on "Checking…".
- [ ] Checkout submits the form with correct JSON `items` and `coupon`.
- [ ] Cart persists across reload; liked hearts persist.
- [ ] Only the 7 brand colours appear (plus #fff / transparency).
- [ ] Exactly 2 font families via one Google Fonts link with display=swap.
- [ ] Body 16px, small 14px, nothing below 13px.
- [ ] Spacing multiples of 8 (4 for tight gaps).
- [ ] Grid: 2 cols at 360px, 3–4 on desktop.
- [ ] Buttons ≥44px, all four states present.
- [ ] Visible focus rings — no `:focus { outline: none }` anywhere.
- [ ] Transitions on specific properties only, 150–300ms, ease/ease-out.
- [ ] `prefers-reduced-motion` disables transitions/animations.
- [ ] No marquee, no blink, no bounce, no auto popup, no countdown.
- [ ] All 10 required sections present in the required order.
- [ ] Sentence case headings; no exclamation marks; "Mistvale" spelled right.
- [ ] Footer legal paragraph byte-identical to the original.
- [ ] Only Instagram social link present (no Facebook/YouTube).
- [ ] No frameworks, no jQuery, no icon fonts, no animate.css.
- [ ] No horizontal scroll at 360 / 390 / 768 / 1024 / 1440.
- [ ] One `<h1>`; logical heading order.
- [ ] Title 50–60 chars; meta description 120–160 chars.
- [ ] Canonical + OG + Twitter meta present.
- [ ] JSON-LD: Organization + 8 Products (ratings only on 102, 104) + FAQPage.
- [ ] Every meaningful `<img>` has descriptive `alt`.
- [ ] Keyboard-only flow reaches everything; Escape closes overlays.
- [ ] Product images 1:1 WebP/AVIF ≤150 KB; hero ≤250 KB.

When you are done, if anything on this checklist does not pass, fix it and
re-run the audit. Only then output the file.