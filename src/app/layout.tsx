import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "../../node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "100 900",
});
const ui = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-ui",
  display: "swap",
  weight: "100 900",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://trickfilm.com"),
  title: {
    default: "Trickfilm — Independent creative studio",
    template: "%s — Trickfilm",
  },
  description:
    "We bring together design, technology, and a little ingenuity to help businesses look better, work smarter, and solve problems in new ways.",
  icons: { icon: "/brand/trickfilm-symbol.svg" },
  openGraph: {
    title: "Trickfilm — Good ideas. Beautifully executed.",
    description:
      "Independent creative studio. Design, websites, applications, and automation.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${ui.variable}`}>{children}</body>
    </html>
  );
}
