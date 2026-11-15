# Trickfilm

Next.js homepage for Trickfilm.com: original brand assets, a pixel-to-clear mountain hero and scroll-driven text focus, selected work, services, approach, and contact.

## Run and verify

Node 24 recommended. Install with `npm ci`; start locally with `npm run dev`.

- `npm run lint`
- `npm run typecheck`
- `npm test` — deterministic spatial reveal order and complete settling
- `npm run build`
- `npm run test:browser` — production server, desktop/mobile, keyboard navigation, service selection, all portfolio links and screenshots, pixel replay, continuing hero motion and pause/resume, scroll-driven text focus, reduced motion, fallback, and absence of video requests

Browser checks use `/usr/bin/chromium`; update `executablePath` in `playwright.config.ts` for another machine. `PLAYWRIGHT_BASE_URL` can target a deployed instance instead of starting the local production server.

## Deployment

Use the Vercel Next.js preset. No environment variables, database, or backend services are required for this milestone. The review branch is `feat/trickfilm-homepage`.

## Hero and focus direction

The latest user reference is the 36.8-second `reference.mov` recording of LocalPixel. It guides the editorial scale, compact navigation, dark hero, brief pixel transitions and generous section spacing. Trickfilm retains its original logo, turquoise palette, supplied mountain photograph and its own copy, content and implementation.

The hero is rendered as a WebGL point surface, rather than a full photograph with an animated overlay. A 10px lattice samples the supplied mountain image. Each cell contains four separated square emitters, a central gutter and a faint rim. Domain-warped folds continuously change the actual vertex positions, perspective depth, cell size and lighting. The image is constructed from these moving cells; there is no photograph zoom or camera-pan approximation. Pointer movement gently displaces nearby points.

A 1.25-second central pixel bloom opens the surface, synchronized with the headline entrance. The hero starts on black and uses only the original teal over near-black. One texture, one static vertex buffer and one draw call render each frame, capped at 60fps with a bounded render resolution. Pause/Play freezes and resumes the field; reduced motion renders a static surface. Rendering suspends offscreen and in hidden documents. Unsupported or lost WebGL contexts use the dark static image fallback.


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

The current direction uses a pixel-to-clear hero, continuing ambient image motion and scroll-driven text focus. The fixed navigation has no background; it floats over the full-height hero and switches text colour as the section beneath it changes. LocalPixel was inspected as a quality reference for hierarchy, restrained motion, readable business language, and consistency; its assets and code are not reused.

The service explorer supports click, arrow keys, Home/End, and direct service links. Selected work remains server-rendered and accessible without JavaScript. Transitions are brief and disabled for reduced motion. Navigation omits unavailable Insights content. Browser captures are saved under `docs` for review, including a recording of the rendered field at `public/media/hero-motion-preview.mp4`.

## Remaining work

- Confirm a contact email or destination. The CTA currently reaches an honest contact placeholder; no form integration is claimed.
- Confirm detailed project scope before writing case studies or publishing quantified results.
- Physical iOS/Android and Safari/Firefox verification. Chromium checks exercise a simulated mobile viewport; they do not establish performance on real mobile GPUs.
