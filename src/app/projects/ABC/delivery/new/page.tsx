"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card } from "@/components/ui";
import { MATERIAL_TYPES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import MapPicker from "@/components/MapPicker";
import {
  Truck,
  MapPin,
  Package,
  Clock,
  DollarSign,
  ArrowRight,
  Info,
  Weight,
  Ruler,
  AlertTriangle,
  Construction,
} from "lucide-react";
import { useState } from "react";

export default function NewDeliveryPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickupName: "",
    pickupPhone: "",
    pickupAddress: "",
    pickupNotes: "",
    deliveryName: "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryNotes: "",
    materialType: "",
    description: "",
    weight: "",
    dimensions: "",
    quantity: "1",
    fragile: false,
    needsCrane: false,
    vehicleType: "",
    priority: "NORMAL",
    paymentMethod: "CASH",
    scheduledDate: "",
    scheduledTime: "",
  });

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const vehicleOptions = [
    { type: "MOTORCYCLE", label: t("motorcycle"), capacity: "20 kg", price: "15", icon: "🏍️" },
    { type: "PICKUP", label: t("pickup"), capacity: "1,000 kg", price: "50", icon: "🛻" },
    { type: "TRUCK_SMALL", label: t("truckSmall"), capacity: "5,000 kg", price: "150", icon: "🚛" },
    { type: "TRUCK_MEDIUM", label: t("truckMedium"), capacity: "10,000 kg", price: "300", icon: "🚛" },
    { type: "TRUCK_LARGE", label: t("truckLarge"), capacity: "20,000 kg", price: "500", icon: "🚛" },
    { type: "FLATBED", label: t("flatbed"), capacity: "15,000 kg", price: "400", icon: "🚚" },
    { type: "CRANE_TRUCK", label: t("craneTruck"), capacity: "25,000 kg", price: "800", icon: "🏗️" },
  ];

  const calculatePrice = () => {
    let base = 50;
    const weight = parseInt(form.weight) || 0;
    let weightFee = 0;
    if (weight > 5000) weightFee = 200;
    else if (weight > 1000) weightFee = 100;
    else if (weight > 500) weightFee = 50;
    let urgentFee = form.priority === "URGENT" ? 100 : 0;
    return base + weightFee + urgentFee;
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: t("navDelivery"), href: "/projects/ABC/delivery" },
            { label: t("newDelivery") },
          ]}
        />

        <h1 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-2">
          <Truck className="w-7 h-7 text-emerald-600" />
          {t("newDelivery")}
        </h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-emerald-500 text-white" : "bg-surface-200 text-surface-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 rounded-full ${
                    step > s ? "bg-emerald-500" : "bg-surface-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-surface-500 mb-8">
          <span>{t("pickupLocation")}</span>
          <span>{t("shipmentDetails")}</span>
          <span>{t("confirmOrder")}</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-success-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                {t("pickupLocation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("receiverName")}</label>
                  <input type="text" value={form.pickupName} onChange={(e) => updateForm("pickupName", e.target.value)} placeholder={t("receiverName")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("receiverPhone")}</label>
                  <input type="tel" value={form.pickupPhone} onChange={(e) => updateForm("pickupPhone", e.target.value)} placeholder="05XXXXXXXX" className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("detailedAddress")}</label>
                  <MapPicker
                    value={form.pickupAddress}
                    onChange={(val, lat, lng) => updateForm("pickupAddress", val)}
                    placeholder={t("detailedAddress")}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("additionalNotes")}</label>
                  <input type="text" value={form.pickupNotes} onChange={(e) => updateForm("pickupNotes", e.target.value)} placeholder={t("additionalNotes")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center text-xs">
                  <MapPin className="w-3 h-3" />
                </div>
                {t("deliveryLocation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("receiverName")}</label>
                  <input type="text" value={form.deliveryName} onChange={(e) => updateForm("deliveryName", e.target.value)} placeholder={t("receiverName")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("receiverPhone")}</label>
                  <input type="tel" value={form.deliveryPhone} onChange={(e) => updateForm("deliveryPhone", e.target.value)} placeholder="05XXXXXXXX" className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("detailedAddress")}</label>
                  <MapPicker
                    value={form.deliveryAddress}
                    onChange={(val, lat, lng) => updateForm("deliveryAddress", val)}
                    placeholder={t("detailedAddress")}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("additionalNotes")}</label>
                  <input type="text" value={form.deliveryNotes} onChange={(e) => updateForm("deliveryNotes", e.target.value)} placeholder={t("additionalNotes")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                {t("next")}
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                {t("shipmentDetails")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("materialType")}</label>
                  <select value={form.materialType} onChange={(e) => updateForm("materialType", e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="">{t("selectMaterial")}</option>
                    {MATERIAL_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("quantity")}</label>
                  <input type="text" value={form.quantity} onChange={(e) => updateForm("quantity", e.target.value)} placeholder={t("quantity")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("weight")}</label>
                  <div className="relative">
                    <Weight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="number" value={form.weight} onChange={(e) => updateForm("weight", e.target.value)} placeholder={t("weight")} className="w-full pr-10 pl-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("dimensions")}</label>
                  <input type="text" value={form.dimensions} onChange={(e) => updateForm("dimensions", e.target.value)} placeholder={t("dimensions")} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("shipmentDescription")}</label>
                  <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder={t("shipmentDescription")} rows={3} className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none" />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.fragile} onChange={(e) => updateForm("fragile", e.target.checked)} className="w-4 h-4 text-emerald-500 border-surface-300 rounded focus:ring-emerald-500" />
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-surface-700">{t("fragile")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.needsCrane} onChange={(e) => updateForm("needsCrane", e.target.checked)} className="w-4 h-4 text-emerald-500 border-surface-300 rounded focus:ring-emerald-500" />
                    <Construction className="w-4 h-4 text-info-500" />
                    <span className="text-sm text-surface-700">{t("needsCrane")}</span>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                {t("selectVehicle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicleOptions.map((v) => (
                  <button key={v.type} onClick={() => updateForm("vehicleType", v.type)} className={`p-4 rounded-xl border-2 text-right transition-all ${form.vehicleType === v.type ? "border-emerald-500 bg-emerald-50" : "border-surface-200 hover:border-surface-300 bg-white"}`}>
                    <span className="text-2xl">{v.icon}</span>
                    <p className="font-medium text-surface-900 text-sm mt-1">{v.label}</p>
                    <p className="text-xs text-surface-500">{v.capacity}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">{t("from")} {v.price} {t("currency")}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4">{t("priority")} & {t("paymentMethod")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("priority")}</label>
                  <div className="flex gap-2">
                    {[
                      { value: "NORMAL", label: t("normal") },
                      { value: "URGENT", label: t("urgent") + " (+100)" },
                      { value: "SCHEDULED", label: t("scheduled") },
                    ].map((p) => (
                      <button key={p.value} onClick={() => updateForm("priority", p.value)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.priority === p.value ? "border-emerald-500 bg-emerald-50" : "border-surface-200 hover:border-surface-300"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("paymentMethod")}</label>
                  <div className="flex gap-2">
                    {[
                      { value: "CASH", label: t("cash") },
                      { value: "CARD", label: t("card") },
                      { value: "TRANSFER", label: t("transfer") },
                    ].map((p) => (
                      <button key={p.value} onClick={() => updateForm("paymentMethod", p.value)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.paymentMethod === p.value ? "border-emerald-500 bg-emerald-50" : "border-surface-200 hover:border-surface-300"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50">{t("back")}</button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                {t("next")}
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4">{t("orderSummary")}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-surface-500">{t("from")}</p><p className="font-medium">{form.pickupAddress || "-"}</p></div>
                  <div><p className="text-surface-500">{t("to")}</p><p className="font-medium">{form.deliveryAddress || "-"}</p></div>
                  <div><p className="text-surface-500">{t("materialType")}</p><p className="font-medium">{form.materialType || "-"}</p></div>
                  <div><p className="text-surface-500">{t("quantity")}</p><p className="font-medium">{form.quantity}</p></div>
                  <div><p className="text-surface-500">{t("weight")}</p><p className="font-medium">{form.weight || "-"} kg</p></div>
                  <div><p className="text-surface-500">{t("vehicle")}</p><p className="font-medium">{vehicleOptions.find((v) => v.type === form.vehicleType)?.label || "-"}</p></div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                {t("deliveryCost")}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">{t("basePrice")}</span>
                  <span className="font-medium">50 {t("currency")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">{t("weightFee")}</span>
                  <span className="font-medium">
                    {parseInt(form.weight) > 5000 ? "200" : parseInt(form.weight) > 1000 ? "100" : parseInt(form.weight) > 500 ? "50" : "0"} {t("currency")}
                  </span>
                </div>
                {form.priority === "URGENT" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">{t("urgentFee")}</span>
                    <span className="font-medium text-danger-600">+100 {t("currency")}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-surface-900">{t("total")}</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {calculatePrice().toLocaleString()} {t("currency")}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50">{t("back")}</button>
              <Link href="/projects/ABC/delivery?submitted=true" className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                <Truck className="w-4 h-4" />
                {t("confirmOrder")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
