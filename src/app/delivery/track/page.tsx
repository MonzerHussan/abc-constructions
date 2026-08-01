"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Truck,
  MapPin,
  Phone,
  Star,
  Clock,
  Package,
  CheckCircle2,
  Navigation,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

const mockOrder = {
  orderNumber: "DLV-2026-001",
  status: "IN_TRANSIT",
  trackingCode: "TRK-ABC-001",
  pickupAddress: "مستودع الرياض الرئيسي - حي الصناعية",
  deliveryAddress: "موقع المشروع - حي الملقا",
  materialType: "أسمنت",
  description: "50 كيس أسمنت بورتلاندي",
  quantity: 50,
  weight: 2500,
  totalPrice: 380,
  estimatedTime: "45 دقيقة",
  estimatedArrival: "10:45 ص",
  driver: {
    name: "أحمد الراشد",
    phone: "0501234567",
    rating: 4.8,
    totalTrips: 342,
    vehicleType: "شاحنة صغيرة",
    plateNumber: "أ ب ج 1234",
  },
  currentLocation: "طريق الملك فهد - تقاطع طريق العليا",
  timeline: [
    { time: "10:00 ص", status: "تم الطلب", done: true },
    { time: "10:05 ص", status: "تم قبول الطلب", done: true },
    { time: "10:15 ص", status: "السائق في طريقه للاستلام", done: true },
    { time: "10:30 ص", status: "تم استلام الشحنة", done: true },
    { time: "10:35 ص", status: "في الطريق إلى الوجهة", done: true, current: true },
    { time: "10:45 ص", status: "الوصول المتوقع", done: false },
  ],
};

export default function TrackDeliveryPage() {
  const { t } = useLanguage();
  const [trackingCode, setTrackingCode] = useState("TRK-ABC-001");

  const statusSteps = [
    { key: "REQUESTED", label: t("newDelivery"), icon: Package },
    { key: "DRIVER_ASSIGNED", label: t("driverInfo"), icon: Truck },
    { key: "PICKING_UP", label: t("pickupInProgress"), icon: Navigation },
    { key: "IN_TRANSIT", label: t("activeDelivery"), icon: Truck },
    { key: "DELIVERED", label: t("delivered"), icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === mockOrder.status);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: t("navDelivery"), href: "/delivery" },
            { label: t("trackDelivery") },
          ]}
        />

        <h1 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-2">
          <Navigation className="w-7 h-7 text-emerald-600" />
          {t("trackDelivery")}
        </h1>

        <Card className="p-6 mb-6">
          <div className="flex gap-3">
            <input type="text" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder={t("enterTrackingCode")} className="flex-1 px-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">{t("track")}</button>
          </div>
        </Card>

        {trackingCode && (
          <>
            <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{t("orderSummary")}</p>
                  <p className="text-xl font-bold">{mockOrder.orderNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-white/80 text-sm">{t("estimatedArrival")}</p>
                  <p className="text-xl font-bold">{mockOrder.estimatedArrival}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStepIndex ? "bg-emerald-500 text-white" : "bg-surface-200 text-surface-400"} ${i === currentStepIndex ? "ring-4 ring-emerald-200" : ""}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs mt-2 text-center ${i <= currentStepIndex ? "text-emerald-600 font-medium" : "text-surface-400"}`}>{step.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-surface-900 mb-4">{t("currentLocation")}</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl h-64 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 rounded-xl" />
                  <Navigation className="w-12 h-12 text-emerald-400 relative z-10 animate-pulse" />
                  <p className="text-sm text-emerald-600 mt-2 relative z-10 font-medium">{mockOrder.currentLocation}</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-surface-900 mb-4">{t("driverInfo")}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Truck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-surface-900">{mockOrder.driver.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                      <span className="text-sm font-medium">{mockOrder.driver.rating}</span>
                      <span className="text-xs text-surface-500">({mockOrder.driver.totalTrips})</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-surface-50 rounded-lg">
                    <span className="text-surface-500">{t("vehicle")}</span>
                    <span className="font-medium">{mockOrder.driver.vehicleType}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-surface-50 rounded-lg">
                    <span className="text-surface-500">{t("plateNumber")}</span>
                    <span className="font-medium" dir="ltr">{mockOrder.driver.plateNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-surface-50 rounded-lg">
                    <span className="text-surface-500">{t("remainingTime")}</span>
                    <span className="font-medium text-emerald-600">{mockOrder.estimatedTime}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <a href={`tel:${mockOrder.driver.phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">
                    <Phone className="w-4 h-4" />
                    {t("call")}
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-300 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-50">
                    <MessageSquare className="w-4 h-4" />
                    {t("message")}
                  </button>
                </div>
              </Card>
            </div>

            <Card className="p-6 mt-6">
              <h3 className="font-bold text-surface-900 mb-4">{t("trackingHistory")}</h3>
              <div className="space-y-0">
                {mockOrder.timeline.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.done ? event.current ? "bg-emerald-500 text-white ring-4 ring-emerald-200" : "bg-emerald-500 text-white" : "bg-surface-200 text-surface-400"}`}>
                        {event.done ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-surface-400 rounded-full" />}
                      </div>
                      {i < mockOrder.timeline.length - 1 && <div className={`w-0.5 h-8 ${event.done ? "bg-emerald-500" : "bg-surface-200"}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${event.current ? "text-emerald-600" : event.done ? "text-surface-900" : "text-surface-400"}`}>{event.status}</p>
                      <p className="text-xs text-surface-500">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-bold text-surface-900 mb-4">{t("orderSummary")}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-surface-500">{t("from")}</p><p className="font-medium">{mockOrder.pickupAddress}</p></div>
                <div><p className="text-surface-500">{t("to")}</p><p className="font-medium">{mockOrder.deliveryAddress}</p></div>
                <div><p className="text-surface-500">{t("materialType")}</p><p className="font-medium">{mockOrder.materialType}</p></div>
                <div><p className="text-surface-500">{t("quantity")}</p><p className="font-medium">{mockOrder.quantity} ({mockOrder.weight} kg)</p></div>
                <div><p className="text-surface-500">{t("track")}</p><p className="font-medium font-mono">{mockOrder.trackingCode}</p></div>
                <div><p className="text-surface-500">{t("deliveryCost")}</p><p className="font-bold text-emerald-600 text-lg">{mockOrder.totalPrice} {t("currency")}</p></div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
