"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { StatusBadge, Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Truck,
  Plus,
  MapPin,
  Clock,
  Package,
  Search,
  ArrowLeft,
  Star,
  Shield,
  Zap,
  DollarSign,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCw,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

const mockOrders = [
  {
    id: "1",
    orderNumber: "DLV-2026-001",
    status: "IN_TRANSIT",
    priority: "URGENT",
    pickupAddress: "مستودع الرياض الرئيسي - حي الصناعية",
    deliveryAddress: "موقع المشروع - حي الملقا",
    materialType: "أسمنت",
    description: "50 كيس أسمنت بورتلاندي",
    weight: 2500,
    quantity: 50,
    basePrice: 200,
    distanceFee: 80,
    urgentFee: 100,
    totalPrice: 380,
    driverName: "أحمد الراشد",
    driverRating: 4.8,
    vehicleType: "TRUCK_SMALL",
    plateNumber: "أ ب ج 1234",
    estimatedTime: "45 دقيقة",
    trackingCode: "TRK-ABC-001",
    createdAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "2",
    orderNumber: "DLV-2026-002",
    status: "DELIVERED",
    priority: "NORMAL",
    pickupAddress: "محل السيراميك - حي النخيل",
    deliveryAddress: "مشروع فيلا الراشد - حي الياسمين",
    materialType: "بلاط",
    description: "100 م² بلاط سيراميك",
    weight: 800,
    quantity: 100,
    basePrice: 150,
    distanceFee: 50,
    urgentFee: 0,
    totalPrice: 200,
    driverName: "خالد المطيري",
    driverRating: 4.9,
    vehicleType: "PICKUP",
    plateNumber: "س ع د 5678",
    estimatedTime: "30 دقيقة",
    trackingCode: "TRK-ABC-002",
    createdAt: "2026-07-27T14:00:00Z",
  },
  {
    id: "3",
    orderNumber: "DLV-2026-003",
    status: "REQUESTED",
    priority: "NORMAL",
    pickupAddress: "مصنع الألمنيوم - المنطقة الصناعية",
    deliveryAddress: "مبنى الأعمال المركزي - العليا",
    materialType: "ألمنيوم",
    description: "نوافذ ألمنيوم - 20 نافذة",
    weight: 600,
    quantity: 20,
    basePrice: 300,
    distanceFee: 120,
    urgentFee: 0,
    totalPrice: 420,
    driverName: null,
    driverRating: null,
    vehicleType: "TRUCK_MEDIUM",
    plateNumber: null,
    estimatedTime: null,
    trackingCode: "TRK-ABC-003",
    createdAt: "2026-07-28T09:00:00Z",
  },
  {
    id: "4",
    orderNumber: "DLV-2026-004",
    status: "PICKING_UP",
    priority: "SCHEDULED",
    pickupAddress: "مؤسسة الحديد - الدمام",
    deliveryAddress: "مشروع المستشفى - جدة",
    materialType: "حديد",
    description: "10 طن حديد تسليم بيتون",
    weight: 10000,
    quantity: 10,
    basePrice: 1500,
    distanceFee: 800,
    urgentFee: 0,
    totalPrice: 2300,
    driverName: "سعد العتيبي",
    driverRating: 4.7,
    vehicleType: "FLATBED",
    plateNumber: "ه و ز 9012",
    estimatedTime: "4 ساعات",
    trackingCode: "TRK-ABC-004",
    createdAt: "2026-07-27T08:00:00Z",
  },
];

