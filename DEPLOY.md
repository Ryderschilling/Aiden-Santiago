# Aiden Santiago mockup, v2

Static site. No build step, no dependencies. 10 pages.

Structure now mirrors his current site so the meeting starts on familiar ground.
Rebuilt from scratch in plain HTML/CSS/JS using his own content, not copied off
the Luxury Presence template. Type and spacing are house standard, so it reads
sharper than the original without being a different site.

## Local preview

```
cd "/Users/ryderschilling/Documents/Claude/Projects/website builds/aiden-santiago"
python3 -m http.server 8080
```

## Deploy to Vercel (staging, noindexed)

```
cd "/Users/ryderschilling/Documents/Claude/Projects/website builds/aiden-santiago"
npx vercel --prod --yes --scope ryder-schillings-projects --name aiden-santiago
```

`robots.txt` blocks all crawlers and every page carries `noindex, nofollow`.
Strip both before anything goes live for real.

## Pages

| Path | Matches his | Notes |
|---|---|---|
| `/` | Home | Video hero + working search, Buy/Connect/Sell, Meet Aiden, Featured Properties, valuation band, neighborhoods, newsletter, Work With Aiden, Instagram |
| `/about/` | About Aiden | Bio + past transactions |
| `/portfolio/` | Portfolio | On the market, then closed |
| `/search/` | Search Homes | **Works.** Filters his 21 listings by address, city, neighborhood, and status |
| `/neighborhoods/` | Neighborhoods | All 9 areas of expertise |
| `/home-valuation/` | Home Valuation | Seller lead form |
| `/mortgage-calculator/` | Mortgage Calculator | **Works.** Live P&I, taxes, insurance, HOA with a breakdown bar |
| `/concierge/` | Compass Concierge | Pillars, NAR stats, covered services, how it works |
| `/contact/` | Let's Connect | Contact details + message form |
| `404.html` | 404 | |

## Upgrades already in, beyond his current site

1. **Search actually returns results.** His hero search bar and Search Homes go to a live filter over his own listings. Query is carried in the URL hash, because static hosts eat query strings.
2. **The mortgage calculator computes.** Real amortization, updates as you type, resets clean.
3. **Accessibility.** axe returns 0 violations on all 10 pages at 1440px and 390px, plus the open-drawer state. Hero text contrast measured against the actual video frame: tagline 4.52:1 minimum, headline clears the large-text bar everywhere.
4. **Real page structure.** One h1 per page, landmarks, skip link, keyboard-operable drawer with Escape and focus return, pause control on the video.

## Known gaps, on purpose

1. **No IDX.** Search covers his 21 properties, not the MLS. Live MLS needs a feed (SimplyRETS or IDX Broker, roughly $50 to $100 a month) plus paperwork through Compass. This is the pricing conversation.
2. **No individual property detail pages.** Cards are not linked through yet.
3. **No testimonials.** His current testimonials page has none on it. Nothing invented.
4. **Forms compose email.** Submitting opens the visitor's mail app addressed to `aiden.santiago@compass.com`. No backend, no third-party key.
5. **No blog.** His has the page, there are no posts.

## Before this is shown as real

- **Photo rights.** Every image came off his current site. MLS listing photos usually belong to the listing brokerage, not the agent. He needs to confirm what he can use.
- **Compass brand compliance.** Wordmark, affiliation line, and the equal housing disclaimer are carried over. Compass should sign off.
- **Listing data.** Prices, beds, baths, and square footage were pulled from his own pages and hand-checked against each listing description. Have him confirm before it is public.

## Credit

Footer carries `built by Ryder Schilling`, linked.
