# AGENT.md — Rescue the Mistvale Tea Co. store

You are an expert front-end engineer + designer. Your job is to take the single-file
store in `index.html` and turn it into a store Mistvale would be proud to launch,
following **BRAND.md** and the **Developer Assessment** brief to the letter.

Read this whole file before writing a single line of code. Then work through the
sections **in order**. Every item is actionable. Do not skip any.

---

## 0. Mission

Rewrite `index.html` so that it:

1. Follows **BRAND.md** exactly (colours, type, spacing, motion, sections, SEO).
2. Follows the **8 business rules (R1–R8)** in the assessment.
3. Fixes **every bug** listed in §3.
4. Passes the **acceptance checklist** in §9.
5. Keeps the **hard constraints** in §1 intact.

Do **not** invent facts. Only use the company facts in BRAND.md and the products
in `PRODUCTS`. Do **not** invent ratings, reviews, awards, press, social profiles,
sale end dates, "Shark Tank", "10,000+ customers", countdown timers, etc.

---

## 1. Hard constraints (never break)

- **One file.** All CSS and JS live inside `index.html`. Only images go in `images/`.
- **No frameworks / libraries.** No jQuery, no Tailwind, no Bootstrap, no React,
  no animate.css, no Font Awesome, no icon fonts. Plain HTML + CSS + vanilla JS.
  Google Fonts is allowed (one `<link>`).
- **`PRODUCTS` is data, not style.** Do not change any `id`, `name` or `price`.
  You may add derived fields at render time (e.g. size variants) but never mutate
  the source objects' `id`/`name`/`price`.
- **Checkout is a contract.** Keep:
  ```html
  <form id="checkout-form"
        action="https://mistvale.example/cart/checkout"
        method="POST">
    <input type="hidden" name="items">
    <input type="hidden" name="coupon">
  </form>
  ```
  On Checkout click: fill `items` with `JSON.stringify([{id, qty}, …])`,
  fill `coupon` with the applied code (or `""`), then call `form.submit()`.
  Do **not** `alert("Order placed")`.
- **`API` block is untouchable.** Do not edit anything between
  `// ---- API START` and `// ---- API END`. Fix how you *call* it.
- **Legal text is untouchable.** Leave the footer legal paragraph exactly as it is
  (ref MV-LGL-07). Do not change the wording of the GST / returns sentence.
- **No side effects on first load** (no auto popups, no auto audio, no auto motion
  that loops). Only the user starts things.

---

## 2. Business rules — implement exactly

| # | Rule | Where it lives |
|---|------|----------------|
| R1 | Prices come from `PRODUCTS[i].price` (GST-inclusive). Never parse text from the DOM. | `addToCart`, `renderCart`, `openQuickView`, totals |
| R2 | Max 5 per product, and never more than `stock`. Disable `+` at cap. | `plus()`, `addToCart()` |
| R3 | Coupon `WELCOME10`: 10% off **eligible** items, capped at ₹150. Subtotal (pre-discount) must be ≥ ₹399. Gift boxes (category `Gifts`) are not eligible. Case-insensitive. Idempotent. One coupon per order. | `applyCoupon()` |
| R4 | Shipping is ₹49; **free when subtotal-after-discount ≥ ₹599**. | `renderCart()` |
| R5 | Round only the final total to nearest rupee. Indian digit grouping: ₹1,23,456. Use `toLocaleString('en-IN')`. | all money output |
| R6 | Sold-out products: cannot be added to cart; always sorted **last** in every sort order. | `renderProducts`, `sortProducts`, `addToCart` |
| R7 | Search + category + sort compose. Changing one keeps the others. Results always match current search box value. | state object, see §3.7 |
| R8 | Delivery check uses `API.checkPincode()`; always resolves to days / "not serviceable" / helpful error. Never stuck on "Checking…". | `checkPin()` |

**Coupon formula (exact):**
```
eligibleSubtotal = sum of (price * qty) for items whose category !== "Gifts"
if subtotal < 399            -> error "Add ₹X more to use WELCOME10"
else if eligibleSubtotal==0  -> error "WELCOME10 does not apply to gift boxes"
else discount = min(eligibleSubtotal * 0.10, 150)
```
Re-applying the same code changes nothing. Applying a different (unknown) code
keeps the previous discount and shows an error.

