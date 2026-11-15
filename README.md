# Trickfilm

Next.js homepage for Trickfilm.com: original brand assets, a pixel-to-clear mountain hero and scroll-driven text focus, selected work, services, approach, and contact.

## Run and verify

Node 24 recommended. Install with `npm ci`; start locally with `npm run dev`.

- `npm run lint`
- `npm run typecheck`
- `npm test` — deterministic spatial reveal order and complete settling
- `npm run build`
- `npm run test:browser` — production server, desktop/mobile, keyboard navigation, service selection, all portfolio links and screenshots, pixel replay, scroll-driven text focus, reduced motion, fallback, and absence of video requests

Browser checks use `/usr/bin/chromium`; update `executablePath` in `playwright.config.ts` for another machine. `PLAYWRIGHT_BASE_URL` can target a deployed instance instead of starting the local production server.

## Deployment

Use the Vercel Next.js preset. No environment variables, database, or backend services are required for this milestone. The review branch is `feat/trickfilm-homepage`.

## Hero and focus direction

The latest user reference is the 36.8-second `reference.mov` recording of LocalPixel. It guides the editorial scale, compact navigation, dark hero, brief pixel transitions and generous section spacing. Trickfilm retains its original logo, turquoise palette, supplied mountain photograph and its own copy, content and implementation.

The lens direction is retired. `PixelMountain` composites one sharp image through a low-resolution binary mask. A coherent reveal grows out from a central cluster. Six-CSS-pixel cells flicker only along its irregular advancing edge; the resolved image behind the edge stays stable. A subtle 3.5% camera settle accompanies the 1.25-second reveal. The hero starts on black, including while the photograph downloads, and never displays the ungraded source as a loading background. Each visible square contains full-resolution image detail; there is no coarse-image sampling or blur. The mask is scaled with smoothing disabled. It schedules up to 60fps during the reveal, then stops rendering. The headline and supporting copy enter with a short blur/translate settle. A replay button restarts the image reveal. There is no scroll pinning, video, WebGL dependency, or left-side opacity fade. Rendering stops offscreen and while the document is hidden.

`FocusText` preserves readable semantic text in HTML. Words move from a 7px blur to sharp as their heading enters reading position, driven by passive scroll events and one scheduled animation frame. Scrolling back reverses the effect. No scrambled or matrix characters are used. Reduced motion shows the clear image and sharp text immediately; without JavaScript the image and text remain visible.

## Assets

- Original user-supplied SVG symbol, wordmark and five separate lens files remain unchanged in `public/brand`.
- `public/media/mountain-still.webp` is the user-supplied Siguniang photograph from `lin2015-siguniang-mountain-8568913.jpg.zip`, optimized from 6000 × 4000 to 2400 × 1600. The image configuration lives in `src/lib/still-image.ts`. The image uses a darker uniform teal treatment, with no horizontal fade. The original Trickfilm teal (#5ec3ba) is the accent for buttons and emphasis against near-black imagery.
- Previous optimized video files remain in `public/media` for a later iteration. The current homepage does not request or decode them.
- Local portfolio screenshots and fonts avoid remote dependencies.

## Portfolio

The user supplied these five sites as their work. Homepage screenshots were captured on 2026-11-14, reviewed, and optimized into local WebP files under `public/work`:

- https://gowermodernlaw.com/
- https://nvfc.ca/
- https://www.streamworksdesigns.com/
- https://accesstojusticebc.ca/
- https://www.stratacouncil.ca/

Websites and Logo design now have separate, always-visible sections. The logo section follows the website gallery without requiring a tab selection. The website gallery links to the five actual sites; the identity gallery includes all 18 user-supplied images from `logos.zip`, including supplied variants. These assets are optimized as WebP without redesign, recoloring or cropping, and use `object-fit: contain`.

Both horizontal galleries loop continuously in either direction using matching leading/trailing copies and a scroll-end reset that preserves the visual offset. Duplicate slides are inert and hidden from assistive technology. Left/right controls, native horizontal touch/trackpad scrolling, and keyboard arrows move between smaller previews; Home/End reach the first/last original item. The website previews are capped at 520px and identity artwork is exactly half the website preview stage height at each viewport. The centered project appears in its original colors, with neighboring sites in monochrome green. Selection follows the actual scroll position. It describes the organizations without inventing results or detailed delivery scope. Illustrative service concepts are explicitly labelled and separate from this real portfolio.

## Design and interaction

The current direction uses a pixel-to-clear hero and scroll-driven text focus. LocalPixel was inspected as a quality reference for hierarchy, restrained motion, readable business language, and consistency; its assets and code are not reused.

The service explorer supports click, arrow keys, Home/End, and direct service links. Selected work remains server-rendered and accessible without JavaScript. Transitions are brief and disabled for reduced motion. Navigation omits unavailable Insights content. Browser captures are saved under `docs` for review, including an actual intro recording at `docs/intro-preview.mp4`.

## Remaining work

- Confirm a contact email or destination. The CTA currently reaches an honest contact placeholder; no form integration is claimed.
- Confirm detailed project scope before writing case studies or publishing quantified results.
- Physical iOS/Android and Safari/Firefox verification. Chromium checks exercise a simulated mobile viewport; they do not establish performance on real mobile GPUs.
