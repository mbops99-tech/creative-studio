import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Studio V5",
  description: "AI-powered video creation studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