---

## 3. Bug inventory — every bug in the current `index.html`

Fix **all** of these. Each line is a bug and the intended behaviour.

### 3.1 Critical JS bugs

1. **Closure bug in `renderProducts`.**
   ```js
   for (var i = 0; i < cards.length; i++) {
     cards[i].querySelector('img').onclick = function () { openQuickView(list[i]); };
   }
   ```
   `i` is `var`, so after the loop `i === cards.length` → `list[i]` is `undefined`.
   → Use `let`, or `cards[i].addEventListener('click', () => openQuickView(list[i]))`,
   or read the product id from a `data-id` attribute.

2. **`cart` is `null` on first visit.**
   `JSON.parse(localStorage.getItem('mv_cart'))` returns `null` when nothing is
   stored, so `cart.find(...)` and `cart.push(...)` throw. → Default to `[]`:
   ```js
   var cart = JSON.parse(localStorage.getItem('mv_cart') || '[]');
   ```

3. **`filterProducts('all')` shows nothing.**
   `PRODUCTS.filter(p => p.category == 'all')` matches nothing. → Treat `'all'`
   as "no category filter".

4. **Search filter is inverted and drops index 0.**
   ```js
   shown = PRODUCTS.filter(p => ids.indexOf(p.id));   // BUG
   ```
   `indexOf` returns `-1` (truthy) for misses and `0` (falsy) for the first hit.
   → `shown = PRODUCTS.filter(p => ids.indexOf(p.id) !== -1);`

5. **Search race condition.** Typing fast fires many promises; an older slow
   response can overwrite a newer fast one. → Keep a token:
   ```js
   let searchToken = 0;
   input.addEventListener('input', () => {
     const my = ++searchToken;
     API.search(input.value).then(ids => {
       if (my !== searchToken) return;
       state.searchIds = ids; render();
     });
   });
   ```
   Also: empty query → `state.searchIds = null` (means "everything") so results
   always match the box.

6. **`sortProducts` comparators are wrong.** `a.price > b.price` returns a boolean,
   not a number. V8 happens to coerce, but it's fragile and also sorts descending
   oddly. → Use `a.price - b.price`, `b.price - a.price`, and
   `a.name.localeCompare(b.name)`. Also **sold-out last** in every order (R6).

7. **`sortProducts` mutates `shown` / `PRODUCTS`.** → Sort a copy:
   `[...arr].sort(...)`. Never mutate `PRODUCTS`.

8. **`addToCart` reads price from the DOM.**
   `document.getElementById('price-'+id).innerText.replace('₹','')` breaks on
   `₹1,299` (→ `1`). → Use `PRODUCTS.find(p => p.id == id).price` (R1).

9. **`addToCart` ignores stock and max-per-product.** → Reject when `p.stock === 0`,
   reject when `qty >= 5`, reject when `qty >= p.stock`. Show a toast/inline message.

10. **`updateCount` counts lines, not units.** `cart.length` is # of distinct
    products. → `cart.reduce((n, c) => n + c.qty, 0)`.

11. **`plus()` string-concatenates.** `input.value` is a string; `"1" + 1 === "11"`.
    → `cart[i].qty = Math.min(5, cart[i].qty + 1)` and clamp to `stock`.

12. **`minus()` can go to 0 or below, and doesn't remove.** → If `qty <= 1`,
    ask to remove (or just remove). Clamp to `>= 1`.

13. **`removeItem` removes the tail.** `cart.splice(i)` deletes from `i` to end.
    → `cart.splice(i, 1)`. Also re-render totals.

14. **`renderCart` attaches a new click listener every render.**
    `items.addEventListener('click', …)` is called each time `renderCart()` runs →
    N handlers after N renders, so one click fires `plus()` N times. → Attach
    **once** via event delegation on a stable parent, or use `onclick` in the
    markup (delegation is preferred).

15. **`applyCoupon` compounds and ignores all rules (R3).**
    `discount = discount + subtotal()*0.1` stacks on every click, has no cap,
    no minimum, no gift exclusion, is case-sensitive. → Implement R3 exactly,
    store `appliedCoupon` (string or `null`) and recompute `discount` from
    scratch each render. Trimming + `toUpperCase()` for comparison.

