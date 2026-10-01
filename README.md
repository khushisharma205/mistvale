# Mistvale Tea Co. storefront

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