export default function DeliveryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    REQUESTED: { label: t("available"), color: "bg-warning-100 text-warning-800" },
    PENDING_DRIVER: { label: t("available"), color: "bg-info-100 text-info-800" },
    DRIVER_ASSIGNED: { label: t("available"), color: "bg-flagship-100 text-flagship-800" },
    PICKING_UP: { label: t("pickupInProgress"), color: "bg-flagship-100 text-flagship-800" },
    IN_TRANSIT: { label: t("activeDelivery"), color: "bg-info-100 text-info-800" },
    DELIVERED: { label: t("delivered"), color: "bg-success-100 text-success-800" },
    CANCELLED: { label: t("closed"), color: "bg-danger-100 text-danger-800" },
  };

  const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    NORMAL: { label: t("normal"), color: "bg-surface-100 text-surface-800" },
    URGENT: { label: t("urgent"), color: "bg-danger-100 text-danger-800" },
    SCHEDULED: { label: t("scheduled"), color: "bg-info-100 text-info-800" },
  };

  const VEHICLE_LABELS: Record<string, string> = {
    MOTORCYCLE: t("motorcycle"),
    PICKUP: t("pickup"),
    TRUCK_SMALL: t("truckSmall"),
    TRUCK_MEDIUM: t("truckMedium"),
    TRUCK_LARGE: t("truckLarge"),
    FLATBED: t("flatbed"),
    CRANE_TRUCK: t("craneTruck"),
  };

  const stats = [
    { label: t("activeDelivery"), value: "18", icon: Truck, color: "bg-info-50 text-info-600" },
    { label: t("delivered"), value: "12", icon: CheckCircle2, color: "bg-success-50 text-success-600" },
    { label: t("available"), value: "45", icon: Shield, color: "bg-flagship-50 text-flagship-600" },
    { label: t("avgRating"), value: "4.8", icon: Star, color: "bg-amber-50 text-amber-600" },
  ];

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === "active") return order.status !== "DELIVERED" && order.status !== "CANCELLED";
    if (activeTab === "completed") return order.status === "DELIVERED";
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navDelivery") }]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-emerald-600" />
              {t("deliveryTitle")}
            </h1>
            <p className="text-surface-600 mt-1">
              {t("deliveryDescription")}
            </p>
          </div>
          <Link
            href="/projects/ABC/delivery/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("newDelivery")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                  <p className="text-xs text-surface-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-surface-900 mb-4">{t("howItWorks")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: "1", title: t("step1Title"), desc: t("step1Desc") },
              { icon: "2", title: t("step2Title"), desc: t("step2Desc") },
              { icon: "3", title: t("step3Title"), desc: t("step3Desc") },
              { icon: "4", title: t("step4Title"), desc: t("step4Desc") },
            ].map((step) => (
              <div key={step.icon} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <p className="font-medium text-surface-900 text-sm">{step.title}</p>
                  <p className="text-xs text-surface-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Vehicle types */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-surface-900 mb-4">{t("vehicleTypes")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(VEHICLE_LABELS).map(([key, label]) => (
              <div key={key} className="text-center p-3 bg-surface-50 rounded-xl">
                <Truck className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-surface-700">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Track by code */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-surface-900 mb-4">{t("trackDelivery")}</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="أدخل كود التتبع (مثال: TRK-ABC-001)"
              className="flex-1 px-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <Link
              href="/projects/ABC/delivery/track"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              {t("track")}
            </Link>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "all" as const, label: t("all"), count: mockOrders.length },
            { key: "active" as const, label: t("active"), count: mockOrders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length },
            { key: "completed" as const, label: t("completed"), count: mockOrders.filter((o) => o.status === "DELIVERED").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} hover className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-lg font-bold text-surface-900">
                      {order.orderNumber}
                    </h3>
                    <StatusBadge {...STATUS_LABELS[order.status]} />
                    <StatusBadge {...PRIORITY_LABELS[order.priority]} />
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
                      {order.materialType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-success-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">{t("pickupLocation")}</p>
                        <p className="text-sm font-medium text-surface-900">{order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-danger-500" />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">{t("deliveryLocation")}</p>
                        <p className="text-sm font-medium text-surface-900">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-surface-600 mb-3">{order.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {order.quantity} وحدة • {order.weight} كجم
                    </span>
                    {order.driverName && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {order.driverName}
                        <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                        {order.driverRating}
                      </span>
                    )}
                    {order.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.estimatedTime}
                      </span>
                    )}
                    <span className="text-xs text-surface-400">
                      كود التتبع: {order.trackingCode}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[160px]">
                  <div className="text-left mb-2">
                    <span className="text-2xl font-bold text-emerald-600">
                      {order.totalPrice.toLocaleString("ar-EG")}
                    </span>
                    <span className="text-sm text-surface-500 mr-1">{t("currency")}</span>
                  </div>
                  <Link
                    href={`/projects/ABC/delivery/track?code=${order.trackingCode}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    {t("track")}
                  </Link>
                  <Link
                    href={`/projects/ABC/delivery/${order.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-300 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t("viewDetails")}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Driver CTA */}
        <Card className="p-8 mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">{t("becomeDriver")}</h2>
              <p className="text-white/80">
                {t("becomeDriverDesc")}
              </p>
            </div>
            <Link
              href="/projects/ABC/delivery/driver"
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-surface-100 transition-colors whitespace-nowrap"
            >
              {t("registerAsDriver")}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