16. **Shipping uses pre-discount subtotal.** `sub > 599 ? 0 : 49` ignores the
    discount. → `(sub - discount) >= 599 ? 0 : 49` (R4).

17. **`checkPin` has no `.catch`.** `API.checkPincode` rejects with
    `INVALID_PINCODE`, so the promise rejects and the UI stays on "Checking…".
    → `.then(r => …).catch(err => …)` with:
    - invalid → `"Please enter a valid 6-digit pincode."`
    - unserviceable → `"Sorry, we do not deliver to <pin> yet."`
    - serviceable → `"Delivery to <pin> in X working day(s)."`
    Also guard the button against double-clicks and clear old results.

18. **Checkout never submits the form.** `onclick="alert('Order placed!!')"`.
    → Fill `items` + `coupon` on `#checkout-form` and call `submit()` (contract §1).
    Build items from `PRODUCTS` ids, not names.

19. **Countdown references a past date** (`2025-11-01`) and loops forever
    (`setInterval`), violating the motion rules. → **Remove the countdown
    entirely.** It was invented content ("Diwali Sale") and violates BRAND.

20. **Auto-popup newsletter** (`setTimeout(... 2000)` shows `#popup`) violates
    BRAND §8 ("inline, not a pop-up that appears on its own"). → Delete the
    popup. Put the newsletter inline, before the footer (section 9).

21. **`toggleWish` toggles every heart.** `$('.heart').toggleClass('liked')` on
    all hearts. → Per-card toggling with a `Set` of liked ids, persisted in
    `localStorage`. Add `aria-pressed`.

22. **`openQuickView` ignores size select and re-reads DOM prices.** Also no
    Escape key, no focus trap. → Use `PRODUCTS` price, wire size into a unit
    multiplier **only if you also change price logic**; simplest safe choice is
    to remove the fake size select (it did nothing) or to actually implement
    100 g / 250 g as a real variant with its own price and update cart lines.
    (See §6 Extension list.)

23. **No `alt` text on images.** Every `<img>` gets meaningful `alt`.

24. **Duplicate listeners / memory leaks.** Any `.addEventListener` inside a
    render function is a bug. Render → replace innerHTML. Listen once at init.

### 3.2 Design / brand violations

25. `* { transition: all 0.4s !important; }` — banned. Transition **specific**
    properties, `150–300ms`, `ease` / `ease-out`.
26. `*:focus { outline: none !important; }` — banned. Provide visible
    `:focus-visible` rings (saffron, 2px, 2px offset).
27. Colours `#800080`, `#ff69b4`, `#32cd32`, `#ffff00`, `#ff1493`, `red`,
    `orange` — all off-brand. Use the BRAND.md tokens **only**, as CSS custom
    properties. No gradients of unrelated colours.
28. Fonts: Comic Sans, Pacifico, Oswald, Lato, Roboto — off-brand and >2 families.
    → Exactly two families: **Fraunces** (headings) + **Inter** (body), loaded
    with one `<link>` containing `&display=swap`.
29. Body font-size 13px, small text 10–11px → body **16px**, small **14px**,
    never below 13px. Use `clamp()` for h1–h2.
30. `.wrapper { width: 1200px }` → `max-width: 1200px`, `padding: 0 16px` on
    phones, `margin: 0 auto`.
31. Spacing random → multiples of 8 (4 allowed for tight gaps). Section padding
    **48px** on phones, **64–96px** on desktop.
32. Product grid: flex + fixed 270px card → CSS grid: **2 cols** on phones,
    **3–4** on desktop, equal card heights (`align-items: stretch`).
33. Corners: mixed 3px/20px/25px/30px → **one radius site-wide** (pick 12px),
    pills only for filter chips and badges.
34. Icons via Font Awesome → inline SVG, consistent stroke width (e.g. 1.5).
35. Buttons: 12px, animated scale/rotate → **≥44px tall**, one **primary**
    (tea green filled) style used at most once per view, one **secondary**
    (outline) style. Each has hover, focus-visible, active, disabled states.
