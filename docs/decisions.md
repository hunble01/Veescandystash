# Decisions log

Last updated: 2026-10-26

## Decided

| Date | Decision | Notes |
| --- | --- | --- |
| 2026-10-25 | **Platform: Option B — Next.js + Stripe + Sanity.** | Chosen by the owner because it is cheaper (no Shopify monthly fee). |
| 2026-10-25 | Framework: Next.js 16.4.1 (App Router, TypeScript, Tailwind CSS v4). | Pinned to 16.4.1: earlier 16.x versions have a critical security advisory. |
| 2026-10-25 | Reference site: https://lksucre.com/ (layout and feel only). | Never copy its text, images, colours or code. |
| 2026-10-26 | Design direction approved: bold retro candy-shop style (sunbursts, ink outlines, candy-bag cards, sticker tiles, ticker ribbons). | Fonts (Shrikhand + Bricolage Grotesque) and colours remain placeholders until brand fonts/colours are confirmed. |
| 2026-10-25 | Logo, colours, fonts: placeholders until the owner supplies them. | Tokens live in `src/app/globals.css`; logo slot is `site.logo` in `src/config/site.ts`. |

## What Option B means day to day

- **Payments:** Stripe Checkout (cards, Apple Pay, Google Pay). Stripe sends receipts. The Stripe Dashboard app on iOS/Android shows payments and lets Vee issue refunds.
- **Products:** Vee edits products, prices, photos and seasonal on/off switches in Sanity Studio (a web editor, also usable on a phone). Sanity is set up in Phase 2.
- **Orders:** there is no Shopify-style order inbox, so we build a simple one: every paid order emails Vee and is saved where she can mark it packed or picked up.
- **Tax:** HST is set as a fixed tax rate in Stripe (free), or Stripe Tax for an extra per-transaction fee if shipping goes beyond Ontario. **Confirm the rate and registration with an accountant.**
- **TikTok live orders feed:** still possible; it uses a Stripe webhook instead of a Shopify one.

## Expected running costs (check current pricing at signup)

| Item | Cost |
| --- | --- |
| Stripe | No monthly fee; a percentage plus a fixed fee per card payment |
| Sanity | Free plan is enough for a small catalogue |
| Hosting | **Netlify free plan recommended.** Vercel’s free Hobby plan is for non-commercial use only, so a shop would need Vercel Pro (about US$20/month). |
| Domain | About $15–30 per year |

## Still open before live orders can launch

**Owner to supply**
- [ ] Logo files (SVG or PNG), plus final brand colours and fonts
- [ ] Product photos
- [ ] Bag sizes: weight in grams, candy-pick allowance and price for each size
- [ ] Candy list with ingredients and allergens for each
- [ ] TikTok / Facebook handles (Instagram confirmed 2026-10-31: @VeesCandyStash; phone confirmed 2026-10-29: 647-713-2718; email confirmed 2026-10-31: contact@veescandystash.ca)
- [ ] About Vee story (written or approved by Vee)
- [ ] FAQ answers

**Policies to set**
- [ ] Pickup and/or delivery area, delivery fees, whether we ship (2026-10-29: pickup in Vaughan, ON; delivery worldwide. Still open: delivery/shipping fees, and checkout currently only accepts Canadian addresses)
- [x] Handling time for regular orders: about 3 business days in the GTA (Vee, 2026-10-29). Outside the GTA still to confirm.
- [ ] Custom orders: minimum quantity (5 bags, Vee 2026-10-29), lead time (10 days depending on quantity, Vee 2026-10-29), cancellation (full refund within 48 h of ordering, 50% after, none 5 days or less before the event; Vee 2026-10-29), deposit, payment timing, change window, rush fee
- [ ] Cancellation and refund policy
- [x] Whether candy may vary slightly by stock: yes, similar candy may be swapped in if something runs out (Vee, 2026-10-29; in the FAQ)
- [ ] HST registration and tax setup

**Accounts to create (Phase 2)**: each one's keys go in `.env.local` (see `.env.example`)
- [x] Sanity project `dub9zh7i` connected 2026-10-26, with read and write tokens in `.env.local`. **Replaced 2026-11-11 by `05otdw3g` (Vee’s own account, dataset private, all content copied).** Draft content imported (5 products, 8 occasions, 4 holiday collections, 12 FAQs).
  - [ ] Set the `production` dataset to **Private** (it was still public on 2026-10-26).
  - [ ] Before launch: replace both tokens with new ones (the originals were shared in chat).
  - [ ] At launch: add the live site address under API → CORS origins, with "Allow credentials" ticked.
- [ ] Stripe account (business details, bank account for payouts) → secret key, webhook secret, optional HST tax rate id
- [ ] Resend (email notifications to Vee) → API key and the email address notifications go to
- [ ] Netlify account and domain name

**Switches to flip when ready to sell** (`src/config/site.ts`)
- [x] `fulfilment.methods`: pickup + delivery (2026-10-29)
- [ ] `checkoutEnabled: true`
- [ ] Prices entered for every size you sell (in Sanity)

**Compliance**
- [ ] Ontario public health, food handling, labelling and home-business rules checked before taking commercial orders

## Build status

