import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { COOKIE_NAME, Locale } from "@/lib/i18n";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://industra-medicose.vercel.app"),
  title: "Industra Medicose | The Two-Minute Doctor Clinical Copilot",
  description:
    "Less Documentation. More Care. Smarter Healthcare. Agentic clinical copilot for AAYU 2026 Problem T01 'The Two-Minute Doctor'.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Industra Medicose | The Two-Minute Doctor",
    description:
      "Multi-agent clinical copilot reducing doctor documentation from 8.5 minutes to under 2 minutes.",
    siteName: "Industra Medicose",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/dashboard-preview.webp",
        width: 1200,
        height: 630,
        alt: "Industra Medicose Doctor Clinical Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Industra Medicose | The Two-Minute Doctor",
    description:
      "Multi-agent clinical copilot reducing doctor documentation from 8.5 minutes to under 2 minutes.",
    images: ["/images/dashboard-preview.webp"],
  },
};

export const viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get(COOKIE_NAME)?.value as Locale | undefined;
  const initialLocale: Locale = langCookie === "hi" ? "hi" : "en";

  return (
    <html
      lang={initialLocale}
      className={`${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans min-h-screen bg-background text-foreground antialiased flex flex-col">
        <ThemeProvider>
          <I18nProvider initialLocale={initialLocale}>
            <ToastProvider>
              <DisclaimerBanner />
              {children}
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
