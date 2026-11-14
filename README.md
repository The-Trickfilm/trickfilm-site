# Trickfilm

Next.js homepage for Trickfilm.com: original brand assets, a mountain hero with overlap-counted focus lenses, selected work, services, approach, and contact.

## Run and verify

Node 24 recommended. Install with `npm ci`; start locally with `npm run dev`.

- `npm run lint`
- `npm run typecheck`
- `npm test` — overlap counts, reversible convergence, and final geometry
- `npm run build`
- `npm run test:browser` — production server, desktop/mobile, keyboard navigation, service selection, all portfolio links and screenshots, motion control, reduced motion, fallback, and mobile video selection

Browser checks use `/usr/bin/chromium`; update `executablePath` in `playwright.config.ts` for another machine. `PLAYWRIGHT_BASE_URL` can target a deployed instance instead of starting the local production server.

## Deployment

Use the Vercel Next.js preset. No environment variables, database, or backend services are required for this milestone. The review branch is `feat/trickfilm-homepage`.

## Hero

One detached HTML video decodes a single selected source. Each frame supplies one WebGL texture and its synchronized blur pyramid. A fragment shader counts all five circles at each pixel. Overlaps 0–5 produce clarity values 0%, 20%, 40%, 60%, 80%, 100%; the blur radius decreases linearly. Only a subpixel edge is softened. The focus boundaries use the circular inner openings of the supplied artwork, mapped with the same transforms as the visible rims.

Power-of-two staging textures preserve source detail. Explicit-LOD sampling uses a small Gaussian kernel over the synchronized mipmap pyramid; older contexts use a direct Gaussian kernel. Five-circle overlap samples the fully sharp frame. No separately decoded video layers or single sharp-mask approximation are used.

The five user-supplied, clockwise SVG paths define the visible tapered rims. They render as native vectors, not uniform shader strokes. Each uses an offset radial gradient from white at 20% opacity on the outer boundary to white at 5% opacity on its inner opening. Original files are preserved unchanged in `public/brand/lenses`; their path data and aperture measurements live in `src/lib/lens-artwork.ts`. Browser checks sample both sides of each SVG opening to validate the focus geometry.

The supplied logo determines final circle positions and radius proportions. The circles drift by a few pixels at rest and converge reversibly with ordinary scrolling. There is no hero pinning or scroll snapping. The summit composition is fixed for the supplied clip, rather than object-tracked.

Rendering is limited to 30 fps and 1280 pixels wide on desktop, 640 pixels on smaller screens, with a bounded device-pixel ratio. Video pauses outside the viewport and in hidden documents. User pause stops video and drift. Reduced motion uses the static poster and final geometry, without requesting video. A CSS poster remains available without JavaScript or WebGL.

## Assets

- Original user-supplied SVG symbol and wordmark are unchanged in `public/brand`.
- Current video master: user upload `277097.mp4`, 1920 × 1080, approximately 18 seconds. The user explicitly selected it to replace the earlier Mixkit footage. Original uploads remain outside the repository.
- `public/media/summit-desktop.mp4`: 1920px, 24fps, silent H.264, fast-start.
- `public/media/summit-mobile.mp4`: 960px, 24fps, silent H.264, fast-start. Smaller viewports request this source only; one decoder remains in use.
- `public/media/summit-poster.webp`: matching high-resolution static frame.
- Exports use a monochromatic teal grade while retaining bright snow and shadow detail. No remote media or font requests are required by the homepage.
- The original Mixkit license record in `docs/mixkit-video-license.html` concerns the superseded asset, which is no longer shipped.

## Portfolio

The user supplied these five sites as their work. Homepage screenshots were captured on 2026-11-14, reviewed, and optimized into local WebP files under `public/work`:

- https://gowermodernlaw.com/
- https://nvfc.ca/
- https://www.streamworksdesigns.com/
- https://accesstojusticebc.ca/
- https://www.stratacouncil.ca/

The gallery uses responsive Next.js Images and links to the actual sites. It describes the organizations without inventing results or detailed delivery scope. Illustrative service concepts are explicitly labelled and separate from this real portfolio.

## Design and interaction

The approved split-hero reference guides the hero composition. LocalPixel was inspected as a quality reference for hierarchy, restrained motion, readable business language, and consistency; its assets and code are not reused.

The service explorer supports click, arrow keys, Home/End, and direct service links. Selected work remains server-rendered and accessible without JavaScript. Transitions are brief and disabled for reduced motion. Navigation omits unavailable Insights content. Browser captures are saved under `docs` for review.

## Remaining work

- Confirm a contact email or destination. The CTA currently reaches an honest contact placeholder; no form integration is claimed.
- Confirm detailed project scope before writing case studies or publishing quantified results.
- Physical iOS/Android and Safari/Firefox verification. Chromium checks exercise a simulated mobile viewport; they do not establish performance on real mobile GPUs.
