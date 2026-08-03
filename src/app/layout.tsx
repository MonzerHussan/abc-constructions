import type { Metadata } from "next";
import { Geist_Mono, Cairo, Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "./Providers";
import AuthProvider from "@/components/AuthProvider";
import { DEFAULT_LOCALE, getDir, isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${geistMono.variable} ${cairo.variable} ${plusJakartaSans.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
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
