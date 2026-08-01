"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

interface RFQItem {
  materialName: string
  description: string
  quantity: number
  unit: string
  specifications: string
}

const defaultItem: RFQItem = { materialName: "", description: "", quantity: 1, unit: "????", specifications: "" }

export default function NewRFQPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    notes: "",
  })
  const [items, setItems] = useState<RFQItem[]>([{ ...defaultItem }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const updateItem = (index: number, field: keyof RFQItem, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => setItems([...items, { ...defaultItem }])

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setError("??????? ?????"); return }
    if (items.some((i) => !i.materialName)) { setError("???? ?????? ??? ?? ????? ??? ??? ????"); return }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline || undefined,
          items: items.map(({ materialName, description, quantity, unit, specifications }) => ({
            materialName, description, quantity, unit, specifications,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "??? ???????")
      }

      router.push("/procurement/rfqs")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("createRfq")}</h1>

      {error && <div className="bg-danger-50 text-danger-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-lg">{t("rfqTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("rfqTitle")}</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">{t("rfqDeadline")}</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">{t("description")}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">{t("additionalNotes")}</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{t("prItems")}</h2>
            <button type="button" onClick={addItem} className="text-info-600 text-sm flex items-center gap-1 hover:text-info-700">
              <Plus className="w-4 h-4" /> {t("addItem")}
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-xs text-surface-500 mb-1">{t("prItemName")}</label>
                  <input value={item.materialName} onChange={e => updateItem(index, "materialName", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">{t("prItemQuantity")}</label>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, "quantity", parseInt(e.target.value) || 1)} className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">{t("prItemUnit")}</label>
                  <input value={item.unit} onChange={e => updateItem(index, "unit", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="flex items-end">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-danger-500 hover:text-danger-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-surface-500 mb-1">{t("description")}</label>
                <textarea value={item.description} onChange={e => updateItem(index, "description", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm h-16" />
              </div>
              <div className="mt-2">
                <label className="block text-xs text-surface-500 mb-1">{t("requirements")}</label>
                <textarea value={item.specifications} onChange={e => updateItem(index, "specifications", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm h-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-lg text-sm hover:bg-surface-50">{t("cancel")}</button>
          <button type="submit" disabled={submitting} className="bg-info-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-info-700 disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" /> {submitting ? t("loading") : t("createRfq")}
          </button>
        </div>
      </form>
    </div>
  )
}