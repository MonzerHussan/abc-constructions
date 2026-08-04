"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/cart";
import DirSync from "@/components/DirSync";
import CartDrawer from "@/components/marketplace/CartDrawer";

export default function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: string;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <CartProvider>
        <DirSync />
        {children}
        <CartDrawer />
      </CartProvider>
    </LanguageProvider>
  );
}
