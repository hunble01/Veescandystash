# Vee’s Candy Stash — website

Mobile-first storefront for Vee’s Candy Stash, a small Ontario business selling candy bags, party favours and custom event orders. Tagline: “Every Sweet Tooth Needs a Stash.”

The full business brief is imported below. It is the source of truth for products, brand, pages and build order:

@docs/Vees_Candy_Stash_Claude_Code_Handoff.md

## Never invent

Until the owner supplies the real thing, use clearly labelled placeholders kept in config/data files, never hard-coded in components:

- The logo. Use the supplied file; never draw, generate or recreate one.
- Prices, bag weights, candy-pick allowances and stock levels.
- Reviews, testimonials, ratings and “best seller” badges.
- Delivery areas, turnaround and lead times, deposits, refund and cancellation policies.
- Ingredient, allergen, “allergen-free” or any other food-safety or regulatory claims.
- Contact details, address and social handles.

## Brand

- Warm orange and pink, with teal as an accent, on white/cream. Never all-pink, never rainbow.
- Playful retro but polished: rounded shapes, generous white space, real photos over decoration.
- Copy is warm, short and clear, in Canadian spelling to match the brief (colour, favour, favourites).

## Design reference

Reference site(s): [PASTE URL(S) HERE]
Screenshots: `docs/reference/` (look at these before any design work)

Use the reference for layout, section order, spacing, navigation, interaction patterns and overall feel. Do not copy its text, images, logo or code, and do not adopt its colours or fonts; Vee’s palette and logo always win. Where the reference and the brief disagree, follow the brief. If no reference has been added yet, ask for one before starting design work.

## Platform (not decided)

The e-commerce platform, hosting and payment provider are still open. Your first plan must recommend an approach plus the main alternatives, comparing how the owner would edit products and handle orders day to day, monthly cost, and build effort. Do not write code until that plan is approved.

## How to work

1. Plan first: sitemap, components, design tokens, product schema and phases (brief §19). Wait for approval.
2. Build in the brief’s phases (§18). Mobile-first: check every page at phone width.
3. Keep `docs/decisions.md` current with what has been decided and what is still open before live orders can launch.
