"use client";

import { Button, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/cart";
import type { TranslationKey } from "@/lib/translations";
import type { MarketplaceProductDetail, MarketplaceOffering } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Star, MapPin, CheckCircle2 } from "lucide-react";

interface OfferingsTableProps {
  product: MarketplaceProductDetail;
}

function getSupplierName(supplier: MarketplaceOffering["supplier"], language: string) {
  if (language === "ar" && supplier.companyNameAr) return supplier.companyNameAr;
  return supplier.companyName;
}

function getVerificationChip(
  level: string,
  t: (key: TranslationKey) => string
) {
  const variantMap: Record<string, "success" | "warning" | "neutral" | "brand" | "danger" | "info"> = {
    TRUSTED: "success",
    VERIFIED: "brand",
    BASIC: "neutral",
    PREMIUM: "warning",
    FLAGSHIP: "warning",
  };
  const key = `verification${level}` as TranslationKey;
  return <Badge variant={variantMap[level] || "neutral"}>{t(key) || level}</Badge>;
}

export default function OfferingsTable({ product }: OfferingsTableProps) {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const imageUrl = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
        <h3 className="font-semibold text-surface-900">{t("supplierOfferings")}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 text-surface-600">
            <tr>
              <th className="text-start px-4 py-3 font-medium">{t("supplier")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("price")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("minOrder")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("leadTime")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("stock")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("verification")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {product.offerings?.map((offering) => {
              const stock = offering.stock?.reduce((s, st) => s + (st.availableQty ?? 0), 0) ?? 0;
              return (
                <tr key={offering.id} className="hover:bg-surface-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-surface-900">
                      {getSupplierName(offering.supplier, language)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500 mt-1">
                      {offering.supplier.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {offering.supplier.city}
                        </span>
                      )}
                      {offering.supplier.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                          {offering.supplier.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-surface-900">
                      {formatCurrency(offering.price)} {offering.currency}
                    </div>
                    {offering.isAuthorized && (
                      <div className="flex items-center gap-1 text-xs text-success-600 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("authorized")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {offering.minOrderQty} {product.unit?.symbol || ""}
                  </td>
                  <td className="px-4 py-3">
                    {offering.leadTimeDays
                      ? `${offering.leadTimeDays} ${t("days")}`
                      : t("contactSupplier")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={stock > 0 ? "success" : "neutral"}>
                      {stock > 0 ? stock : t("madeToOrder")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {getVerificationChip(offering.supplier.verificationLevel, t)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        addItem({
                          offeringId: offering.id,
                          productId: product.id,
                          productName: product.name,
                          productNameAr: product.nameAr,
                          supplierId: offering.supplier.id,
                          supplierName: offering.supplier.companyName,
                          price: offering.price,
                          currency: offering.currency,
                          unit: product.unit?.symbol || product.unit?.name || "",
                          quantity: Math.max(offering.minOrderQty, 1),
                          minOrderQty: offering.minOrderQty,
                          imageUrl,
                        })
                      }
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t("addToCart")}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {(!product.offerings || product.offerings.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-surface-500">
                  {t("noOfferingsAvailable")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
