"use client";

import { X, ShoppingCart, Minus, Plus, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { Button, Badge } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { useLanguage } from "@/lib/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, clearCart } = useCart();
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const totalsByCurrency = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.currency] = (acc[item.currency] || 0) + item.price * item.quantity;
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 end-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold text-surface-900">{t("cart")}</h2>
            <Badge variant="brand">{totalItems}</Badge>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg"
            aria-label={t("close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-surface-300" />
              </div>
              <p className="text-surface-500">{t("cartEmpty")}</p>
              <Button onClick={closeCart} className="mt-4">
                {t("continueShopping")}
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.offeringId}
                className="flex gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100"
              >
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-surface-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-surface-900 text-sm line-clamp-1">
                        {language === "ar" && item.productNameAr ? item.productNameAr : item.productName}
                      </h4>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {item.supplierName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.offeringId)}
                      className="text-surface-400 hover:text-danger-500 p-1"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-surface-200">
                      <button
                        onClick={() => updateQuantity(item.offeringId, item.quantity - 1)}
                        className="p-1.5 text-surface-500 hover:text-surface-700 disabled:opacity-50"
                        disabled={item.quantity <= item.minOrderQty}
                        aria-label={t("decrease")}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.offeringId, item.quantity + 1)}
                        className="p-1.5 text-surface-500 hover:text-surface-700"
                        aria-label={t("increase")}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-surface-900">
                      {formatCurrency(item.price * item.quantity)} {item.currency}
                    </div>
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    {formatCurrency(item.price)} {item.currency}/{item.unit}
                    <span className="mx-1">·</span>
                    {t("minOrder")}: {item.minOrderQty}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-surface-200 p-5 space-y-4">
            <div className="space-y-1">
              {Object.entries(totalsByCurrency).map(([currency, total]) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">{t("subtotal")} ({currency})</span>
                  <span className="font-bold text-surface-900">
                    {formatCurrency(total)} {currency}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-surface-500">{t("cartRfqHint")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={clearCart}>
                {t("clearCart")}
              </Button>
              <Link href="/marketplace/rfq" onClick={closeCart} className="contents">
                <Button>{t("proceedToRFQ")}</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
