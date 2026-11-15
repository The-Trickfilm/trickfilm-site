# Agentic adaptation

Reference studied: https://agentic.framer.website/ and the user's supplied Trickfilm adaptation. The earlier Lume reference is superseded.

At a 1440px desktop viewport the reference uses approximately 160px content insets, 80px navigation lettering with tight leading, a 336px introduction column, and 24px outer margins around 60px-radius project panels. Panels alternate dark and accent surfaces, with large project titles at left and device presentations at right. On mobile, navigation and introduction stack and project content precedes the image.

This implementation follows those proportions with original Trickfilm artwork and turquoise (#5ec3ba). The wide Trickfilm logo retains its original proportions. Local Inter/Inter Tight fonts provide the tight typography. Device frames are original CSS. Project facts use supplied names and factual categories rather than the reference's placeholder clients or durations.

Six project pages, eighteen supplied logo images, three service groups, About, and direct email contact complete the content. Motion is restrained and progressive: visible content receives a short entrance movement; reduced-motion users receive no animation. No scroll interception. On larger screens, native CSS sticky positioning lets each website panel cover the previous one and releases at the end of the stack. Small/short screens and reduced-motion users receive a normal document flow.

Reference screenshots and template assets are not part of the repository.

## Uploaded walkthrough polish

The 47-second `agentic.mov` supplied by the user informed the second pass: staggered navigation and introduction entrances, a persistent white-backed home symbol, rotating diamond accents, full-height overlapping project panels, generous service spacing with turquoise numerals, and a continuous dark contact/footer surface behind the original wordmark. No reference footage or template assets are shipped.

The home mark returns to the intro; native anchors retain keyboard navigation. Entrance effects cancel when the motion preference changes. Project panels themselves are never faded or transformed by JavaScript, preserving sticky positioning; only their contents receive brief entrances. No scroll listeners, scroll interception, or new animation dependency is needed.

## Margins, services, and contact

Desktop project surfaces now have a 64px inset at a 1440px viewport (responsive 32–80px range), with 20px mobile edges. Services match the walkthrough's fixed visual / scrolling description treatment: a sticky turquoise number changes as each service crosses the viewport midpoint. Smaller/shorter screens and reduced-motion users get a standard list. The contact section now has a labeled, validated form with Mailtrap delivery behind a server route and a direct email fallback. Credentials and a verified sending domain are required before live delivery can be confirmed.

## Compact identity carousel

The expanded grid is replaced with a compact, continuously looping horizontal logo rail: five visible items at desktop width, three on tablet, two on mobile. Original artwork, colors, and names are retained. Arrows, Pause/Play, touch scrolling, hover/focus pauses, and the existing large preview provide control. Reduced-motion users get manual scrolling; no-JavaScript users get the original list and image links. Repeated visual copies are excluded from screen-reader navigation and keyboard tab order.

## Services and work density

The separate services introduction is removed; “A little ingenuity. A lot of possibility.” now sits above the first description within the scrolling service content. Website order: Gower Modern Law, North Vancouver FC, Streamworks Designs, Access to Justice BC, StrataCouncil.ca. Work panels are shorter (680px at a 1000px-tall desktop viewport, formerly 952px), with tighter internal spacing and the existing overlap preserved. StrataCouncil.ca can wrap between “Strata” and “Council.ca” while keeping both parts intact. Mobile cards also have reduced padding and gaps.

## Flower and service spacing refinement

The user-supplied solid flower replaces every square accent in the hero, project CTAs, and service counters. The original SVG is stored unchanged. Services rotate only the flower mask with scroll progress; numerals remain upright, and reverse scrolling reverses rotation. Service rows are now roughly 46svh rather than 100svh, with a matching shorter sticky stage, removing about half the distance between descriptions. Mobile numbers also use the flower; reduced-motion shapes remain static.

## Five focused services and centered numerals

The revised service list is Web design; Branding; Graphic Design; Workflow Automation; Business Process Design. The section title remains consistent in the left sticky column and all five service headings use the same hierarchy. Descriptions fade continuously as they approach and leave the center focus area; reduced motion and no-JavaScript retain the text in full.

Numerals use visible glyph bounds for centering, independent of font side bearings and baseline. A square presentation viewBox centers the original flower's alpha centroid without changing its path, keeping the rotation centered on the number. The original uploaded SVG remains intact.

Rendered centering check: the white ink bounds of digits 1–5 were measured from 240px screenshots. Their centers were within 1px of the flower's rotation center on both axes. See `docs/service-numerals.webp`. Mobile fades each flower together with its service copy; desktop keeps the single flower visible while descriptions crossfade.

## Shared-grid pass

The layout now uses a contained 1280px frame with a padded 1080px inner grid, shared 5/7 content columns, and matching gutters across the homepage and project detail pages. Contact is capped at 480px and its footer spacing is reduced. Hero, Identity, Applications, About, and Contact each measured exactly 1000px high in the reviewed 1440×1000 desktop rendering. Work cards use full-screen scenes with inset cards; longer work and services sequences continue naturally. Mobile content may grow beyond one viewport to avoid clipping.

The fade target is the flower's actual center, with service-copy center measured independently of the surrounding row. This keeps the five requested services aligned to the graphic at the beginning and end of the scroll region as well.
