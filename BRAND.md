# Mistvale Tea Co. — brand and design rules

These are **rules, not suggestions**. Designs are scored on how closely they follow them.
Within the rules, the creative decisions are yours.

## 1. Company facts — the only company facts you may use

| | |
|---|---|
| Name | **Mistvale Tea Co.** (short form: **Mistvale**) |
| Tagline | *Hill-grown tea, honestly made.* |
| Founded | 2019 |
| Address | 14 Hill Cart Road, Siliguri, West Bengal 734001, India |
| Phone | +91 90000 12345 |
| Email | hello@mistvale.example |
| Website | https://mistvale.example |
| Instagram | https://instagram.com/mistvale.example |

Spelling: **Mistvale**, with only the M capitalised. Never "MistVale", "Mist Vale" or
"MISTVALE" in running text.

Product facts (names, prices, stock, ratings) live in `PRODUCTS` in `index.html`. Only
two products have real ratings.

### Approved FAQ answers (use these for the FAQ section and FAQPage schema)

| Question | Answer |
|---|---|
| How long does delivery take? | 2 to 5 working days depending on your pincode. Use the delivery check to see yours. |
| Can I return tea? | Unopened packs can be returned within 7 days of delivery. Opened tea cannot be returned for hygiene reasons. |
| How should I store my tea? | In an airtight container, away from light, heat and strong smells. It tastes best within 6 months of opening. |
| Is Chamomile & Tulsi caffeine-free? | Yes, it is a caffeine-free herbal blend. |
| Do you ship outside India? | Not yet. We currently deliver within India only. |
| Can I send tea as a gift? | Yes. The Tea Lover's Sampler comes in a wooden gift box with a brewing guide. |

## 2. Personality

Calm, earthy, premium but warm, like a quiet tea garden at dawn, not a discount
supermarket. Customers are 25–45, urban Indian, buying for themselves or as gifts, and
**mostly on phones**.

## 3. Colour

| Token | Hex | Use |
|---|---|---|
| Tea green | `#1f3d2b` | Primary: header or footer, primary buttons, headings |
| Leaf | `#4f7942` | Secondary accents, success states |
| Cream | `#f6f1e7` | Main page background |
| Parchment | `#ebe2cf` | Cards, alternate sections |
| Saffron | `#d9962b` | **Sparingly**: sale badges, focus rings, one accent per view |
| Ink | `#1b1b1b` | Body text |
| Error | `#b3261e` | Error messages |

- Define these as **CSS custom properties** and use them everywhere; don't scatter hex values.
- No other colours except tints and shades of these. No neon, hot pink, purple or
  gradients of unrelated colours.
- Text must meet **WCAG AA contrast** (4.5:1 for body text).

## 4. Typography

- Headings: **Fraunces** or **Playfair Display**. Body: **Inter**, **DM Sans** or
  **Manrope**. **Exactly two families**, loaded with one Google Fonts `<link>` using
  `display=swap`.
- Type scale: body **16px** (never below 15px), small text 14px (never below 13px), h3
  20–24px, h2 28–40px, h1 40–64px (use `clamp()` so it scales on phones).
- Headings in sentence case. No all-caps sentences. No text over busy images without an
  overlay.

## 5. Spacing and layout

- Spacing scale in multiples of **8px** (4px allowed for tight gaps): 8, 16, 24, 32, 48, 64.
- Content max-width **1200px**, with 16px side padding on phones.
- Sections: 48px vertical padding on phones, 64–96px on desktop.
- Product grid: **2 columns on phones**, 3–4 on desktop; all cards the same height.

## 6. Components and states

- **Buttons:** one **primary** style (tea green) and one **secondary** style (outline). At
  most one primary button per view. At least 44px tall. Every button has **hover,
  focus-visible, active and disabled** states.
- **Links and cards:** visible hover feedback, such as a subtle lift, shadow or underline.
- **Corners:** one radius for the whole site (for example 8px or 12px). Pills are allowed
  only for filter chips and badges.
- **Icons:** inline SVG with a consistent stroke width. No icon fonts.
- **Forms:** visible labels (placeholders are not labels), inline error messages and a
  clear success state.

## 7. Motion

- Purposeful and subtle: hover and focus transitions of **150–300ms** with `ease` or
  `ease-out`, on specific properties (never `transition: all`).
- Allowed: fades, small lifts (≤ 4px), drawer slides, a toast. Not allowed: blinking,
  bouncing, rotating, marquees, or animation that starts on its own and loops.
- Respect `prefers-reduced-motion`.

## 8. Required page sections, in this order

1. Announcement strip (optional; one short line)
2. Header: logo, navigation, search access, and a cart button with an item count
3. Hero: one clear value proposition, **one primary CTA** ("Shop the teas") and at most one
   secondary CTA, plus an image
4. Trust strip: 3–4 short promises from the facts above, e.g. returns and GST
5. Shop: filters, search and sort, then the product grid
6. Delivery check
7. Reviews: the three quotes on the page, with no invented ratings or counts
8. FAQ: from the approved answers above, as an accessible accordion
9. Newsletter sign-up, inline (not a pop-up that appears on its own)
10. Footer: contact facts, legal text (unchanged) and copyright

## 9. SEO and structured data

- Unique `<title>` (50–60 characters) and meta description (120–160 characters), one
  `<h1>`, logical h2/h3 order, canonical link, Open Graph and Twitter card tags.
- JSON-LD: **Organization or OnlineStore** (facts above only), **Product** for each tea
  (price in INR, availability from stock, rating only where it exists) and **FAQPage** from
  the approved answers.
- Descriptive `alt` text on every meaningful image.

## 10. Imagery

- Natural light, soft shadows, calm backgrounds in cream, wood, linen or stone
- Product images: the **same framing and aspect ratio** for all 8 (square, 1:1,
  recommended), with the pack or tin plus a hint of the tea itself
- No text baked into images (except the logo), and no fake awards or badges
- Logo: simple and recognisable at 32px; the word "Mistvale" with a small mark (a leaf,
  a hill or mist)
- Web-ready: WebP or AVIF, product images under 150 KB each, hero under 250 KB

## 11. Voice

Warm, specific and honest. "Malty Assam leaves for your morning cup", not "BEST TEA IN THE
WORLD!!!". No exclamation marks in headings, no all-caps shouting, and no claims we cannot
prove.
