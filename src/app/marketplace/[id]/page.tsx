"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Package,
  Star,
  MapPin,
  CheckCircle2,
  FileText,
  Heart,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import OfferingsTable from "@/components/marketplace/OfferingsTable";
import { Button, Badge, Skeleton } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import {
  getProductDetails,
  type MarketplaceProductDetail,
} from "@/lib/marketplace";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProductDetails(id)
      .then((res) => {
        if (res.success) {
          setProduct(res.data);
          const primary = res.data.images?.find((i) => i.isPrimary)?.url || res.data.images?.[0]?.url;
          setSelectedImage(primary || null);
        } else {
          setError(t("productNotFound"));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("errorLoadingProduct"));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const displayName =
    language === "ar" && product?.nameAr
      ? product.nameAr
      : language === "ur" && product?.nameUr
        ? product.nameUr
        : product?.name || "";

  const displayDescription =
    language === "ar" && product?.descriptionAr
      ? product.descriptionAr
      : language === "ur" && product?.descriptionUr
        ? product.descriptionUr
        : product?.description || "";

  const bestPrice = product?.offerings?.length
    ? [...product.offerings].sort((a, b) => a.price - b.price)[0]
    : null;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-sm text-surface-500">
            <Link href="/" className="hover:text-surface-900">
              {t("navHome")}
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <Link href="/marketplace" className="hover:text-surface-900">
              {t("navMarketplace")}
            </Link>
            {product?.category && (
              <>
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>
                  {language === "ar" && product.category.nameAr
                    ? product.category.nameAr
                    : product.category.name}
                </span>
              </>
            )}
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-surface-900 font-medium truncate max-w-[200px]">
              {displayName}
            </span>
          </nav>
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("errorLoadingProduct")}</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {product && !loading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div className="aspect-square bg-surface-100 rounded-xl border border-surface-200 flex items-center justify-center overflow-hidden">
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-surface-300" />
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className={`w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0 ${
                          selectedImage === img.url ? "border-brand-500 ring-2 ring-brand-500" : "border-surface-200"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt || displayName}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.category && (
                    <Badge variant="brand">
                      {language === "ar" && product.category.nameAr
                        ? product.category.nameAr
                        : product.category.name}
                    </Badge>
                  )}
                  <Badge variant={product.inStock ? "success" : "neutral"}>
                    {product.inStock ? t("inStock") : t("madeToOrder")}
                  </Badge>
                  <Badge variant="neutral">{product.sku}</Badge>
                </div>

                <h1 className="text-3xl font-bold text-surface-900">{displayName}</h1>
                {product.brand && (
                  <p className="text-surface-500">
                    {t("brand")}: <span className="font-medium text-surface-900">{product.brand.name}</span>
                  </p>
                )}

                <div className="flex items-center gap-6">
                  {bestPrice ? (
                    <div>
                      <div className="text-3xl font-extrabold text-surface-900">
                        {formatCurrency(bestPrice.price)} {bestPrice.currency}
                      </div>
                      <div className="text-sm text-surface-500">
                        {t("from")} {product.offerings.length} {t("suppliers")}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-surface-700">{t("priceOnRequest")}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-warning-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-xl font-bold">4.8</span>
                    </div>
                    <span className="text-sm text-surface-500">
                      {product._count?.reviews || 0} {t("reviews")}
                    </span>
                  </div>
                </div>

                <p className="text-surface-600 leading-relaxed">{displayDescription}</p>

                <div className="flex items-center gap-3">
                  <Link href={`/marketplace/rfq?productId=${product.id}`} className="contents">
                    <Button size="lg">{t("requestQuote")}</Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    <Heart className="w-4 h-4" />
                    {t("addToFavorites")}
                  </Button>
                </div>

                {product.specifications && product.specifications.length > 0 && (
                  <div className="bg-white rounded-xl border border-surface-200 p-5">
                    <h3 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t("technicalSpecifications")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {product.specifications.map((spec) => (
                        <div key={spec.id} className="bg-surface-50 rounded-lg p-3">
                          <div className="text-xs text-surface-500">
                            {language === "ar" && spec.nameAr ? spec.nameAr : spec.name}
                          </div>
                          <div className="font-medium text-surface-900">
                            {language === "ar" && spec.valueAr ? spec.valueAr : spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-surface-600">
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  <span>
                    {t("availableStock")}: {product.totalAvailableQty} {product.unit?.symbol || ""}
                  </span>
                  {bestPrice?.supplier.city && (
                    <>
                      <span className="mx-2">·</span>
                      <MapPin className="w-4 h-4" />
                      <span>{bestPrice.supplier.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <OfferingsTable product={product} />
          </>
        )}
      </main>
    </div>
  );
}