- **Phase 1 — design system + clickable storefront:** built. Home, Shop, product pages, Occasions (+ each occasion), Build Your Stash preview, Custom Orders form (validates, does not send yet), About, FAQ, Contact, Cart placeholder.
- **Phase 2 — commerce and enquiries:** code built 2026-10-26, waiting on accounts to test end to end.
  - Cart (saved in the shopper’s browser), header badge, cart page.
  - Stripe Checkout via `/api/checkout`: prices are re-read on the server, never trusted from the browser.
  - `/api/stripe/webhook` saves each paid order to Sanity and emails Vee, and safely ignores Stripe retries.
  - Sanity Studio at `/studio`: inbox (new orders, all orders, custom requests, messages) plus the catalogue (products, candy options, occasions, holiday collections, FAQ).
  - Custom-order and contact forms save to Sanity and email Vee, with a spam trap.
  - Until accounts are connected, the site uses the draft data files, and forms say plainly that nothing was sent.
  - Checkout opens only when Stripe is connected, a fulfilment method is set and `checkoutEnabled` is on.
- **Tech notes:**
  - React is 19.3.1 (required by Sanity).
  - `.npmrc` sets `legacy-peer-deps` to work around an npm 10 install bug.
  - Sanity 6 officially needs **Node 22.12+**. The site builds and runs on this computer’s Node 20.17, but Sanity’s command-line tools refuse to run on it. Set Netlify to Node 22 (`NODE_VERSION=22`) and consider upgrading Node locally.
  - `npm audit` reports issues only inside Sanity’s developer command-line tools, which don’t ship to the website. Recheck before launch.
- **Phase 3 — interactive Build Your Stash stepper.**
- **Phase 4 — polish and launch.**

## Where placeholder content lives

| What | File |
| --- | --- |
| Contact, socials, fulfilment, custom-order rules, announcement bar, logo | `src/config/site.ts` |
| Products and sizes | `src/data/products.ts` → Sanity once connected |
| Occasions and seasonal collections | `src/data/occasions.ts` → Sanity once connected |
| FAQ | `src/data/faq.ts` → Sanity once connected |
| Colours and fonts | `src/app/globals.css`, `src/app/layout.tsx` |

