# Trickfilm

Next.js 16, React 19, TypeScript, Tailwind CSS 4. Local Inter and Inter Tight fonts. No Framer runtime or remote font dependency.

## Development

`npm ci`, then `npm run dev`.

Validation: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then `npm run test:browser` (requires Chromium at `/usr/bin/chromium`; edit playwright.config.ts for another installation).

## Content and assets

- `src/lib/projects.ts`: five supplied website projects and StrataCouncil.ca application; confirmed contact jeremy@trickfilm.com.
- `src/lib/logo-projects.ts`: 19 supplied identity images, including variants. A seamless horizontal carousel shows about five at once on desktop, three on tablet, and two on mobile. The images are view-only, with no links or modal previews.
- `public/brand`: original Trickfilm SVG artwork, unchanged.
- `public/work`: existing website screenshots and supplied logo exports, retained.
- `public/work/applications`: captures of StrataCouncil.ca's public product previews. Its public footer identifies it as a Trickfilm product. These are not authenticated application screenshots.

Project pages deliberately omit unsupported results, durations, testimonials, and process claims. Dedicated authenticated application screenshots, further application projects, and fuller case-study copy remain editorial follow-ups. The contact form posts to a server route and delivers via Mailtrap when its sending configuration is present. Direct email remains available.

## Design

