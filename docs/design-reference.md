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
