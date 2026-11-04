# Car oil website (working name: Aurum)

A motor oil shop website for UK drivers. Dark and cinematic, built for iPhone first.

**Public demo (once merged to main):** https://zaindstyles.github.io/Gallery/aurum-motor-oil/
**Private Claude preview:** https://claude.ai/artifact/7pDjuWRpvYwLkbgNEqpiAi (opens only in Zain's Claude account)

Saved here from the artifact on 4 Nov 2026 as a reusable hero for future car oil / garage clients.

## What's in it

- **Scroll hero:** a 10-second video of oil pouring into an engine, played frame by frame as you scroll. Four steps: Open, Pour, Flow, Protect.
- **The range:** 8 synthetic oils with grade and car-make filters. Each bottle fills with oil as it comes into view.
- **Product pages:** an open bottle pours down the page. Each ingredient lights up as the oil reaches it. Then the label specs, pack sizes and similar oils.
- **Basket:** add, change quantities, subtotal. Checkout is not connected yet.
- **Enquiries:** reg plate, car, topic, oil and message. Not connected to email yet.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site in one file (styles, product data, scripts) |
| `hd/` | 241 hero frames, AVIF, 1170px wide (~5.8 MB) |
| `frames/` | Same frames as WebP, for iOS 15 and older (~9.6 MB) |
| `data/oils.json` | The 8 oils: specs, approvals, example prices, colours |
| `data/research.md` | Where each spec came from |
| `source/hero-prompt.txt` | The Higgsfield prompt used to make the hero video (the .mp4 itself wasn't in the artifact) |
| `tools/make-frames.sh` | Rebuilds the frames from a new video |

## Not done yet

- Real prices and stock (all prices are examples)
- Product photos from a supplier (bottles are drawn in each brand's colours, no logos)
- Payments (Stripe or Shopify) and enquiry emails
- A brand name (Aurum is a placeholder)
- Hosting on its own domain
