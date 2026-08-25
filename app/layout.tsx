import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClientAuthProvider } from "@/components/auth/ClientAuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Luxorides - Luxury Cab Booking",
  description:
    "Book chauffeur-driven luxury cabs, airport transfers, local rides, and outstation travel with Luxorides.",
  applicationName: "Luxorides",
  appleWebApp: {
    capable: true,
    title: "Luxorides",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Default fallback */}
      <link
        rel="icon"
        href="https://cdn.luxorides.com/luxorides-favicon/favicon.ico"
        sizes="48x48"
        type="image/x-icon"
      />

      {/* Light mode favicon */}
      <link
        rel="icon"
        href="https://cdn.luxorides.com/luxorides-favicon/favicon-light.ico"
        media="(prefers-color-scheme: light)"
      />

      {/* Dark mode favicon */}
      <link
        rel="icon"
        href="https://cdn.luxorides.com/luxorides-favicon/favicon-dark.ico"
        media="(prefers-color-scheme: dark)"
      />

      {/* Apple touch */}
      <link
        rel="apple-touch-icon"
        href="https://cdn.luxorides.com/luxorides-favicon/apple-touch-icon.png"
      />

      {/* Safari pinned tab */}
      <link
        rel="mask-icon"
        href="https://cdn.luxorides.com/luxorides-favicon/safari-pinned-tab.svg"
        color="#5bbad5"
      />

      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#0a0a0a" />

      <body className={`${inter.variable} antialiased`}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
