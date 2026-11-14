# Trickfilm

First homepage milestone for Trickfilm.com. The supplied GitHub repository was empty at inspection; no existing implementation was replaced.

## Develop and verify

Node 24 recommended. `npm ci`, then `npm run dev`.

- `npm run lint`
- `npm run typecheck`
- `npm test` — overlap levels, convergence, reverse scroll calculation, final geometry
- `npm run build`
- `npm run test:browser` — production server, desktop/mobile, WebGL rendering, scroll reversal, pause, reduced motion, navigation, fallback. The default test config uses `/usr/bin/chromium`; change executablePath for your system.

Next.js App Router, React, TypeScript, Tailwind CSS, npm lockfile. Deploy on Vercel with the Next.js preset; no environment variables or backend services required. No deployment was performed.

## Hero renderer

One detached HTML video supplies frames to one WebGL texture. A fragment shader counts containment in all five circles independently and applies a Gaussian kernel with blur proportional to `(5 - overlaps) / 5`. Thus overlap counts 0–5 produce clarity levels 0%, 20%, 40%, 60%, 80%, 100%; only a subpixel edge is softened. All regions sample the same frame. The supplied vector mark determines the five circular centers and radii; the original tapered paths are preserved in the logo assets.

Rendering is capped at 960 pixels wide and 30 fps, and pauses offscreen or in hidden documents. The video has one decoder and no audio. User pause stops drift and playback; scroll remains reversible. Reduced motion uses the poster, final logo geometry, and no video request. A CSS poster remains visible without JavaScript or WebGL. The summit is composed near the converged logo center; this is a fixed composition, not object tracking.

## Assets and license

Original user-provided symbol and full wordmark are in `public/brand`, unchanged.

Mountain: https://mixkit.co/free-stock-video/flying-over-a-monumental-rocky-mountain-with-visible-snow-and-51689/

Verified 2026-11-14: the asset page explicitly identifies **Mixkit Stock Video Free License**. https://mixkit.co/license/#videoFree and https://mixkit.co/license/modal/videoFree/ permit commercial projects and downloading, copying, and modifying the footage. Terms: https://mixkit.co/terms/. The license text inspected is recorded in `docs/mixkit-video-license.html`.

Local video: 12 seconds, 960px, 24fps, silent H.264, fast-start, monochromatic turquoise. Source downloaded from the asset page's published content URL. Poster extracted from the local optimized video. Original source remains outside the repository. No remote media is loaded by the homepage.

## Content still needed

- Approved homepage mockup (none supplied; current layout is an original design).
- Confirmed contact address or destination. CTA currently reaches an honest contact placeholder; no form submission or contact integration exists.
- Approved portfolio projects. “See our work” currently reaches the services overview; no client results are invented.
- Physical iOS/Android and Safari/Firefox verification; automated checks currently target Chromium, not real mobile GPU performance.

This milestone should receive content and device review before production launch.