Agentic (https://agentic.framer.website/) is the visual reference: oversized navigation, compact introduction, prominent wordmark, rounded full-width portfolio panels, restrained typography and motion. Original implementation, actual Trickfilm assets, and original CSS laptop frames; no proprietary template assets or source copied. Prior mountain/pixel/lens implementation is removed and remains available in Git history.

Content remains visible without JavaScript. Reduced motion disables entrance animations, rotating accents, and desktop panel stacking. Small or short screens use normal project flow. Without JavaScript, the logos remain a native horizontally scrolling list without image links.

## Deployment

Vercel detects Next.js automatically. This change is developed on `feat/agentic-redesign` for pull-request review and a Vercel preview; merge through the repository's established production branch when approved. Page rendering needs no environment variables. Live contact delivery requires `MAILTRAP_API_TOKEN` and `MAILTRAP_FROM_EMAIL` in Vercel; the sender must belong to a verified Mailtrap sending domain. See `.env.example`. Domain/DNS configuration is separate from this implementation.

## Contact delivery

POST `/api/contact` validates the form server-side, bounds request size, checks same-origin browser requests, rejects the honeypot, and applies a bounded per-instance throttle (5 attempts / 10 minutes / IP). This throttle is best-effort on serverless infrastructure; a shared Vercel WAF rule is appropriate if traffic requires stronger abuse protection. No message contents or credentials are logged or stored. Mailtrap sends to jeremy@trickfilm.com with the visitor as Reply-To.

Success is returned only after Mailtrap acknowledges acceptance. Missing configuration returns 503, delivery failure returns 502, and the form preserves entered text and offers direct email. Provider integration is tested with a mocked transport; live inbox delivery still requires configuration and an end-to-end check. Native HTML submission also returns an accessible confirmation/error page without JavaScript.

## Services scrolling

On large screens, the service label and number stay in a sticky left column while the five descriptions scroll naturally at right. A scroll update changes the decorative number at the flower’s alignment point, including on reverse scrolling. Mobile, short screens, and reduced-motion users receive an ordinary list. No wheel interception or automatic scrolling.

## Logo carousel

The logo rail repeats the supplied catalog on either side of the accessible original set, rebasing native scroll position at matching boundaries. Clones are hidden from assistive technology and removed from keyboard tab order. Gentle autoplay pauses on hover, keyboard focus, or the explicit Pause control; it runs only while the carousel is visible. Reduced motion disables autoplay. Arrow controls, native horizontal trackpad scrolling, and touch swipes remain available. Card widths show five desktop / three tablet / two mobile logos, and resizing preserves progress through the loop.

## Flower accents

`public/brand/flower.svg` is the exact user-supplied flower artwork. CSS masks reuse its silhouette for the hero and project CTAs, keeping arrow icons upright. In Services, a separate flower layer rotates with scroll progress while the number layer remains upright. Rows use approximately 46% of viewport height (clamped to 360–480px), and the shorter sticky visual stays centered through all services. Mobile uses compact flower-backed numbers. Reduced motion disables rotation.

## Services focus treatment

Services are Web design, Branding, Graphic Design, Workflow Automation, and Business Process Design. Creative Solutions includes StrataCouncil.ca and the supplied Business Process Design diagram. Both portfolio groups share the same landscape card dimensions and native sticky stacking; mobile and reduced-motion views remain in normal flow. The Services list is text-only.

The section title stays in the desktop visual column; every service uses the same heading style. Copy opacity follows distance from the viewport center in either scroll direction. Reduced-motion and no-JavaScript views retain fully visible copy.

The numeral is SVG text positioned using the loaded font's visible ink bounds, removing font-bearing and line-box offsets. The flower's original path and color are preserved in `flower-centered.svg`; only the viewBox adds a square presentation frame centered on its alpha centroid, so rotation stays centered on the upright number. `flower.svg` remains the unchanged upload.

## Shared layout grid

The page frame is capped at 1280px; its padded inner grid is capped at 1080px. Hero, portfolio, section introductions, services, About, contact, and project detail pages share the same horizontal guides and column ratio. Contact fields are capped at 480px, with smaller inputs/textarea and a compact separate footer. Main section frames use a minimum of one viewport; work and services remain natural scrolling sequences, and mobile content can grow without clipping.

Service opacity and active numbering use the actual flower center as the alignment target. All five services and upright, centered numerals are present.

## Additional portfolio assets

Koan Analytics uses a locally optimized screenshot of its public “We Build End-To-End Analytic Platforms” page, captured for this portfolio. Its charcoal card sits immediately before StrataCouncil.ca. The Creative Solutions Business Process Design card uses the exact PNG supplied in `RAAVDiagram_ABR_ v2.png.zip`, without cropping or recreating the diagram; its detail page links to the full-resolution image.

## Additional supplied artwork

`Archive 2.zip` supplies HRsignal, Beat Bugs, and All Well & Good for the Brand/Identity carousel (21 total). `Archive.zip` supplies Talent Creative HR's process map and employee-retention stages plus the Thunderbird Entertainment corporate presentation cover. Local WebP derivatives preserve the complete artwork; Creative Solutions now has four cards. Talent Creative HR shares one laptop screen, switching images every three seconds while visible, with Pause/Play and Next controls. Autoplay stops offscreen, in hidden tabs, and for reduced motion. Both full-size HR images remain linked from its detail page. No additional slides, client outcomes, or integration claims are invented.

`Archive 3.zip` replaces the earlier HRsignal and All Well & Good identity artwork with the supplied square and landscape versions. The former HRsignal carousel entry is now titled Talent Creative HR. New asset filenames avoid reusing cached thumbnails; carousel size remains 21.

## Shared-link preview

Open Graph and Twitter metadata explicitly use `public/share/trickfilm-hero-v1.jpg`, a 1200×900 screenshot of the actual homepage hero with fonts and logo loaded. No portfolio card is included. The image uses an absolute URL on the public production Vercel hostname because trickfilm.com currently redirects to StrataCouncil. When the custom domain points to this app, that host can be updated. Messaging apps cache previews independently; changing metadata does not replace an existing message's cached thumbnail.

## Creative Solutions service cards

Creative Solutions card headings name the service: Applications & Automation, Business Process Design (two examples), and Presentation Design. Company names remain in the client facts. These cards have no project links or View project CTA; website cards keep theirs. The supplied nine-slide Thunderbird deck plays in numeric order in a repeating two-second slideshow. Slides stay fully visible against charcoal letterboxing. The HR loop retains its three-second interval; both offer pause/manual navigation and respect reduced motion.

## View-only identity catalog and kit pilot

The redundant Houndz Unleashed character and XDI application variants are removed from the carousel (19 remaining). Cards are figures with captions; no arrows, links, click handlers or modal previews remain. Autoplay, pause, arrows, touch/native scrolling, reduced motion and edge fades remain.

The first brand-kit pilot is Quality Engineering, a video-game QA/testing and tools organization. Its direct review route is `/brand/quality-engineering`; no carousel card links to it. Supplied artwork is unchanged. Palette, supporting typography, graphics and application studies are proposed. Print matches and flat vector variants await master artwork and approval. See `docs/brand-kit-scope.md`.

## Scroll magnification

Identity card surfaces grow toward the horizontal rail centre (up to 1.075×) and shrink toward its edges (0.88×). Layout-width figures remain unchanged for predictable native scrolling and seamless loop rebasing. Cached centre positions are remeasured on resize; scroll events batch scale updates in requestAnimationFrame without React renders.

Both portfolio stacks ease from 0.94× into their normal full-size frame as they enter the viewport (0.97× on mobile). Their top origin preserves sticky positioning; reversing scroll reverses the effect. Reduced motion and no-JavaScript views retain normal-sized content. These changes are based on the production branch and exclude the closed identity-exploration PR.

Identity surfaces also follow a gentle, monotonic horizontal projection: spacing opens around the centre and compresses near the edges, reinforcing the perceived depth of the magnification. The underlying figures retain fixed widths and gaps for stable touch scrolling, looping and resizing. Reduced motion disables this translation as well as scaling.

Logo surfaces turn outward up to 14° around the Y axis toward each edge, mirrored left/right. A central straight-on band holds zero rotation while a card is near the middle. Perspective is applied only to the inner surfaces, preserving stable layout measurements and loop geometry. Reduced motion removes rotation, translation and scale.

Portfolio entry now rises from the smaller initial size to a gentle 1.025× peak (1.012× on mobile), then eases back to exactly 1× before the final sticky position. Both phases are derived from scroll position, with zero slope at the peak and settling point, so reversing scroll retraces the effect.

Depth refinement: logo cards overlap slightly at the far edges while keeping the centre flat and open; edge fades are twice as wide. Portfolio scaling peaks halfway between entering the viewport and the sticky top anchor, then settles over the remaining half. A trailing scroll runway lets the last card in each stack reach and hold that same anchor before the stack releases.
