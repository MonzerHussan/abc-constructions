"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowRight, X } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { PR_PRIORITIES } from "@/lib/constants"

interface PRItem {
  materialName: string
  description: string
  quantity: number
  unit: string
  estimatedPrice: number
  total: number
}

const defaultItem: PRItem = { materialName: "", description: "", quantity: 1, unit: "قطعة", estimatedPrice: 0, total: 0 }

export default function NewPurchaseRequestPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    expectedDelivery: "",
    deliveryLocation: "",
    notes: "",
  })
  const [items, setItems] = useState<PRItem[]>([{ ...defaultItem }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const updateItem = (index: number, field: keyof PRItem, value: string | number) => {
    const newItems = items.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === "quantity" || field === "estimatedPrice") {
        updated.total = (field === "quantity" ? Number(value) : item.quantity) * (field === "estimatedPrice" ? Number(value) : item.estimatedPrice)
      }
      return updated
    })
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { ...defaultItem }])

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.category) { setError("العنوان والفئة مطلوبان"); return }
    if (items.some((i) => !i.materialName)) { setError("جميع البنود يجب أن تحتوي على اسم مادة"); return }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expectedDelivery: form.expectedDelivery || undefined,
          items: items.map(({ materialName, description, quantity, unit, estimatedPrice, total }) => ({
            materialName, description, quantity, unit, estimatedPrice, total,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "فشل الإنشاء")
      }

      router.push("/projects/ABC/procurement/purchase-requests")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-100 rounded-lg">
          <ArrowRight className="w-5 h-5 text-surface-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("createPurchaseRequest")}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? "تقديم طلب شراء مواد جديدة" : "Submit a new material purchase request"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-surface-900">
            {language === "ar" ? "معلومات الطلب" : "Request Information"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("prTitle")} *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder={language === "ar" ? "مثال: طلب شراء حديد تسليح" : "e.g. Steel Reinforcement Purchase"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("prCategory")} *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none">
                <option value="">{language === "ar" ? "اختر الفئة" : "Select category"}</option>
                {["حديد", "أسمنت", "رمل", "طوب", "بلاط", "دهانات", "كابلات", "أنابيب", "خشب", "زجاج", "عوازل", "أخرى"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("prPriority")}</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none">
                {Object.entries(PR_PRIORITIES).map(([key, val]) => (
                  <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("expectedDelivery")}</label>
              <input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("deliveryLocation")}</label>
              <input value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder={language === "ar" ? "موقع التوصيل" : "Delivery location"} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("description")}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder={language === "ar" ? "وصف الطلب..." : "Request description..."} />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900">{t("prItems")}</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg">
              <Plus className="w-4 h-4" /> {t("addItem")}
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-surface-700">
                    {language === "ar" ? `بند ${index + 1}` : `Item ${index + 1}`}
                  </span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="p-1 hover:bg-danger-50 rounded text-danger-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="col-span-2 md:col-span-2">
                    <label className="block text-xs text-surface-500 mb-1">{t("prItemName")} *</label>
                    <input value={item.materialName} onChange={(e) => updateItem(index, "materialName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder={language === "ar" ? "اسم المادة" : "Material name"} />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 mb-1">{t("prItemQuantity")}</label>
                    <input type="number" min={0} step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 mb-1">{t("prItemUnit")}</label>
                    <select value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none">
                      {["قطعة", "طن", "كجم", "متر", "متر مربع", "متر مكعب", "لتر", "كيس", "علبة", "رول"].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 mb-1">{t("prItemEstPrice")}</label>
                    <input type="number" min={0} step="0.01" value={item.estimatedPrice} onChange={(e) => updateItem(index, "estimatedPrice", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
                  </div>
                </div>
                {item.total > 0 && (
                  <p className="text-xs text-surface-500 mt-2">
                    {language === "ar" ? `الإجمالي: ${item.total.toFixed(2)} ريال` : `Total: ${item.total.toFixed(2)} SAR`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <label className="block text-sm font-medium text-surface-700 mb-1">{"ملاحظات"}</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder={language === "ar" ? "ملاحظات إضافية..." : "Additional notes..."} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">
            {t("cancel")}
          </button>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {submitting
              ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
              : (language === "ar" ? "تقديم الطلب" : "Submit Request")}
          </button>
        </div>
      </form>
    </div>
  )
}
