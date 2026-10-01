# Mistvale Tea Co. storefront

Live site: https://mistvale-12go.onrender.com

A premium tea storefront for Mistvale, built as a static front-end with a clean product catalog, shopping cart, promotional messaging, and brand-aligned styling.

## Overview

This project is a polished Mistvale storefront that follows the approved brand direction and business rules for a small-batch tea shop. The page is designed to feel trustworthy, premium, and easy to shop on both desktop and mobile.

## Project structure

- `index.html` – main storefront page
- `style.css` – stylesheet for the full storefront design
- `script.js` – product data, rendering, cart logic, search/filter/sort, coupon logic, quick view, and checkout form handling
- `404.html` – branded not-found page for missing routes
- `images/` – brand artwork and product packaging SVGs

## Features

- Responsive storefront layout
- Tea catalog with filters, search, and sorting
- Quick-view product modal
- Cart drawer with quantity controls and totals
- Coupon handling with `WELCOME10` rules
- Shipping threshold logic and checkout form integration
- Delivery pincode validation section
- FAQ and structured data setup
- Empty-state handling for no results
- Branded 404 page

## Local preview

From the project folder, run:

```bash
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/index.html
```

## Notes

The storefront follows the Mistvale brand direction and retains the required contract for checkout submission:

- `action="https://mistvale.example/cart/checkout"`
- hidden fields named `items` and `coupon`

The project uses plain HTML, CSS, and JavaScript without frameworks or libraries.
# Developer Assessment — Rescue the Mistvale tea store

Thanks for taking the time to do this.

At MeroxIO we build online stores, and **everyone on the team uses AI tools every day**,
for code and for images. This task is not about writing everything by hand. It is about
whether you can **use AI to get real work done well**: giving it the right context,
checking what it produces, catching its mistakes, and delivering something you would put
your name on.

**Use any AI tools you like**, for code (ChatGPT, Claude, Gemini, Copilot, Cursor…) and
for images (Midjourney, DALL·E / ChatGPT images, Gemini / Imagen, Adobe Firefly, Ideogram,
Leonardo, Canva AI…). We expect you to use them.

---

## The scenario

**Mistvale Tea Co.** is a small tea brand from the Darjeeling hills that sells online. A
freelancer built them a one-page store. It technically "works", but:

- it **looks** amateur, and customers do not trust it
- **shopping is frustrating**, and people give up before checking out
- the **images** are placeholders, heavy and inconsistent
- it is full of **bugs**; the cart even gets the maths wrong
- it is slow, hard to use with a keyboard or screen reader, and invisible to Google

Your job: **turn it into a store Mistvale would be proud to launch.**

| File | What it is |
|---|---|
| `index.html` | The whole store: HTML, CSS and JavaScript in one file |
| `images/` | Logo, hero banner and product images (all placeholders) |
| `BRAND.md` | Mistvale's brand basics and company facts |

Open `index.html` in a browser (Chrome is best). No server or build step is needed.

---

## What to do

### 1. Fix the bugs, and make the store follow the business rules
Use every part of the page as a shopper would: filters, sort, search, quick view, add to
cart, quantities, remove, coupon, free-shipping bar, delivery check, newsletter, countdown.
**Many bugs only show up when you actually use it**, for example with an expensive product,
a second click, typing quickly, a first visit with an empty browser, or after using the
cart for a while. Some bugs only appear when two of them interact.

The store must follow these **business rules** (the current code breaks several of them):

| # | Rule |
|---|---|
| R1 | Prices in `PRODUCTS` are per pack and include GST. Always calculate from `PRODUCTS`, never from text on the page. |
| R2 | A shopper can buy at most **5** of any one product, and never more than its `stock`. |
| R3 | Coupon **WELCOME10**: 10% off **eligible items**, capped at **₹150**. The cart subtotal must be **at least ₹399**. **Gift boxes (category "Gifts") are not eligible.** Codes are case-insensitive. One coupon per order, and applying it twice changes nothing. |
| R4 | Shipping is **₹49**. It is free when the amount **after the discount** reaches the free-shipping threshold. |
| R5 | Round only the final total to the nearest rupee. Show every amount with ₹ and Indian digit grouping (₹1,23,456). |
| R6 | Sold-out products can never be added to the cart and always appear **last** in every sort order. |
| R7 | Search, category filter and sort work **together**: changing one keeps the others. Results must always match what is currently typed in the search box. |
| R8 | The delivery check uses `API.checkPincode()` and shows the delivery time in days, "not serviceable", or a helpful error for an invalid pincode. It must never get stuck on "Checking…". |

### 2. Improve the design (this is scored strictly)
Make it look like a modern, trustworthy premium tea brand, following the **design rules in
`BRAND.md`**, which are stricter than a style guide: spacing and type scale, colours,
button states, motion, required page sections and SEO.

**We can tell a single-prompt design from a crafted one.** A store that follows the brand
guide closely scores higher than a generic AI template. That means consistent spacing,
refined hover and focus states, subtle purposeful animation, a clear CTA hierarchy, a real
FAQ with FAQ structured data, and complete SEO and schema.

### 3. Improve the shopping experience (UX)
Think like a customer on a phone. How do they find a tea, understand it, add it, see that
it was added, change their cart and reach checkout without friction or annoyance?

### 4. Create proper images with AI
Replace the placeholders:
- **8 product images**: consistent style, same shape, and matching each product's
  description
- **the hero banner**
- **a clean logo** for "Mistvale Tea Co." (SVG preferred)

