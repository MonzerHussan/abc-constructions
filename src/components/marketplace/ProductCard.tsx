"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Heart, Package, ShoppingCart, Eye } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/cart";
import type { MarketplaceProduct, MarketplaceOffering } from "@/lib/marketplace";
import { getPrimaryImage, getBestPrice, getTotalAvailableStock } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: MarketplaceProduct;
  variant?: "grid" | "list";
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

function localizeName(product: MarketplaceProduct, language: string) {
  if (language === "ar" && product.nameAr) return product.nameAr;
  if (language === "ur" && product.nameUr) return product.nameUr;
  return product.name;
}

function localizeDescription(product: MarketplaceProduct, language: string) {
  if (language === "ar" && product.descriptionAr) return product.descriptionAr;
  if (language === "ur" && product.descriptionUr) return product.descriptionUr;
  return product.description;
}

function localizeCategory(category: { name: string; nameAr?: string } | null | undefined, language: string) {
  if (language === "ar" && category?.nameAr) return category.nameAr;
  return category?.name ?? "";
}

function getRating(product: MarketplaceProduct): number {
  if (product.offerings?.[0]?.supplier.avgRating) {
    return product.offerings[0].supplier.avgRating;
  }
  return 0;
}

function getBestOffering(product: MarketplaceProduct): MarketplaceOffering | undefined {
  if (!product.offerings?.length) return undefined;
  return [...product.offerings].sort((a, b) => a.price - b.price)[0];
}

function getSupplierName(supplier: MarketplaceOffering["supplier"], language: string) {
  if (language === "ar" && supplier.companyNameAr) return supplier.companyNameAr;
  return supplier.companyName;
}

export default function ProductCard({
  product,
  variant = "grid",
  onFavorite,
  isFavorite = false,
}: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [favorited, setFavorited] = useState(isFavorite);
  const imageUrl = getPrimaryImage(product) || undefined;
  const bestPrice = getBestPrice(product);
  const stock = getTotalAvailableStock(product);
  const inStock = stock > 0;
  const rating = getRating(product);
  const bestOffering = getBestOffering(product);
  const firstSupplier = product.offerings?.[0]?.supplier;

  const handleFavorite = () => {
    const next = !favorited;
    setFavorited(next);
    onFavorite?.(product.id);
  };

  const handleAddToCart = () => {
    if (!bestOffering || !bestPrice) return;
    addItem({
      offeringId: bestOffering.id,
      productId: product.id,
      productName: product.name,
      productNameAr: product.nameAr,
      supplierId: bestOffering.supplier.id,
      supplierName: bestOffering.supplier.companyName,
      price: bestOffering.price,
      currency: bestOffering.currency,
      unit: product.unit?.symbol || product.unit?.name || "",
      quantity: Math.max(bestOffering.minOrderQty, 1),
      minOrderQty: bestOffering.minOrderQty,
      imageUrl,
    });
  };

  if (variant === "list") {
    return (
      <Card className="p-4 flex items-center gap-4">
        <div className="w-20 h-20 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} width={80} height={80} className="object-cover w-full h-full" />
          ) : (
            <Package className="w-8 h-8 text-surface-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-surface-900 truncate">
              {localizeName(product, language)}
            </h3>
            <Badge variant="brand">{localizeCategory(product.category, language)}</Badge>
          </div>
          <p className="text-sm text-surface-600 line-clamp-1">
            {localizeDescription(product, language)}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
            {bestPrice && (
              <span className="font-bold text-brand-600">
                {formatCurrency(bestPrice.price)} {bestPrice.currency}
                {product.unit?.symbol && (
                  <span className="text-surface-500 font-normal">/{product.unit.symbol}</span>
                )}
              </span>
            )}
            {firstSupplier?.city && (
              <span className="text-surface-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {firstSupplier.city}
              </span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1 text-surface-500">
                <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                {rating.toFixed(1)}
              </span>
            )}
            <Badge variant={inStock ? "success" : "neutral"}>
              {inStock ? t("inStock") : t("madeToOrder")}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              favorited ? "bg-danger-50 text-danger-500" : "bg-surface-100 text-surface-400 hover:text-danger-500"
            }`}
            aria-label={t("addToFavorites")}
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
          </button>
          <Link href={`/marketplace/${product.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
              {t("viewDetails")}
            </Button>
          </Link>
          <Button size="sm" onClick={handleAddToCart} disabled={!bestOffering}>
            <ShoppingCart className="w-4 h-4" />
            {t("addToCart")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="h-48 bg-surface-100 flex items-center justify-center relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Package className="w-16 h-16 text-surface-300" />
        )}
        <Badge variant={inStock ? "success" : "neutral"} className="absolute top-3 end-3">
          {inStock ? t("inStock") : t("madeToOrder")}
        </Badge>
        <button
          onClick={handleFavorite}
          className={`absolute top-3 start-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            favorited
              ? "bg-danger-50 text-danger-500"
              : "bg-white/80 text-surface-400 hover:text-danger-500"
          }`}
          aria-label={t("addToFavorites")}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="brand">{localizeCategory(product.category, language)}</Badge>
          {rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="font-bold text-surface-900 mb-1 line-clamp-1">
          {localizeName(product, language)}
        </h3>
        <p className="text-sm text-surface-600 line-clamp-2 mb-3 flex-1">
          {localizeDescription(product, language)}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            {bestPrice ? (
              <span className="text-xl font-bold text-brand-600">
                {formatCurrency(bestPrice.price)}
              </span>
            ) : (
              <span className="text-sm text-surface-500">{t("priceOnRequest")}</span>
            )}
            {product.unit?.symbol && bestPrice && (
              <span className="text-sm text-surface-500 ms-1">
                {bestPrice.currency}/{product.unit.symbol}
              </span>
            )}
          </div>
          {firstSupplier?.city && (
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {firstSupplier.city}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-surface-500">
            {t("minOrder")}: {bestOffering?.minOrderQty ?? 1} {product.unit?.symbol || ""}
          </span>
          <span className="text-xs text-surface-500">
            {t("availableStock")}: {stock}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <Link href={`/marketplace/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4" />
              {t("viewDetails")}
            </Button>
          </Link>
          <Button onClick={handleAddToCart} disabled={!bestOffering}>
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
        {firstSupplier && (
          <div className="border-t mt-3 pt-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center text-xs font-medium text-surface-700">
              {getSupplierName(firstSupplier, language)[0]}
            </div>
            <span className="text-xs text-surface-600 truncate">
              {getSupplierName(firstSupplier, language)}
            </span>
            <span className="text-xs text-surface-400 whitespace-nowrap">
              ({firstSupplier.totalRatings} {t("reviews")})
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
