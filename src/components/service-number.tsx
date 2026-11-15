"use client";
import { useEffect, useRef } from "react";

// Center the numeral's visible ink rather than its font advance or line box.
export function ServiceNumber({ number }: { number: number }) {
  const text = useRef<SVGTextElement>(null);
  useEffect(() => {
    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed || !text.current) return;
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      const style = getComputedStyle(text.current);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const ink = context.measureText(String(number));
      text.current.setAttribute("text-anchor", "start");
      text.current.setAttribute("dominant-baseline", "alphabetic");
      text.current.setAttribute(
        "x",
        String(
          120 + (ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / 2,
        ),
      );
      text.current.setAttribute(
        "y",
        String(
          120 +
            (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2,
        ),
      );
    });
    return () => {
      disposed = true;
    };
  }, [number]);
  return (
    <svg className="service-number" viewBox="0 0 240 240" aria-hidden="true">
      <text
        ref={text}
        x="120"
        y="120"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {number}
      </text>
    </svg>
  );
}
