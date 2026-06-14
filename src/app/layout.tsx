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
      <body className="min-h-screen bg-bg text-text antialiased">
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/90 via-bg/70 to-bg" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gold/3 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/4 rounded-full bg-gold/3 blur-[100px]" />
        </div>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