- **2026-10-27 — Build Your Stash sizes set by Vee:** ½ lb, 1 lb, 2 lb and 5 lb, each with its own bag photo. Customers pick a size, then choose any candies they like (no pick limit unless one is set per size in the Studio). Still open: price for each size, real bag photos, and the actual candy list (the five candies in the Studio are examples from the brief).
- **2026-10-27 — Menu:** Shop removed from the menu bar. The cart is a single "Cart" button (with item count) at the right of the header, replacing the bag icon. The shop page still exists and is linked from the home page's "Shop Candy Bags" button.
- **2026-10-27 — Build Your Stash shows bag sizes and candy options only** (Vee's request): no summary box, quantity or Add to cart on that page. Open: how customers will order a built bag. The cart and checkout can still carry candy picks (`candies` on cart lines), so an Add to cart button can be put back when wanted.
- **2026-10-27 — Holiday section (Occasions page):** white band with red and green snowflakes, no moving ticker ribbons and no "peek at holidays" jump button. Each holiday card has its own colour: Halloween orange, Christmas green, New Year's gold, Valentine's Day red, Easter pink; any other holiday defaults to teal. Red, green and gold are holiday-only colours (set per holiday in the Studio as "Card colour"). New Year's added as a "coming soon" holiday; its description and ideas are draft copy for Vee to confirm.
- **2026-10-27 — Occasions:** Weddings removed; Graduations added in its place (same spot, shown on the home page too). Graduation's tagline, description and ideas are draft copy for Vee to confirm in the Studio (🎈 Occasions).
- **2026-10-27 — Occasions grid:** the Holidays tile is hidden from the grid on the Occasions page, because the holiday band below covers it. The Holidays tile still shows on the home page, and `/occasions/holidays` still works. Open: whether Vee also wants it off the home page (asked, not yet answered).
- **2026-10-27 — Home hero buttons removed** (Vee's request): no "Shop Candy Bags" or "Create Your Stash" buttons under the headline. The shop page (`/shop`) is now reached only from the About page, the empty cart and the order-confirmation page, since it's no longer in the menu either.
- **2026-10-27 — Home "Shop by occasion" section removed** (Vee's request), including its tiles and "View all occasions" button; occasions are reached from the Occasions menu item. The Studio's "Show on home page" setting on occasions now has no effect.
- **2026-10-27 — Footer recoloured** (Vee's request): cream background instead of dark brown, with orange writing on every page. The small text uses the darker orange so it stays readable on cream. The big word along the bottom now reads "Vee’s Candy Stash" (taken from the shop name in `src/config/site.ts`) instead of "Stash".
- **2026-10-29 — Build Your Stash pick limits set by Vee:** 0.5 lb bag = 6 picks, 1 lb = 10, 2 lb = 12, 5 lb = as many as they like (the site caps one bag at 100 picks as a safety limit). The same candy can fill several picks (e.g. six of one candy, or three and three). Set in the Studio under each size's "Candy picks allowed". The ½ lb size is now labelled "0.5 lb".
- **2026-10-29 — Build Your Stash gets a "Your bag" tray and Add to cart** (Vee's request; replaces the 2026-10-27 "no cart on this page" decision). The tray at the top lists the candies picked so far with counts, − / + buttons and "Empty my bag", then Add to cart. Once a candy is picked, a bar also pops up at the bottom of the screen with the pick count and its own Add to cart button. The buttons read "Online ordering coming soon" until prices are set and checkout is open. Picking a bag puts it in the page address (`?bag=…`), so clicking Build Your Stash in the menu always goes back to the bag screen and starts over; "← Change bag" keeps the picks (trimming to fit a smaller bag).
- **2026-10-29 — About page story** written from Vee's words: she always keeps a candy stash on hand as a treat at every time of day, and becoming a mom in 2026 made a sweet pick-me-up matter even more. Vee to read and tweak the wording.
- **2026-10-29 — About page "Come join in on more fun!"** is now a big pink band of its own (Vee asked for the whole section pink) inside a moving orange-and-white candy-stripe frame, with bouncing arrows pointing at the buttons ("Tap to follow!" on phones) below the story, with floating candies, a "Psst! Follow along" sticker, a large heading and big Instagram/TikTok buttons (shown as "coming soon" until Vee's handles are added in `src/config/site.ts`). The line under the heading is draft copy for Vee to confirm.
- **2026-10-29 — "Join the fun" band reshaped and added to the home page** (Vee's request): the striped frame is now a tilted badge with bumpy scalloped edges, like a candy sticker, around a wobbly-cornered pink card. The buttons carry Instagram and TikTok logos, and bolder looping arrows point straight at them. The same band (`src/components/JoinTheFun.tsx`) now also appears on the home page, right under "How it works", so editing it changes both pages.
- **2026-10-30 — Candy list set by Vee: 21 candies** replace the 5 examples from the brief (Studio → 🍭 Candy options, in her order): Allan Candy Sour Watermelon, Kervan Gummi Peach Rings, Albanese Berry Red Raspberries, Albanese Strawberry, Gustaf's Strawberry Lace, McCormick's Sour Green Apple, Albanese Rainforest Gummi Frogs, Koala Pop Bottle Cola Bottles, Gummy Zone Sour Cherry Cola, Koala Sour Juicy Blues, Koala Sour Juicy Berries, Kervan Blue Raspberry Rings, Disco Crunchy Asteroids, Strawberry Bon Bons, Gustaf's Blue Raspberry Lace, Huer Bubblegum Bottles Gummies, Kervan Gummi Worms, Albanese Sour Gummi Poppers, Koala Cream Soda Float, Kervan Apple Rings Gummies, CCC Sweet Peach Slices. Still open: photos; ingredients/allergens for each; stock. The sweet/sour groupings were guessed from the names for Vee to check.
- **2026-10-30 — Candy filter is All · Sweet · Sour only** (Vee's request). The Studio's candy Category offers just Sweet and Sour, and the builder never shows an Other or Chocolate button.
- **2026-10-30 — Footer made smaller** (Vee's request): the pink ticker ribbon stays. Under it: the shop name (once, smaller) and slogan, then the menu links side by side in rows, the phone number and the copyright line. The giant "Vee’s Candy Stash" along the bottom (2026-10-27) and the separate Explore/Contact columns are gone. Then (same day) made a little bigger and recoloured: bright orange background with white writing (thin dark shadow on the text so it stays readable), replacing the 2026-10-27 cream-with-orange-writing footer.
- **2026-10-30 — "Join the fun" redesigned** (Vee didn't like the boxy look): now a full-width light-pink band (`pink-light`, #f7a8c6) with wavy, icing-like edges top and bottom, heading in all capitals, "Come join in on more" in orange and "fun!" in teal (both with a dark shadow), candies scattered over it, and the arrows and Instagram/TikTok buttons as before. Replaces the striped scalloped badge. Same on the About page and the home page.
- **2026-10-30 — Bag-size pictures: cute drawn bags until real photos exist** (Vee's request). Each Build Your Stash size card shows a drawn white candy bag with a happy face, a crimped pink top and candies peeking out, bigger for each size (`src/components/BagIllustration.tsx`). Adding a photo to a size in the Studio replaces the drawing for that size. Still open: real bag photos.
- **2026-10-27 — Customer accounts (Clerk), chosen by Vee.** Accounts are optional, so guests can still order.
  - **Pages:** `/sign-in` and `/sign-up` use Clerk's ready-made forms, including "Continue with Google". `/account` (login required) shows the customer's:
    - orders, matched by their account or any verified email, so earlier guest orders show up too
    - custom requests
    - saved favourites
  - **Header:** "Log in" / "My account" on desktop; on phones it's in the menu.
  - **Favourites:** a heart button on each shop product page. Favourites are stored privately in Sanity.
  - **Faster checkout:** logged-in customers get their email pre-filled at Stripe checkout and on the custom order form. Orders and requests also record the account they came from.
  - **Order status:** customers see the status Vee sets in the Studio (Received, Packed, Ready, Done…).
  - **Not done yet:** saving built candy mixes from Build Your Stash. Vee wanted that page to show bags and candies only, so this needs her OK first.
  - **To launch:**
    1. Create a free Clerk account and add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
    2. Turn on Google under User & authentication → Social connections. Production needs your own Google Cloud OAuth keys, which Clerk walks you through.
    3. Add the live domain in Clerk.
    4. Add a privacy note about accounts.
    5. Clerk's free plan covers 10,000 monthly users.
  - **2026-11-02:** login pages checked in a browser. `/sign-in` and `/sign-up` show Clerk's box (Google + email), and `/account` sends logged-out visitors to the login page. Fixed loading errors on the login pages (header, scroll animations and the Clerk box now load inside Suspense). The login box now reads "Log in to Vee’s Candy Stash" instead of Clerk's default "My Application". Still to do: Vee creates a real test account and checks My account.
  - **2026-11-02 — Account area rebuilt as a full customer dashboard** (Vee asked for "world class"). A sidebar menu on computers becomes a swipeable tab row on phones. Pages:
    - **Overview** (`/account`): greeting, counts (orders, open requests, favourites, addresses), latest order with a progress tracker, open requests, recent orders, quick links, favourites.
    - **Orders** (`/account/orders`, split into in progress and past) and an **order page** for each order (`/account/orders/VCS-…`). The order page has a step tracker (Received → Packed → Ready for pickup / Out for delivery → Picked up / Delivered), items, subtotal, tax, delivery and total, the pickup/delivery address and contact details, plus buttons for **Order again** (adds the same bags to the cart at today's prices and names anything no longer available), **Print receipt** and **Contact Vee about this order**.
    - **Custom requests**, each with a detail page (`/account/requests/…`) showing everything the customer sent, a tracker (Received → Quote & details → Booked) and a "what happens next" line.
    - **Favourites**, with Remove buttons.
    - **Addresses**: an address book with add, edit, delete and a default address, checked for Canadian postal codes. Saved privately in Sanity as `addresses.<user id>`. Not yet used to fill in checkout; that can be added once Stripe is connected.
    - **Profile & security**: Clerk's built-in manager (name, photo, emails, password, Google connection, logged-in devices, delete account), plus a **Download my data** button (`/api/account/export`, for privacy rules).
    - A **Need a hand?** box (email, phone, FAQ) and Log out on every account page.
  - To make "Order again" work, new orders now save which product, size and builder candies were bought (checkout → Stripe product metadata → webhook → hidden fields on the order).
  - Checked with a temporary test customer and sample orders on desktop and phone width; all test data was deleted afterwards. Vee still needs to try it with her own login.
  - **2026-10-29:** temporary Clerk dev keys added with `npx clerk@latest init` (newer Clerk no longer runs without keys). These are for local testing only; step 1 above is still needed to launch.
- **2026-10-29 — Home "How it works" replaced** (Vee's request): three link cards under "Three sweet options / How it works": Build Your Stash, Occasion Bags, Custom Orders. Hero subtitle removed; headline now orange with "Stash" in pink and no full stop.
- **2026-10-29 — First three FAQ answers written by Vee's choices** (saved in Sanity and `src/data/faq.ts`): ordering is online (shop → cart → checkout), sizes are 0.5/1/2/5 lb (smaller on request for occasions), customers can pick any in-stock candy and similar candy may be swapped in when something runs out, pickup is in Vaughan and delivery is worldwide. Ordering answer has Build Your Stash / Occasions / Custom Orders / Call us buttons, plus an Email placeholder until the address is supplied. The ordering answer only becomes true once Stripe checkout is live.
- **2026-10-29 — Policies page added** (`/policies`, in the top menu; content in `src/data/policies.ts`): sections for refunds and cancellations, candy/health/allergens, and privacy. Refunds and privacy are empty ("Coming soon") until Vee writes them. Footer/menu link "FAQ & Policies" renamed to "FAQ".
- **2026-10-29 — "Mixes that suit this occasion" removed from every occasion page** (Vee's request). Occasions still keep their linked products in Sanity; they just aren't shown on the occasion pages.
- **2026-10-29 — Birthdays page:** "What we can make for you" ideas section hidden (Vee's request). Other occasions still show it.
- **2026-10-29 — "What we can make for you" ideas section removed from every occasion page** (Vee's request). Each occasion's ideas are still saved in Sanity. Occasion pages are now just the top banner (plus holiday collections on Holidays).
- **2026-10-29 — Themes + short order form on every occasion and holiday page** (Vee's request). Each occasion/holiday has "Themes we offer" (editable in the Studio under the occasion or holiday → "Themes we offer"); customers pick one (or "Something else") and fill a short form: bags (min 5), size (`site.bagSizes`), needed-by date (at least `customOrders.minNoticeDays` = 10 days out), tag message, special requests, pickup/delivery, contact. Requests land in the Studio inbox under Custom order requests, marked "Sent from: Occasion / holiday page", and email Vee. Holiday cards now open their own page at `/holidays/<slug>` (closed holidays show a note instead of the form). The full Custom Orders form is now described as being for bigger events. Theme names/descriptions other than Vee's three examples are draft copy from the brief for her to confirm; character names avoided ("Superhero red + blue", "Pretty in pink") for trademark reasons.
- **2026-10-29 — Cancellation policy (Vee):** regular orders full refund within 24 hours of ordering, no cancellation/refund after. Custom/event orders: full refund within 48 hours, 50% after, nothing 5 days or less before the event. Damaged/wrong orders: email a photo with order number and name. On the Policies page and FAQ. Still open: what happens after a damage photo (refund/replacement), time limit for reporting, and the business email address.
- **2026-10-29 — Privacy section removed from the Policies page** (Vee's request). Still needed before launch: a privacy notice (PIPEDA; the site collects names, emails, phones, addresses via forms, Clerk accounts and Stripe checkout). Draft points were offered in chat.

- **2026-10-30 Custom Orders page look:** Vee asked for it to be "simple but different from the other pages". It now has a solid teal header (no cream sunburst), the three steps shown as cards across it, "good to know" chips, and one centred form with numbered sections (1 Your event, 2 Make it yours, 3 Getting it to you, 4 Your details).
- **2026-10-30 Lighter teal:** Vee found the teal too dark. The main teal went from #1fa8a0 to #6dd3ca across the whole site; writing on teal is now dark (ink) so it stays readable. Links keep the darker teal-deep.
- **2026-10-30 Occasion/holiday themes:** Vee asked that each occasion and holiday show its themes plus a short order form, with the big custom form kept for bigger events. Already built: theme cards + short form with "Something else" and special requests on every occasion/holiday page. Themes use generic names (e.g. "Superhero red + blue", "Pretty in pink") rather than brand or character names; customers can name a character in their request.
- **2026-10-30 Custom Orders tweaks:** intro sentence on one line on computers; bigger "Custom orders" tag; the three teal chips above the form (lead time, minimum, no commitment) removed at Vee's request.
- **2026-10-30 Custom order photos + no allergen question:** customers can add up to 3 optional inspiration photos (theme, colours, invitation). The browser shrinks them (max 1600px JPEG); they are saved on the request in the Sanity inbox ("Inspiration photos") and attached to the email to Vee. Server action upload limit raised to 10 MB in next.config.ts. The "Ingredient or allergen notes" question was removed from the custom order form at Vee's request (old requests keep the field in the Studio).
- **2026-10-30 Policies + allergens:** allergen wording removed from the Policies page (section now "Our candy") and the FAQ (empty "ingredients and allergen information" question deleted, topic renamed "Candy", also in Sanity). Product pages still have an "Ingredients & allergens" line, to fill in before launch (food labelling). New "Your privacy" policy in Vee's words: info kept safe and confidential; filmed or live-packed orders are referred to only by order number.
- **2026-10-30 Smiley candies:** new SmileyCandy drawing (wrapped candy with a happy face). Small pink and orange ones float all around the Custom Orders teal header; phones show only the ones along the edges.
- **2026-10-30 Build Your Stash header:** title changed from "Pick your favourites." to a big colourful "Build Your" (orange) "Stash!" (pink), no black lettering, teal "Pick · Mix · Enjoy!" tag, pink sunburst and floating candies.
- **2026-10-30 Build Your Stash header, round 2:** Vee found the floating-candy version too much. Now calm and left-aligned like before: soft pink band, orange "Build Your" + pink "Stash!", dark-pink sentence, small smiley candy and gummy bear by the "Pick · Mix · Enjoy" line, and the smiling bag drawing in a tilted card on computers.
- **2026-10-30 Build Your Stash header, round 3:** made the pink band small and short (smaller title on one line, less padding) and removed the bag drawing from it.
- **2026-10-30 Shared colour header:** Build Your Stash and Occasions now use the same ColourHeader (src/components/ColourHeader.tsx): no background colour, left-aligned, orange title with pink highlighted words and a teal squiggle, dark-pink intro, tiny candies by the tag line, dashed line underneath. Occasions title: "Made sweeter for your celebration!"

- 2026-10-31: Business email is contact@veescandystash.ca (Vee). Set in `site.contact.email`, so it shows in the footer, Contact, About and FAQ "Email us" buttons, and in the refunds policy. Also set as `NOTIFY_EMAIL_TO`, so new requests will be emailed there once Resend is set up (still needs `RESEND_API_KEY`, and `NOTIFY_EMAIL_FROM` needs the veescandystash.ca domain verified in Resend).
- 2026-10-31: Instagram is @VeesCandyStash (Vee) → `site.social.instagram` = https://www.instagram.com/VeesCandyStash/. Shows as the Instagram button in the pink "Join the fun" band, in the footer and on the Contact page. TikTok still to come.
- 2026-10-31: Footer contact details (phone, email, Instagram) now stacked one under another, each with a small label (Call / Email / Instagram), instead of in a row (Vee).
- **2026-11-04 — Website icon from Vee's logo.** Vee supplied the logo as a phone screenshot (`docs/brand/logo-screenshot-original.png`). The circle was cropped out (`docs/brand/logo-circle.png`) and the grey shading from the Photos app lifted, then used for the browser-tab icon (`src/app/icon.png`, `favicon.ico`) and the iPhone home-screen icon (`src/app/apple-icon.png`, on cream). Temporary: replace with the original logo file (PNG with transparent background or SVG) when Vee has it. Same day: the cropped logo also replaced the "LOGO HERE" placeholder in the top bar (`public/logo.png`, set in `site.logo`).
- **2026-11-04 — Site colours matched to Vee's logo** (Vee: "match my website to my logo"). Sampled from the logo: orange #e9652c (was #f2762e), pink #e85d82 (was #ef6f9f), teal #64beba (was #6dd3ca), cream #faf1e2 (was #fff6ea); pink-light #f3a5bb and cream-deep #f5e2c6 adjusted to match. Fonts and layout unchanged. Re-check the shades against the original logo file when Vee supplies it, since these were taken from a phone screenshot.
- **2026-11-04 — Fonts matched to the logo** (Vee's request). Headings now use Lobster, the closest Google font to the logo's "Candy Stash" script. Shrikhand, which is like the chunky retro "Vee's", is kept for the scrolling ribbons, numbered circles, account initials, the 404 number and the uppercase "COME JOIN IN ON MORE FUN!" heading (Lobster doesn't work in capitals). Body text stays Bricolage Grotesque for easy reading.
- **2026-11-04 — New footer** (Vee: "way more world class"). Still orange with white writing, pink ribbon on top. Now has: a cream "Planning something sweet?" card with Request a custom order / Build your stash buttons; the logo, name, slogan and short description with round social buttons (Instagram now; TikTok/Facebook appear when added in `site.social`); link columns Shop (Build Your Stash, Occasions, Custom Orders, Cart) and Help (FAQ, Policies, Contact, My account); "Say hi" with phone, email and pickup area; a bottom bar with © line, "Made with love in Ontario, Canada", Policies, FAQ and Back to top. The card's line "Birthdays, baby showers, graduations and holidays. Tell us your idea and we'll make it sweet." is draft copy for Vee to confirm.
- **2026-11-04 — Heading font back to Shrikhand** (Vee didn't like the Lobster script). Headings look as they did before. The logo colours and the new footer stay.
- **2026-11-04 — Home hero:** the small "Candy bags + party favours · Ontario, Canada" label above the headline was removed (Vee's request).
- **2026-11-04 — Home hero:** the spinning teal "PICK ✦ PERSONALIZE ✦ ENJOY" circle next to "Stash" was removed (Vee's request).
- **2026-11-04 — Email only, no phone** (Vee). `site.contact.phone` is now null, which hides the phone in the footer, About, the FAQ "Call us" button and the account help box. The FAQ answer "How do I place an order?" in Sanity still says "Just email or call us."; change it to "Just email us." when this is published.
- **2026-11-04 — TikTok added:** @veescandystash (`site.social.tiktok` = https://www.tiktok.com/@veescandystash). It shows in the Join the fun band (no longer "coming soon"), the footer social buttons and the Contact page. The Contact page's draft note about TikTok/Facebook was removed.
- **2026-11-04 — More candy on the home page** (Vee): nine more floating candies around the headline (smiley wrapped candy, orange wrapped candy, jelly beans, orange lollipop, teal gummy bear, teal peach ring, pink sour belt, sparkle). Some only show on bigger screens to keep phones uncluttered.
- **2026-11-04 — Bag prices set by Vee:** 0.5 lb $15.99, 1 lb $26.99, 2 lb $51.99, 4 lb $85.00. The 5 lb size became **4 lb** (1814 g, any number of candy picks) in Build Your Stash and in the occasion/custom order size lists. Prices are in Sanity (Build Your Own Stash → sizes) and as a fallback in `src/data/products.ts`. FAQ "What sizes do your bags come in?" now lists the prices. **Occasion and custom orders have no fixed price:** they depend on how much candy and customization the customer wants, and Vee sends a quote after the request arrives. The occasion/holiday order form now says so above the Send button. The pre-made mixes (Signature, Sour, Sweet, Sweet + Sour) still have no prices; they aren't linked from the menu.
- **2026-11-04 — Orange a little more orange** (Vee): #e9652c → #f07020 across the site.
- **How local previews of Sanity edits work:** `SANITY_PREVIEW_DRAFTS=1` in `.env.local` (never on Netlify) makes the local site show Studio drafts. Edits are saved as drafts, checked locally, then published together with the code.
- **2026-11-04 — 4 lb bag: pick up to 20 candies** (Vee). Saved in the Sanity draft and in `src/data/products.ts`.
- **2026-11-04 — Bag size cards show the price beside the size** (e.g. "0.5 lb … $15.99"), with "Pick up to 6 candies" underneath.
- **2026-11-04 — Home page "Stash" matches the logo:** the big pink "Stash" uses Leckerli One, the closest Google font to the logo's "Stash" script (`--font-logo`). Every other heading keeps Shrikhand.
- **2026-11-04 — Second orange gummy bear** beside the "h" of "Stash" on the home page, matching the top-left one. Shown on tablets and computers; hidden on phones, where it would cover the word.
- **2026-11-04 — Occasions header layout** (Vee: same words and lettering, "eye catching but not too much"; a stacked big-script version was tried and rejected). The heading is centred, with a row of colourful quick-link chips underneath (Birthday, Baby Shower, Gender Reveal, Graduation, Bridal Shower, Baptism, Other, Holidays → jumps to the holiday band). A floating orange gummy bear and pink lollipop sit on either side on wide screens only. This is the `centered` option on ColourHeader, so Build Your Stash is unchanged.
- **2026-11-04 — Christmas Advent Calendar, $43.00** (Vee): "24 days until Christmas, open each box to find out what candy surprise you get." It's a product in Sanity (`product-christmas-advent-calendar`, one size "24 days", flavour label "Candy surprise") and is linked from the Christmas holiday collection through a new **Ready-to-order products** field. The Christmas page shows it under "Christmas specials" with the price and a one-tap **Add to cart**. There's nothing to choose; the button reads "Online ordering coming soon" until checkout is switched on. Product pages with only one size no longer show a size picker. Still open: a photo, and ingredient/allergen info for the calendar.
- **2026-11-04 — Advent calendar promoted** (Vee: "I really want to promote this"). Vee's two calendar photos (originals in `docs/photos/`) are the product's photos in Sanity. Where it appears:
  - **Home page:** a big pink "NEW!" promo right under the ribbons with both photos, the price and a "See the advent calendar" button (`HomePromo`, switched by `site.promo`; set it to `null` after Christmas).
  - **Top teal bar on every page:** "🎄 NEW: the Christmas Advent Calendar, 24 days of candy surprises! →", linking to the Christmas page (`site.announcement` / `site.announcementHref`). This replaces "New website in progress — products and prices are coming soon."
  - **Christmas page:** the "Christmas specials" card shows the photos (tap the thumbnails to switch) with a NEW tag.
  - Still to check: if the photos came from a supplier, confirm they may be used. Larger originals would look sharper.
- **2026-11-05 — Second calendar photo only on the product page** (Vee). The home promo and the Christmas page card show just the first photo, and tapping either opens the calendar's own page (`/shop/christmas-advent-calendar`). That page shows both photos (big photo plus tappable thumbnails) with the quantity and Add to bag button. The top bar and the "See it & add to bag" buttons go straight there. Product pages now show real Studio photos (`ProductGallery`) instead of placeholders whenever a product has photos.
- **2026-11-05 — Calendar description** now also says it's a fun way to try lots of different candies (Sanity draft).
- **2026-11-05 — Christmas page decorated** (Vee: "snow flakes and some red and green"): gently falling white snowflakes over the whole page (they stop for visitors who've turned on reduced motion), a string of twinkling red, green and gold Christmas lights across the top, a light green header with "Christmas" in red, red-and-white candy-cane stripes between sections, and a soft red "Christmas specials" section with a green heading. Only the Christmas page gets this (`ChristmasDecor.tsx`; switched on by the `christmas` slug).
- **2026-11-08 — Payments at launch: e-Transfer and cash (Vee's choice), Stripe later. BUILT locally, not published.**
  - Cart → "Continue to order" → `/checkout`: name, email, phone; pickup in Vaughan (free) or delivery; e-Transfer, or cash for pickup only. Nothing is charged online.
  - Delivery (Vee: "use your suggestions"): Vaughan $6, nearby GTA $12, free over $75. "Worldwide" removed. All in `site.fulfilment.deliveryZones` / `freeDeliveryOverCents`.
  - After ordering: an order number (VCS-XXXXXX) and e-Transfer instructions (amount, vpanetta03@icloud.com, number in the message). The e-Transfer email appears only there and on the customer's own order page.
  - Studio: new statuses ⏳ Awaiting payment and 💰 Paid, a "Waiting for payment" list, and "To pack (paid)". Vee taps Paid once the money is in her bank.
  - The welcome code works the same way (checked on the server). Prices are checked on the server (`src/lib/pricing.ts`, shared with the Stripe route).
  - Stripe (sandbox) is built but off: `site.payments.mode = "stripe"` switches back.
  - `CHECKOUT_PREVIEW=1` in `.env.local` opens ordering locally only. To go live, set `checkoutEnabled: true`.
  - Tested at phone width with a test order, which was then deleted.
  - Still open: HST (not registered; don't charge until there's a CRA number); Sanity FAQ still says worldwide delivery and pay at checkout (update before launch); real policies.
- **2026-11-08 — Studio made easier (Vee's request). Local, not published.**
  - **🏠 Start here** page (`src/sanity/StartHere.tsx`): live "to do" boxes for waiting for payment, ready to pack, waiting for pickup/delivery, new custom requests and messages to answer. Each item opens with one tap, plus a short "how things move" guide.
  - **One-tap next-step button** on every order, request and message (`src/sanity/actions.tsx`), e.g. "💰 Payment received" → "📦 Mark as packed" → "🛍️ Ready for pickup" → "✅ Picked up". It saves and publishes in one go.
  - **Menu regrouped** into To do / Everything / My shop. Order list rows show payment and pickup/delivery.
  - Studio on the live site needs `https://veescandystash.ca` (and www) added in sanity.io/manage → API → CORS origins with "Allow credentials". Vee is doing that herself (the token can't).
- **2026-11-08 — Emails are NOT being sent.** `RESEND_API_KEY` is empty locally and on Netlify, so forms only save to the Studio inbox. 1 custom request (Birthday, 2026-11-08 evening) sits in the Studio and was never emailed. Fix: Resend account and key; NOTIFY_EMAIL_TO is contact@veescandystash.ca, to be confirmed with Vee.
- **2026-11-09 — "Powered by Netlify" badge switched off** (Vee's request) in the Netlify project settings (`built_with_badge_enabled: false`). No rebuild needed.
- **2026-11-09 — Checkout wording everywhere (local + Sanity drafts, not yet published):** new Policies section "Paying, pickup and delivery" (prices come from `site.fulfilment`); FAQ drafts faq-1 (how to order), NEW faq-13 "How do I pay?", faq-4 and faq-5 (local delivery, no more "worldwide"); `src/data/faq.ts` fallback matches. Ordering switches on once emails work (Resend key from Vee).
- **2026-11-09 — Order form fills in logged-in customers' details** from their default saved address (name, phone, street, city, postal code) and email, only into empty boxes. Tested: cash pickup order, and the welcome code refused for a guest ("Please log in…"). Test orders deleted.
- **2026-11-09 — Vee: "do all your suggestions".**
  - Policies are final, and the DRAFT note is removed (local).
  - Unpaid e-Transfer orders are cancelled after **48 hours** (`site.payments.payWithinHours`). This appears in Policies, on the order confirmation, in the customer email and in FAQ draft faq-13.
  - Studio's Start here flags unpaid orders older than 48 h.
  - All of this goes live with the email setup.

## 2026-11-09: Grand-opening code, footer delivery
- Pop-up and top bar now promote **WELCOME10**: 10% off any order, no account needed, for 1 week (`site.launchOffer`, ends `2026-11-17T00:00-05:00`, i.e. through Nov 16 if ordering opens Nov 10; adjust on launch day). The code stops working and the pop-up hides after `endsAt`; the top bar must be switched back by hand (advent-calendar text kept in a comment in site.ts).
- The 5% account welcome code is paused (`welcomeDiscountPercent: null`). Note: the new pop-up no longer triggers the welcome-code email after login; re-add that call if the 5% offer comes back.
- Footer shows "Delivery: Worldwide" (`site.fulfilment.footerDelivery`) at Vee's request. OPEN: checkout and policies still only offer local Vaughan/GTA delivery; shipping rates/policy needed before worldwide orders can be taken online.
- Build Your Stash size tiles use Vee's bag photos (public/bags/, src/data/bagPhotos.ts), cut from her 1/2/4 lb comparison photo at the same scale. OPEN: no real 0.5 lb photo yet; that tile shows the 1 lb bag shrunk. The single full-size bag photo (neww/IMG_7925.jpg) isn't used yet.
- Occasion tile titles now shrink to fit on narrow phones (container-query font size), fixing "Graduation" being cut off.
- Regular-order refund window changed to 24 hours (Vee, 2026-11-09): policies.ts, faq.ts, Sanity drafts.faq-12 (publish with the rest). Top-bar label is orange and bigger.

## 2026-11-09: Canada Post shipping replaces local delivery (local, not published)

- Vee: free pickup stays; her own Vaughan/GTA delivery ($6/$12/free over $75) is **removed**; everyone else ships with **Canada Post**, **worldwide**, choosing **Standard** or **Express** at checkout with the live price for their address.
- How: `src/lib/canadaPost.ts` calls Canada Post "Get Rates" (retail/counter price) from Vee's postal code. Standard = Regular Parcel (Canada) / Tracked Packet (US, international); Express = Xpresspost. The server re-quotes when the order is placed, so the customer can't change the price.
- Checkout: "Ship it with Canada Post" → country, street, city, province/state, postal/ZIP → Standard/Express choices appear. Order saves the service in "Delivery zone" and the full address; emails say "Shipping".
- Policies "Paying, pickup and delivery" and FAQ (faq-1, faq-4, faq-5 as Studio drafts + `src/data/faq.ts`) updated.
- **Needed before shipping works** (until then checkout says shipping prices aren't available and to choose pickup):
  - [ ] Vee: free Canada Post **Solutions for Small Business** account + **Developer Program** API keys.
  - [ ] Env vars in `.env.local` and Netlify: `CANADA_POST_USERNAME`, `CANADA_POST_PASSWORD`, `CANADA_POST_ORIGIN_POSTAL_CODE` (Vee's Maple postal code; private), and `CANADA_POST_SANDBOX=1` only with test keys.
  - [ ] Vee to weigh/measure a packed box: `site.fulfilment.shipping` (`packagingGrams` 250, `defaultItemGrams` 700, three box sizes) are **placeholders**.
  - [ ] Shipping candy abroad: customs forms and food import rules vary by country; heat/melting in summer. Policies don't cover lost/delayed parcels yet.

## 2026-11-11: Cheap flat shipping by weight, Canada + worldwide (local, not published)
- Vee: "lets do a flat rate because we are new", by pounds, Canada and worldwide (chose option 2: all regions on). Canada Post Solutions for Small Business parked until the business grows.
- Price is set by how much candy is in the order (`site.fulfilment.shipping.weightStepsLb` + `flatRates`, src/config/site.ts):

  | Candy in order | Ontario | Rest of Canada | USA | Rest of world |
  |---|---|---|---|---|
  | Up to 1 lb | $10 | $15 | $20 | $30 |
  | Up to 2 lb | $12 | $18 | $28 | $45 |
  | Up to 4 lb | $15 | $22 | $40 | $65 |
  | Over 4 lb | $18 | $26 | $50 | $80 |

  The advent calendar counts as about 1.5 lb (`defaultItemGrams`). Standard only, no Express.
- FAQ (faq.ts + Sanity drafts faq-4/faq-5 in project 05otdw3g) and Policies updated: worldwide shipping, a few weeks outside Canada, customs fees/duties/taxes paid by the customer (Vee to confirm). Footer: "Canada & worldwide".
- OPEN, flagged to Vee: food to the USA needs an FDA Prior Notice per parcel; some countries refuse or hold food parcels (e.g. Australia, NZ); what happens if a foreign parcel is refused or lost (refund? no policy yet); international rates are below Canada Post's tracked prices, so small foreign orders may lose money.
