# Trickfilm

Next.js 16, React 19, TypeScript, Tailwind CSS 4. Local Inter and Inter Tight fonts. No Framer runtime or remote font dependency.

## Development

`npm ci`, then `npm run dev`.

Validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then `npm run test:browser` (requires Chromium at `/usr/bin/chromium`; edit playwright.config.ts for another installation).

## Content and assets

- `src/lib/projects.ts`: five supplied website projects and StrataCouncil.ca application; confirmed contact jeremy@trickfilm.com.
- `src/lib/logo-projects.ts`: 18 supplied logo images, including variants. Six featured identities expand to all 18; accessible native dialog supports arrow keys and Escape.
- `public/brand`: original Trickfilm SVG artwork, unchanged.
- `public/work`: existing website screenshots and supplied logo exports, retained.
- `public/work/applications`: captures of StrataCouncil.ca's public product previews. Its public footer identifies it as a Trickfilm product. These are not authenticated application screenshots.

Project pages deliberately omit unsupported results, durations, testimonials, and process claims. Dedicated authenticated application screenshots, further application projects, and fuller case-study copy remain editorial follow-ups. Contact is a mailto link, with no form or backend integration.

## Design

Agentic (https://agentic.framer.website/) is the visual reference: oversized navigation, compact introduction, prominent wordmark, rounded full-width portfolio panels, restrained typography and motion. Original implementation, actual Trickfilm assets, and original CSS laptop frames; no proprietary template assets or source copied. Prior mountain/pixel/lens implementation is removed and remains available in Git history.

Content remains visible without JavaScript. Reduced motion disables entrance animations, rotating accents, and desktop panel stacking. Small or short screens use normal project flow. Logo links and the native expand control remain usable without JavaScript.

## Deployment

Vercel detects Next.js automatically. This change is developed on `feat/agentic-redesign` for pull-request review and a Vercel preview; merge through the repository's established production branch when approved. No environment variables are required. Domain/DNS configuration is separate from this implementation.
