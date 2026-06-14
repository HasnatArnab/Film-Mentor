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
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 via-bg-primary/60 to-bg-primary" />
        </div>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
