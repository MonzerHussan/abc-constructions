"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, StatusBadge } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Truck,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Navigation,
  CheckCircle2,
  Package,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Wallet,
  TrendingUp,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useState } from "react";

const mockDriverStats = {
  totalEarnings: 12500,
  todayEarnings: 450,
  totalTrips: 342,
  todayTrips: 5,
  avgRating: 4.8,
  totalRatings: 280,
  completionRate: 98,
  onlineHours: 8.5,
};

const mockNearbyOrders = [
  { id: "1", orderNumber: "DLV-2026-005", pickupAddress: "محل مواد كهربائية - حي العليا", deliveryAddress: "مشروع برج الأعمال - العليا", materialType: "كابلات", description: "500 متر كابل كهربائي", weight: 120, totalPrice: 180, distance: "3.2 km", estimatedTime: "15 min", priority: "NORMAL", createdAt: "منذ 5 دقائق" },
  { id: "2", orderNumber: "DLV-2026-006", pickupAddress: "مستودع الأسمنت - حي الصناعية", deliveryAddress: "مشروع فيلا سكنية - حي النرجس", materialType: "أسمنت", description: "20 كيس أسمنت", weight: 1000, totalPrice: 250, distance: "8.5 km", estimatedTime: "25 min", priority: "URGENT", createdAt: "منذ 2 دقيقة" },
  { id: "3", orderNumber: "DLV-2026-007", pickupAddress: "ورشة ألمنيوم - حي البطحاء", deliveryAddress: "مبنى تجاري - حي الحمراء", materialType: "ألمنيوم", description: "10 نوافذ ألمنيوم", weight: 300, totalPrice: 320, distance: "5.1 km", estimatedTime: "20 min", priority: "NORMAL", createdAt: "منذ 10 دقائق" },
];

const mockActiveOrder = {
  orderNumber: "DLV-2026-008", status: "IN_TRANSIT", pickupAddress: "مؤسسة الحديد - الدمام", deliveryAddress: "مشروع المستشفى - جدة", materialType: "حديد", deliveryName: "م. عبدالله", deliveryPhone: "0551234567", totalPrice: 2300, distance: "120 km", estimatedTime: "2.5 hours",
};

export default function DriverPage() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navDelivery"), href: "/projects/ABC/delivery" }, { label: t("driverDashboard") }]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-emerald-600" />
              {t("driverDashboard")}
            </h1>
            <p className="text-surface-600 mt-1">Ahmed Al-Rashed</p>
          </div>
          <button onClick={() => setIsOnline(!isOnline)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${isOnline ? "bg-success-500 text-white" : "bg-surface-200 text-surface-600"}`}>
            {isOnline ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {isOnline ? t("available") : t("unavailable")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-success-600" /></div>
              <div><p className="text-2xl font-bold text-surface-900">{mockDriverStats.todayEarnings}</p><p className="text-xs text-surface-500">{t("earnings")} ({t("currency")})</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-info-600" /></div>
              <div><p className="text-2xl font-bold text-surface-900">{mockDriverStats.todayTrips}</p><p className="text-xs text-surface-500">{t("todayTrips")}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center"><Star className="w-5 h-5 text-warning-600" /></div>
              <div><p className="text-2xl font-bold text-surface-900">{mockDriverStats.avgRating}</p><p className="text-xs text-surface-500">{t("avgRating")}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-flagship-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-flagship-600" /></div>
              <div><p className="text-2xl font-bold text-surface-900">{mockDriverStats.completionRate}%</p><p className="text-xs text-surface-500">{t("completionRate")}</p></div>
            </div>
          </Card>
        </div>

        {mockActiveOrder && (
          <Card className="p-6 mb-6 border-2 border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-surface-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600 animate-pulse" />
                {t("activeDelivery")}
              </h2>
              <StatusBadge label={t("activeDelivery")} color="bg-emerald-100 text-emerald-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><p className="text-sm text-surface-500">{t("deliveryLocation")}</p><p className="font-medium">{mockActiveOrder.deliveryAddress}</p></div>
              <div><p className="text-sm text-surface-500">{t("receiverName")}</p><p className="font-medium">{mockActiveOrder.deliveryName}</p></div>
              <div><p className="text-sm text-surface-500">{t("remainingTime")}</p><p className="font-medium text-emerald-600">{mockActiveOrder.distance}</p></div>
              <div><p className="text-sm text-surface-500">{t("remainingTime")}</p><p className="font-medium text-emerald-600">{mockActiveOrder.estimatedTime}</p></div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${mockActiveOrder.deliveryPhone}`} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">{t("call")}</a>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50">{t("track")}</button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-300 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-50">{t("delivered")} ✓</button>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "available" as const, label: t("availableOrders"), count: mockNearbyOrders.length },
            { key: "active" as const, label: t("active"), count: 1 },
            { key: "completed" as const, label: t("completed"), count: 342 },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-emerald-500 text-white" : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activeTab === "available" && (
          <div className="space-y-4">
            {isOnline ? (
              mockNearbyOrders.map((order) => (
                <Card key={order.id} hover className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-surface-900">{order.orderNumber}</h3>
                        <StatusBadge label={order.priority === "URGENT" ? t("urgent") : t("normal")} color={order.priority === "URGENT" ? "bg-danger-100 text-danger-800" : "bg-surface-100 text-surface-800"} />
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{order.distance}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 bg-success-500 rounded-full" /></div>
                          <p className="text-surface-700">{order.pickupAddress}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                          <p className="text-surface-700">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <p className="text-sm text-surface-500 mt-2">{order.description} • {order.weight} kg</p>
                      <p className="text-xs text-surface-400 mt-1">{order.createdAt}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 lg:min-w-[140px]">
                      <p className="text-2xl font-bold text-emerald-600">{order.totalPrice} {t("currency")}</p>
                      <p className="text-xs text-surface-500">{order.estimatedTime}</p>
                      <button className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">{t("acceptOrder")}</button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Truck className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-500">{t("unavailable")}</p>
                <p className="text-sm text-surface-400 mt-1">{t("available")}</p>
              </Card>
            )}
          </div>
        )}

        <Card className="p-6 mt-6">
          <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            {t("earningsSummary")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-surface-50 rounded-xl"><p className="text-2xl font-bold text-surface-900">{mockDriverStats.totalEarnings}</p><p className="text-xs text-surface-500">{t("totalEarnings")}</p></div>
            <div className="text-center p-4 bg-surface-50 rounded-xl"><p className="text-2xl font-bold text-surface-900">{mockDriverStats.totalTrips}</p><p className="text-xs text-surface-500">{t("totalTrips")}</p></div>
            <div className="text-center p-4 bg-surface-50 rounded-xl"><p className="text-2xl font-bold text-surface-900">{mockDriverStats.onlineHours}h</p><p className="text-xs text-surface-500">{t("onlineHours")}</p></div>
            <div className="text-center p-4 bg-surface-50 rounded-xl"><p className="text-2xl font-bold text-surface-900">{(mockDriverStats.totalEarnings / mockDriverStats.totalTrips).toFixed(0)}</p><p className="text-xs text-surface-500">{t("avgEarningsPerTrip")}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