36. All-caps sentences everywhere ("HOME", "SHOP NOW", "SALE!!!") → sentence
    case headings; no exclamation marks; no shouting.
37. `<marquee>` announcement → static one-line strip; **no marquee**. Optional
    per BRAND (may be omitted entirely).
38. Hero text over image with no overlay → add a soft dark/cream overlay so
    text meets AA contrast; do **not** bake text into the image.
39. Fake trust signals: "BEST TEA IN THE WORLD!!!", "AS SEEN ON SHARK TANK
    INDIA", "Rated 4.9/5 by 10,000+ happy customers" → **remove all of these**.
    No invented ratings or counts. Only the two real ratings on products 102
    and 104 may be shown.

### 3.3 Content / copy violations

40. Hero title "BEST TEA IN THE WORLD!!!" → replace with the tagline family:
    `"Hill-grown tea, honestly made."` as the h1, plus a short supporting line
    ("Small-lot teas from the Darjeeling and Assam hills, packed fresh in
    Siliguri."). CTAs: **"Shop the teas"** (primary) and at most one secondary
    ("How we source", "Visit the garden", etc. — keep it factual).
41. `MistVale` / `MISTVALE` → always `Mistvale` (only the M capitalised).
42. Footer `© 2020` → `© 2019–2026 Mistvale Tea Co.` (founded 2019, current
    year). "All right reserved" → `All rights reserved.`
43. Facebook / YouTube icons → **remove**. Only Instagram is in the facts.
    Link to `https://instagram.com/mistvale.example`.
44. Footer must include the given facts only: address, phone, email, website.
45. Announcement line (if kept): one short factual line, e.g.
    `Free shipping on orders over ₹599 · 2–5 working days across India`.
    No "LIMITED TIME ONLY", no code that isn't real.
46. `☆☆☆☆☆ (0)` next to products without ratings → **show nothing** (or
    "No reviews yet" in 14px muted text). Never fabricate.
47. Reviews block: keep the **three supplied quotes and attributions**, but
    remove the fake "4.9/5 by 10,000+" heading. Use
    `<h2>What our customers say</h2>`.
48. `<title>Home</title>` → 50–60 chars, e.g.
    `Mistvale Tea Co. — Hill-grown tea from Darjeeling & Assam` (56 chars).
    Meta description 120–160 chars, describing the brand honestly.

### 3.4 Missing required sections (BRAND §8)

Add in this exact order:

1. (Optional) Announcement strip — one short factual line.
2. **Header** — logo (SVG wordmark + leaf/hill/mist mark), nav, search entry
   point, cart button **with item count** (total units).
3. **Hero** — one value proposition, **one primary CTA**, at most one secondary,
   one hero image (WebP/AVIF, ≤250 KB).
4. **Trust strip** — 3–4 short promises drawn from the facts only, e.g.
   *GST included*, *7-day returns on unopened packs*, *Delivery in 2–5 working
   days*, *Packed in Siliguri*.
5. **Shop** — filters (chips), search, sort, then the grid.
6. **Delivery check** — pincode input using `API.checkPincode`.
7. **Reviews** — the three supplied quotes only.
8. **FAQ** — accessible accordion using the **approved FAQ answers** verbatim.
9. **Newsletter** — inline (not a popup).
10. **Footer** — contact facts, unchanged legal paragraph, copyright.

---

## 4. Design system to implement (from BRAND.md)

### 4.1 Colour tokens (CSS custom properties)
```css
:root {
  --tea-green: #1f3d2b;   /* header/footer, primary buttons, headings */
  --leaf:      #4f7942;   /* secondary accents, success */
  --cream:     #f6f1e7;   /* main background */
  --parchment: #ebe2cf;   /* cards, alternate sections */
  --saffron:   #d9962b;   /* sparingly: sale badges, focus rings, one accent */
  --ink:       #1b1b1b;   /* body text */
  --error:     #b3261e;   /* error messages */
}
```
Use these **everywhere**. No raw hexes in the markup besides these tokens
(plus `#fff` and transparency). Verify AA contrast: body text on cream/parchment
should be `--ink`; primary buttons use `--cream` text on `--tea-green`.

### 4.2 Typography
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
- Headings: Fraunces, **sentence case**.
- Body: Inter, 16px base, line-height ~1.6.
- Scale: h1 `clamp(40px, 6vw, 64px)`, h2 `clamp(28px, 4vw, 40px)`,
  h3 20–24px, small 14px, min 13px.

### 4.3 Spacing & layout
- Scale: 8 / 16 / 24 / 32 / 48 / 64 px (4 allowed for tight gaps).
- Content `max-width: 1200px`, side padding `16px` on phones.
- Section padding: 48px phones / 64–96px desktop.
- Grid: `grid-template-columns: repeat(2, 1fr)` mobile, `repeat(3, 1fr)` ≥720px,
  `repeat(4, 1fr)` ≥1040px. Cards same height.

### 4.4 Motion
- Transitions on **specific** properties (`background-color`, `transform`,
  `box-shadow`, `opacity`), 150–300ms, `ease` or `ease-out`.
- Allowed: fade, small lift (≤4px), drawer slide, toast.
- Forbidden: blinking, bouncing, rotating, marquee, self-starting loops.
- Wrap every transition in
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }`.

### 4.5 Components
- **Buttons** — `.btn` (primary, tea green), `.btn-outline` (secondary).
  States: `:hover`, `:focus-visible`, `:active`, `[disabled]`. ≥44px tall.
  At most **one** `.btn` per view (the hero CTA).
- **Cards** — parchment background, 12px radius, subtle shadow, hover lift 2px.
- **Chips / badges** — pill radius allowed here only.
- **Icons** — inline SVG, `stroke="currentColor"`, `stroke-width="1.5"`.
- **Forms** — visible `<label>` (not placeholder-only), inline error text in
  `--error`, success state in `--leaf`.

---

## 5. SEO & structured data

- `<title>` 50–60 chars; meta description 120–160 chars.
- One `<h1>` (the hero value proposition). Logical `h2`/`h3` order.
- `<link rel="canonical" href="https://mistvale.example/">`.
- Open Graph: `og:type=website`, `og:title`, `og:description`, `og:url`,
  `og:image` (hero), `og:site_name=Mistvale Tea Co.`, `og:locale=en_IN`.
- Twitter: `summary_large_image`, title, description, image.
- **JSON-LD** (three blocks, or one `@graph`):
  - `Organization` **or** `OnlineStore` — name, url, logo, telephone, email,
    `address` (14 Hill Cart Road, Siliguri, West Bengal 734001, India),
    `sameAs: ["https://instagram.com/mistvale.example"]`, `foundingDate: "2019"`.
  - `Product` for each of the 8 teas — name, image, description, `sku` (id),
    `brand`, `offers` with `priceCurrency: "INR"`, `price`, `availability`
    (`InStock` / `OutOfStock` from `stock`). Add `aggregateRating` **only** on
    products 102 (4.8, 128) and 104 (4.7, 342). Nothing else.
  - `FAQPage` built **verbatim** from the six approved Q/A pairs in BRAND.md.

---

## 6. Accessibility

- Every `<img>` has meaningful `alt`; decorative SVGs have `aria-hidden="true"`.
- Keyboard: every interactive element reachable via Tab, activatable with
  Enter/Space. Cart drawer and quick view trap focus while open; Escape closes
  and returns focus to the trigger.
- ARIA: `aria-expanded` on FAQ toggles and menu buttons; `aria-live="polite"`
  on cart count, toast and delivery result; `aria-pressed` on wishlist hearts;
  `aria-label` on icon-only buttons.
- Colour contrast ≥ 4.5:1 for body text; verify saffron used on cream only for
  focus rings and short badges with dark text or darkened saffron.
- Form fields have `<label for>`, `aria-describedby` pointing at error text.

---

## 7. Performance

- Remove jQuery, animate.css, Font Awesome, all CDN `<script>` tags.
- Load one Google Fonts stylesheet with `display=swap` and preconnect.
- Product images: WebP or AVIF, **≤150 KB each**, square 1:1, `loading="lazy"`
  and explicit `width` / `height` on `<img>`. Hero: ≤250 KB, eager + `fetchpriority="high"`.
- Defer/`type="module"` the script (or place before `</body>`, as now).
- Avoid layout thrash: batch DOM writes; use `classList` / template strings.

---

## 8. Rebuild plan — suggested order

1. Strip `<head>`: remove CDN links, keep charset + viewport + title + meta +
   fonts + one `<style>`.
2. Rewrite CSS from scratch using the tokens and spacing scale.
3. Replace header, hero, add trust strip.
4. Rebuild shop (filters, search, sort, grid) with a **single `render()`**
   driven by a `state` object:
   ```js
   const state = {
     category: 'all',
     query: '',
     searchIds: null,   // null = "no query active"
     sort: 'featured',
     cart: loadCart(),
     appliedCoupon: null,
     liked: new Set(loadLiked()),
   };
   ```
   `render()` = `applyFilters()` → `applySort()` → `renderGrid()`.
   All UI events mutate `state` and call `render()`.
5. Rebuild cart drawer with event delegation (attach listeners **once**).
6. Rebuild delivery check with `.then` + `.catch`.
7. Wire the checkout form (contract).
8. Add FAQ accordion (native `<details>`/`<summary>` styled, or custom with
   `aria-expanded`), newsletter inline, footer.
9. Add JSON-LD blocks.
10. Test (see §9).

---

## 9. Acceptance checklist

Ship only when **all** of these pass.

### Functional
- [ ] First visit (empty localStorage): cart is `[]`, badge shows `0`, no errors.
- [ ] Add the same product 6 times → capped at 5 (or `stock`, whichever is lower).
- [ ] Add an out-of-stock product → refused with a visible message.
- [ ] `+` / `−` on a cart line never produce `"11"` or `0`.
- [ ] Remove line 1 of a 3-line cart → only that line is removed.
- [ ] Apply `WELCOME10` twice → discount unchanged.
- [ ] Apply `welcome10` → works (case-insensitive).
- [ ] Cart of only gift boxes → `WELCOME10` rejected with a clear message.
- [ ] Subtotal ₹350 → coupon rejected with "add ₹49 more".
- [ ] Subtotal ₹1000 with a ₹300 gift box + ₹700 of tea → discount = ₹70 (10% of ₹700).
- [ ] Subtotal ₹5000 of tea → discount = ₹150 (cap).
- [ ] After discount ≥ ₹599 → shipping = ₹0, else ₹49.
- [ ] Totals rounded to nearest rupee; Indian grouping (`₹1,23,456`).
- [ ] Search "assam" → only matching teas; typing fast never shows stale results.
- [ ] Search + filter + sort compose correctly; clearing search restores all.
- [ ] Sold-out teas appear **last** in every sort.
- [ ] Pincode `73xxxx` → "2 working days"; `00xxxx` → "Please enter a valid
  6-digit pincode"; `999999` → "not serviceable". Never stuck on "Checking…".
- [ ] Checkout submits the form with correct JSON `items` and `coupon`.
- [ ] Reload → cart persists; liked hearts persist.

### Design (BRAND.md)
- [ ] Only the 7 brand colours appear (plus `#fff`, transparency).
- [ ] Exactly 2 font families, loaded with one Google Fonts link + `display=swap`.
- [ ] Body 16px; small 14px; nothing below 13px.
- [ ] Spacing values are multiples of 8 (4 for tight gaps).
- [ ] Grid is 2 cols on a 360px viewport; 3–4 on desktop.
- [ ] Buttons ≥44px tall with hover, focus-visible, active, disabled states.
- [ ] Focus rings visible (saffron) — `:focus { outline: none }` is gone.
- [ ] Transitions are property-specific, 150–300ms, `ease`/`ease-out`.
- [ ] `prefers-reduced-motion` disables transitions/animations.
- [ ] No marquee, no blinking, no bouncing, no auto popup, no looping animation.
- [ ] Required sections present, in the required order.
- [ ] Copy is sentence case, no exclamation marks, no invented claims.
- [ ] "Mistvale" always spelled with one capital.
- [ ] Footer legal paragraph byte-identical to the original.
- [ ] Only the three supplied review quotes appear; no aggregate rating.
- [ ] Only Instagram social link present.

