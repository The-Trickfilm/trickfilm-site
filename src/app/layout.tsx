import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/brand/trickfilm-symbol.svg" },
  title: "Trickfilm — Clarity through creativity & technology",
  description:
    "Trickfilm brings clarity to complexity through web design, workflow automation, custom business applications, and AI consulting.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
