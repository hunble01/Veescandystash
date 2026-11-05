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
- [x] Sanity project `dub9zh7i` connected 2026-10-26, with read and write tokens in `.env.local`. Draft content imported (5 products, 8 occasions, 4 holiday collections, 12 FAQs).
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