The images must be optimised for the web. Log your image prompts in `PROMPTS.md` too.

### 5. The technical basics
Responsive from 360px to desktop with no sideways scrolling; accessible (keyboard, screen
reader, contrast); fast (remove what is not needed); SEO-ready (title, description,
headings, Open Graph, JSON-LD for `Organization`, the products and the FAQ).

### 6. Bonus: extend the store (welcome, not required)
If you have time left, **add features a real tea shop would want**, for example:
- size options (100 g / 250 g)
- recently viewed teas
- a saved wishlist
- filters and sort kept in the URL, so links can be shared
- a product detail view
- "you may also like" suggestions
- a gift message at checkout
- anything else you think customers need

Extensions earn bonus points. Fixing the brief comes first, and every extra must follow the
same constraints. List your extras in NOTES.md.

---

## Constraints — read these carefully

These are real constraints. Breaking them counts against you even if the page looks
better.

1. **One HTML file.** All CSS and JS stay inside `index.html`, with no separate `.css`
   or `.js` files. Images go in `images/`.
2. **No frameworks or libraries.** No jQuery, Tailwind, Bootstrap, React, animate.css,
   Font Awesome, etc. Plain HTML, CSS and JavaScript. **Google Fonts is allowed.**
3. **Product data comes from the store backend.** Inside `PRODUCTS`, do not change any
   `id`, `name` or `price`. You may change how products are displayed.
4. **The checkout form is a contract.** Keep `<form id="checkout-form">` with
   `action="https://mistvale.example/cart/checkout"`, `method="POST"`, and the two field
   names `items` and `coupon`. When the shopper clicks Checkout, fill `items` with a JSON
   array like `[{"id":101,"qty":2}]` and `coupon` with the applied code (or empty), then
   submit the form. (The URL does not exist, so seeing an error page after submitting is
   expected.)
5. **Do not change the `API` object** (between `API START` and `API END`). It simulates our
   store backend, including its response times. Fix how the page *uses* it, not the API
   itself.
6. **Do not change the legal text** in the footer. It is approved wording; leave it
   exactly as it is.
7. **Only use facts you were given.** Company details are in `BRAND.md`, and product
   details are in `PRODUCTS`. Do not invent reviews, ratings, awards, press mentions or
   numbers, and do not let your AI invent them.
8. If something on the page is **contradictory or looks untrue and you cannot know the
   answer**, make a sensible temporary choice and **write it down in NOTES.md** as a
   question for us. Do not guess silently.

---

## What to submit

One `.zip` (max 20 MB):

```
yourname-mistvale.zip
├── index.html          ← your improved store (all CSS + JS inside)
├── images/             ← your new images
├── NOTES.md            ← REQUIRED: your notes
└── PROMPTS.md          ← your AI prompt log (or type your prompts into the form instead)
```

On the portal you also upload your resume and, if your tools support it, **share links to
your AI chats**.

### Your prompt log: two ways to submit it

Log **every** prompt you used, for code **and** images, in order and **exactly as you
typed it**. Choose one of these:

- **A. In the submission form (easiest):** click **+ Add prompt** for each one and fill in
  the tool, type, prompt, outcome and why. The form saves a draft in your browser as you
  go, so you can fill it in while you work.
- **B. As a `PROMPTS.md` file** in your zip, in the format below.

If you do both, we read the form.

### PROMPTS.md format

Log **every** prompt in order, **exactly as you typed it**. Do not tidy them up. We want
to see how you really work, including dead ends.

```markdown
## Prompt 1
- Tool: ChatGPT (GPT-5)            ← or Midjourney v7, Firefly, Claude, etc.
- Type: code | image | other
- Prompt:
  > (the exact prompt)
- Outcome: accepted | modified | rejected
- Why: (one or two lines: what was good or wrong, what you changed)
```

### NOTES.md format

About one page:

1. **What I changed**: bugs, design, UX, images, technical.
2. **What the AI got wrong**: specific examples of wrong, risky or made-up output, and
   how you caught them. (Every AI makes mistakes on this task, so "nothing" is not a
   believable answer.)
3. **Images**: which tool made each image, and what you did afterwards (crop, resize,
   compress, convert).
4. **How I tested it**: browsers, phone sizes, keyboard, Lighthouse, etc.
5. **Questions for the team**: anything you could not decide yourself.
6. **Time spent**: an honest estimate in hours.
7. **Extra features I added** (if any).
8. **With more time I would…**

Optional but welcome: `before.png` and `after.png` screenshots.

---

## How we judge it

About 64% is **what you deliver**:
- bugs fixed and business rules followed
- design quality against the brand rules
- shopping experience
- images
- technical quality
- constraints
- any extensions (bonus)

About 36% is **how you worked with AI**: your prompts, how you checked the output, what
you caught, and how clearly and honestly you explain it.

What scores highest:
- **A crafted design beats a one-prompt design.** Close adherence to BRAND.md, polished
  hover, focus and motion states, clear CTAs, an FAQ with FAQ schema and complete SEO all
  score higher.
- **Tested beats flashy.** A clean, well-tested store with an honest prompt log beats a
  flashy one you clearly did not check.
- **Extensions are a bonus,** never a replacement for the brief.

Expected effort: **about 4 hours.** Please do not spend more than 6. You will not fix
everything, and nobody does. Prioritise like you would for a real client.

If we like your work, the next step is a short call where you walk us through a few
changes and make one small live change with your AI tool while sharing your screen.

Good luck!
— The MeroxIO team
