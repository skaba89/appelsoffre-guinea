import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { PerformanceLogger } from "@/hooks/use-performance";
import { SkipNav } from "@/components/ui/skip-nav";

export const metadata: Metadata = {
  title: "TenderFlow Guinea — Veille intelligente des appels d'offres",
  description: "Plateforme SaaS de veille, qualification et traitement des appels d'offres publics et privés en Guinée",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <SkipNav />
          {children}
          <Toaster />
          
        </Providers>
      </body>
    </html>
  );
}