### Technical
- [ ] No frameworks, no jQuery, no Font Awesome, no animate.css, no icon fonts.
- [ ] No `transition: all`.
- [ ] No `*:focus { outline: none }`.
- [ ] No console errors or warnings on load or interaction.
- [ ] No horizontal scroll at 360 / 390 / 768 / 1024 / 1440 widths.
- [ ] One `<h1>`; headings nested correctly.
- [ ] `<title>` 50–60 chars; meta description 120–160 chars.
- [ ] Canonical + OG + Twitter meta present.
- [ ] JSON-LD: Organization/OnlineStore, 8× Product (rating only on 102, 104),
      FAQPage with the six approved answers.
- [ ] Every `<img>` has meaningful `alt`; decorative SVG has `aria-hidden`.
- [ ] Keyboard-only flow: Tab through header → hero CTA → filters → grid →
      cart → checkout, all reachable, all visible focus, Escape closes overlays.
- [ ] Images: WebP/AVIF, ≤150 KB products, ≤250 KB hero, 1:1 product aspect.

---

## 10. Deliverables

After running this agent, produce:

- `index.html` — rewritten store, all CSS + JS inside, constraints honoured.
- `images/` — new logo (SVG preferred), hero, 8 product images.
- `NOTES.md` — one page: what changed, what the AI got wrong, images used,
  testing done, questions for the team, time spent, extras, next steps.
