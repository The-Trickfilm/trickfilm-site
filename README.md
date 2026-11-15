# Trickfilm

Next.js homepage for Trickfilm.com: original brand assets, a mountain hero with overlap-counted focus lenses, selected work, services, approach, and contact.

## Run and verify

Node 24 recommended. Install with `npm ci`; start locally with `npm run dev`.

- `npm run lint`
- `npm run typecheck`
- `npm test` — overlap counts, reversible convergence, and final geometry
- `npm run build`
- `npm run test:browser` — production server, desktop/mobile, keyboard navigation, service selection, all portfolio links and screenshots, motion control, reduced motion, fallback, and absence of video requests

Browser checks use `/usr/bin/chromium`; update `executablePath` in `playwright.config.ts` for another machine. `PLAYWRIGHT_BASE_URL` can target a deployed instance instead of starting the local production server.

## Deployment

Use the Vercel Next.js preset. No environment variables, database, or backend services are required for this milestone. The review branch is `feat/trickfilm-homepage`.

## Hero

The current milestone uses a still photograph. One texture and one precomputed blur pyramid feed a shader that independently counts the five circular openings. Each overlap adds 20% clarity. All five clear apertures coincide completely over the summit at the end. There are no horizontal image fades or opacity masks; a uniform teal treatment preserves equal brightness inside and outside the openings.

The supplied SVG paths retain their tapered rims, with white gradients from 20% outside to 5% inside. Aperture measurements match the native path transforms. Independent drift stops on pause and during final convergence.

The hero stays sticky while the first 65vh (capped at 600px) of scrolling assembles the lenses. It remains assembled for another 15vh before leaving with normal page scrolling. Scrolling back reverses the assembly. Reduced motion removes the sticky runway and shows the assembled still directly. No wheel interception or scroll snapping is used.

Rendering is capped at 30fps and 1280px wide on desktop, 640px on smaller screens. Image upload and mip generation happen once. Offscreen and hidden documents suspend rendering. CSS provides a blurred still fallback without WebGL.

## Assets

- Original user-supplied SVG symbol, wordmark and five separate lens files remain unchanged in `public/brand`.
- `public/media/mountain-still.webp` is the user-supplied Siguniang photograph from `lin2015-siguniang-mountain-8568913.jpg.zip`, optimized from 6000 × 4000 to 2400 × 1600. Its summit is calibrated in `src/lib/still-image.ts`. The same uniform teal treatment applies to sharp and blurred samples; no horizontal fade is used.
- Previous optimized video files remain in `public/media` for a later iteration. The current homepage does not request or decode them.
- Local portfolio screenshots and fonts avoid remote dependencies.

## Portfolio

The user supplied these five sites as their work. Homepage screenshots were captured on 2026-11-14, reviewed, and optimized into local WebP files under `public/work`:

- https://gowermodernlaw.com/
- https://nvfc.ca/
- https://www.streamworksdesigns.com/
- https://accesstojusticebc.ca/
- https://www.stratacouncil.ca/

The horizontal gallery uses responsive Next.js Images and links to the actual sites. Left/right controls, touch scrolling, and keyboard arrows move between smaller project previews. The centered project appears in its original colors, with neighboring sites in monochrome green. Selection follows the actual scroll position. It describes the organizations without inventing results or detailed delivery scope. Illustrative service concepts are explicitly labelled and separate from this real portfolio.

## Design and interaction

The current still-image prototype tests the revised blur and assembly behavior. LocalPixel was inspected as a quality reference for hierarchy, restrained motion, readable business language, and consistency; its assets and code are not reused.

The service explorer supports click, arrow keys, Home/End, and direct service links. Selected work remains server-rendered and accessible without JavaScript. Transitions are brief and disabled for reduced motion. Navigation omits unavailable Insights content. Browser captures are saved under `docs` for review.

## Remaining work

- Confirm a contact email or destination. The CTA currently reaches an honest contact placeholder; no form integration is claimed.
- Confirm detailed project scope before writing case studies or publishing quantified results.
- Physical iOS/Android and Safari/Firefox verification. Chromium checks exercise a simulated mobile viewport; they do not establish performance on real mobile GPUs.
