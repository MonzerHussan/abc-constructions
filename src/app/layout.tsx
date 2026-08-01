import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo, Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "./Providers";
import AuthProvider from "@/components/AuthProvider";
import { DEFAULT_LOCALE, getDir, isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ABC - All About Constructions",
  description:
    "The complete platform for construction and contracting - tenders, building materials marketplace, project showcase, jobs, training and delivery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
  const dir = getDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${inter.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Providers initialLocale={locale}>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