- `PROMPTS.md` — the prompt log (see template below).

**Do not ship** until every box in §9 is checked.

---

## Appendix A — Suggested DOM structure

```html
<body>
  <!-- 1 announcement (optional) -->
  <div class="announce">Free shipping over ₹599 · 2–5 working days across India</div>

  <!-- 2 header -->
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="Mistvale Tea Co. home">
        <svg …>…</svg> Mistvale
      </a>
      <nav aria-label="Primary">
        <a href="#shop">Shop</a><a href="#story">Story</a>
        <a href="#faq">FAQ</a><a href="#contact">Contact</a>
      </nav>
      <button class="icon-btn" id="search-toggle" aria-label="Search teas">…</button>
      <button class="icon-btn" id="cart-open" aria-label="Open cart">
        … <span id="cart-count" aria-live="polite">0</span>
      </button>
    </div>
  </header>

  <main>
    <!-- 3 hero -->
    <section class="hero">
      <div class="container hero-inner">
        <h1>Hill-grown tea, honestly made.</h1>
        <p>Small-lot teas from the Darjeeling and Assam hills, packed fresh in Siliguri.</p>
        <a class="btn" href="#shop">Shop the teas</a>
        <a class="btn-outline" href="#story">How we source</a>
      </div>
      <img src="images/hero.webp" alt="Tea picker among misty green rows at dawn" … >
    </section>

    <!-- 4 trust strip -->
    <section class="trust" aria-label="Why shop with us">…</section>

    <!-- 5 shop -->
    <section id="shop" class="shop">
      <h2>Shop the teas</h2>
      <div class="filters">… chips …</div>
      <input type="search" id="search" …>
      <select id="sort" …>…</select>
      <div class="grid" id="grid"></div>
    </section>

    <!-- 6 delivery check -->
    <section class="delivery">…</section>

    <!-- 7 reviews -->
    <section class="reviews"><h2>What our customers say</h2>…</section>

    <!-- 8 FAQ -->
    <section id="faq" class="faq"><h2>Frequently asked questions</h2>…</section>

    <!-- 9 newsletter (inline) -->
    <section class="newsletter">…</section>
  </main>

  <!-- 10 footer -->
  <footer id="contact">…legal unchanged…</footer>

  <!-- cart drawer, quick view, toast (aria-live) -->
  <aside id="cart" aria-hidden="true">…</aside>
  <dialog id="quickview">…</dialog>
  <div id="toast" role="status" aria-live="polite"></div>

  <!-- checkout contract — DO NOT RENAME -->
  <form id="checkout-form"
        action="https://mistvale.example/cart/checkout"
        method="POST" hidden>
    <input type="hidden" name="items">
    <input type="hidden" name="coupon">
  </form>
</body>
```