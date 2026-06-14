import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Film Mentor — Find the film that finds you",
  description: "A Zen master who suggests films based on your life struggles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zodiac-bg text-zodiac-fg antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
