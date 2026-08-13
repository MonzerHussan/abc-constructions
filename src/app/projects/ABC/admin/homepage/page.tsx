"use client"

import { useState, useEffect, useCallback } from "react"
import {
  LayoutDashboard, Image as ImageIcon, Video as VideoIcon, Megaphone,
  Plus, Trash2, Save, Loader2, ChevronUp, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "content" | "slides" | "videos" | "ads"

interface ContentForm {
  introTitle: string
  introTitleEn: string
  introTitleUr: string
  introBody: string
  introBodyEn: string
  introBodyUr: string
  visionTitle: string
  visionTitleEn: string
  visionTitleUr: string
  visionBody: string
  visionBodyEn: string
  visionBodyUr: string
  primaryCtaLabel: string
  primaryCtaLabelEn: string
  primaryCtaLabelUr: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaLabelEn: string
  secondaryCtaLabelUr: string
  secondaryCtaHref: string
  isActive: boolean
}

interface SlideItem {
  id: string
  title: string
  titleEn: string
  titleUr: string
  subtitle: string
  subtitleEn: string
  subtitleUr: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
  isActive: boolean
}

interface VideoItem {
  id: string
  title: string
  titleEn: string
  titleUr: string
  description: string
  descriptionEn: string
  descriptionUr: string
  videoUrl: string
  posterUrl: string
  sortOrder: number
  isActive: boolean
}

interface AdItem {
  id: string
  title: string
  titleEn: string
  titleUr: string
  subtitle: string
  subtitleEn: string
  subtitleUr: string
  imageUrl: string
  linkUrl: string
  animation: string
  sortOrder: number
  isActive: boolean
}

const EMPTY_CONTENT: ContentForm = {
  introTitle: "", introTitleEn: "", introTitleUr: "",
  introBody: "", introBodyEn: "", introBodyUr: "",
  visionTitle: "", visionTitleEn: "", visionTitleUr: "",
  visionBody: "", visionBodyEn: "", visionBodyUr: "",
  primaryCtaLabel: "", primaryCtaLabelEn: "", primaryCtaLabelUr: "", primaryCtaHref: "/projects/ABC/auth/register",
  secondaryCtaLabel: "", secondaryCtaLabelEn: "", secondaryCtaLabelUr: "", secondaryCtaHref: "/projects/ABC/tenders/projects",
  isActive: true,
}

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "content", label: "محتوى الصفحة", icon: LayoutDashboard },
  { key: "slides", label: "الشرائح (Carousel)", icon: ImageIcon },
  { key: "videos", label: "الفيديوهات", icon: VideoIcon },
  { key: "ads", label: "الإعلانات", icon: Megaphone },
]

export default function AdminHomepagePage() {
  const [tab, setTab] = useState<Tab>("content")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [content, setContent] = useState<ContentForm>(EMPTY_CONTENT)
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [ads, setAds] = useState<AdItem[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/projects/ABC/api/admin/homepage")
    if (res.ok) {
      const data = await res.json()
      if (data.content) {
        const c = data.content
        setContent({
          introTitle: c.introTitle ?? "", introTitleEn: c.introTitleEn ?? "", introTitleUr: c.introTitleUr ?? "",
          introBody: c.introBody ?? "", introBodyEn: c.introBodyEn ?? "", introBodyUr: c.introBodyUr ?? "",
          visionTitle: c.visionTitle ?? "", visionTitleEn: c.visionTitleEn ?? "", visionTitleUr: c.visionTitleUr ?? "",
          visionBody: c.visionBody ?? "", visionBodyEn: c.visionBodyEn ?? "", visionBodyUr: c.visionBodyUr ?? "",
          primaryCtaLabel: c.primaryCtaLabel ?? "", primaryCtaLabelEn: c.primaryCtaLabelEn ?? "", primaryCtaLabelUr: c.primaryCtaLabelUr ?? "", primaryCtaHref: c.primaryCtaHref ?? "/projects/ABC/auth/register",
          secondaryCtaLabel: c.secondaryCtaLabel ?? "", secondaryCtaLabelEn: c.secondaryCtaLabelEn ?? "", secondaryCtaLabelUr: c.secondaryCtaLabelUr ?? "", secondaryCtaHref: c.secondaryCtaHref ?? "/projects/ABC/tenders/projects",
          isActive: c.isActive ?? true,
        })
      }
      setSlides(data.slides ?? [])
      setVideos(data.videos ?? [])
      setAds(data.ads ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveContent() {
    setSaving(true); setSaved(false)
    const res = await fetch("/projects/ABC/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  async function saveItem(resource: "slides" | "videos" | "ads", id: string | undefined, payload: any, method: string) {
    setSaving(true)
    const url = id
      ? `/projects/ABC/api/admin/homepage/${resource}/${id}`
      : `/projects/ABC/api/admin/homepage/${resource}`
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); await load() }
  }

  async function deleteItem(resource: "slides" | "videos" | "ads", id: string) {
    await fetch(`/projects/ABC/api/admin/homepage/${resource}/${id}`, { method: "DELETE" })
    await load()
  }

  async function moveItem(resource: "slides" | "videos" | "ads", list: any[], index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= list.length) return
    const next = [...list]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    const updated = next.map((el, i) => ({ ...el, sortOrder: i }))
    if (resource === "slides") setSlides(updated)
    if (resource === "videos") setVideos(updated)
    if (resource === "ads") setAds(updated)
    await saveItem(resource, item.id, { sortOrder: target }, "PATCH")
    const other = item.id
    const swapped = next[target]?.id
    if (swapped && swapped !== other) {
      await saveItem(resource, swapped, { sortOrder: index }, "PATCH")
    }
  }

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelCls = "block text-xs font-semibold text-surface-500 mb-1"

  function localeFields(base: string, labels: [string, string, string]) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {(["", "En", "Ur"] as const).map((suffix, i) => (
          <div key={suffix}>
            <label className={labelCls}>{labels[i]}</label>
            <input
              className={inputCls}
              value={(content as any)[base + suffix]}
              onChange={(e) => setContent({ ...content, [base + suffix]: e.target.value })}
            />
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-surface-500">
        <Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">إدارة الصفحة الرئيسية</h1>
        <p className="text-surface-500 mt-1">تعديل الأقسام الخمسة: النص التعريفي، الفيديوهات، الشرائح، والإعلانات</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                tab === t.key
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg text-sm">
          تم الحفظ بنجاح
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-6">
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">النص التعريفي (المقدمة)</h2>
            {localeFields("introTitle", ["العنوان (عربي)", "العنوان (إنجليزي)", "العنوان (أردو)"])}
            <div className="mt-3">
              <label className={labelCls}>النص التعريفي (عربي / إنجليزي / أردو)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBody}
                onChange={(e) => setContent({ ...content, introBody: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>النص التعريفي (إنجليزي)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBodyEn}
                onChange={(e) => setContent({ ...content, introBodyEn: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>النص التعريفي (أردو)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBodyUr}
                onChange={(e) => setContent({ ...content, introBodyUr: e.target.value })}
              />
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">الرؤية</h2>
            {localeFields("visionTitle", ["عنوان الرؤية (عربي)", "عنوان الرؤية (إنجليزي)", "عنوان الرؤية (أردو)"])}
            <div className="mt-3">
              <label className={labelCls}>نص الرؤية (عربي)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBody}
                onChange={(e) => setContent({ ...content, visionBody: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>نص الرؤية (إنجليزي)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBodyEn}
                onChange={(e) => setContent({ ...content, visionBodyEn: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>نص الرؤية (أردو)</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBodyUr}
                onChange={(e) => setContent({ ...content, visionBodyUr: e.target.value })}
              />
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">أزرار الدعوة للعمل</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>الزر الأساسي (عربي)</label>
                <input className={inputCls} value={content.primaryCtaLabel} onChange={(e) => setContent({ ...content, primaryCtaLabel: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الزر الأساسي (إنجليزي)</label>
                <input className={inputCls} value={content.primaryCtaLabelEn} onChange={(e) => setContent({ ...content, primaryCtaLabelEn: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الزر الأساسي (أردو)</label>
                <input className={inputCls} value={content.primaryCtaLabelUr} onChange={(e) => setContent({ ...content, primaryCtaLabelUr: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الرابط الأساسي</label>
                <input className={inputCls} value={content.primaryCtaHref} onChange={(e) => setContent({ ...content, primaryCtaHref: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الزر الثانوي (عربي)</label>
                <input className={inputCls} value={content.secondaryCtaLabel} onChange={(e) => setContent({ ...content, secondaryCtaLabel: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الزر الثانوي (إنجليزي)</label>
                <input className={inputCls} value={content.secondaryCtaLabelEn} onChange={(e) => setContent({ ...content, secondaryCtaLabelEn: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الزر الثانوي (أردو)</label>
                <input className={inputCls} value={content.secondaryCtaLabelUr} onChange={(e) => setContent({ ...content, secondaryCtaLabelUr: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الرابط الثانوي</label>
                <input className={inputCls} value={content.secondaryCtaHref} onChange={(e) => setContent({ ...content, secondaryCtaHref: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-medium text-surface-700">
              <input type="checkbox" checked={content.isActive} onChange={(e) => setContent({ ...content, isActive: e.target.checked })} />
              تفعيل هذا المحتوى
            </label>
          </section>

          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ المحتوى
          </button>
        </div>
      )}

      {tab === "slides" && (
        <SlidesEditor
          items={slides}
          setItems={setSlides}
          onSave={(id, payload, method) => saveItem("slides", id, payload, method)}
          onDelete={(id) => deleteItem("slides", id)}
          onMove={(i, d) => moveItem("slides", slides, i, d)}
          saving={saving}
        />
      )}

      {tab === "videos" && (
        <VideosEditor
          items={videos}
          setItems={setVideos}
          onSave={(id, payload, method) => saveItem("videos", id, payload, method)}
          onDelete={(id) => deleteItem("videos", id)}
          onMove={(i, d) => moveItem("videos", videos, i, d)}
          saving={saving}
        />
      )}

      {tab === "ads" && (
        <AdsEditor
          items={ads}
          setItems={setAds}
          onSave={(id, payload, method) => saveItem("ads", id, payload, method)}
          onDelete={(id) => deleteItem("ads", id)}
          onMove={(i, d) => moveItem("ads", ads, i, d)}
          saving={saving}
        />
      )}
    </div>
  )
}

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
const labelCls = "block text-xs font-semibold text-surface-500 mb-1"

function localeRow(labels: [string, string, string], value: { ar: string; en: string; ur: string }, onChange: (v: { ar: string; en: string; ur: string }) => void) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div>
        <label className={labelCls}>{labels[0]}</label>
        <input className={inputCls} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>{labels[1]}</label>
        <input className={inputCls} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>{labels[2]}</label>
        <input className={inputCls} value={value.ur} onChange={(e) => onChange({ ...value, ur: e.target.value })} />
      </div>
    </div>
  )
}

function EditorCard({ title, onDelete, onMoveUp, onMoveDown, children }: {
  title: string
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-surface-900">{title}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100" title="تحريك لأعلى">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={onMoveDown} className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100" title="تحريك لأسفل">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-danger-500 hover:text-danger-700 rounded-lg hover:bg-danger-50" title="حذف">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

function NewItemButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors"
    >
      <Plus className="w-4 h-4" /> إضافة عنصر جديد
    </button>
  )
}

function SaveRow({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      حفظ التغييرات
    </button>
  )
}

function SlidesEditor({ items, setItems, onSave, onDelete, onMove, saving }: {
  items: SlideItem[]
  setItems: (items: SlideItem[]) => void
  onSave: (id: string | undefined, payload: any, method: string) => void
  onDelete: (id: string) => void
  onMove: (i: number, d: number) => void
  saving: boolean
}) {
  const [drafts, setDrafts] = useState<SlideItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<SlideItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<SlideItem>>({ title: "", imageUrl: "", subtitle: "", isActive: true })

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `شريحة ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(["العنوان (عربي)", "العنوان (إنجليزي)", "العنوان (أردو)"], { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(["الوصف (عربي)", "الوصف (إنجليزي)", "الوصف (أردو)"], { ar: item.subtitle, en: item.subtitleEn, ur: item.subtitleUr }, (v) => update(i, { subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>رابط الصورة</label>
                <input className={inputCls} value={item.imageUrl} onChange={(e) => update(i, { imageUrl: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>رابط الانتقال</label>
                <input className={inputCls} value={item.linkUrl ?? ""} onChange={(e) => update(i, { linkUrl: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
              <input type="checkbox" checked={item.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} />
              مفعّلة
            </label>
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">شريحة جديدة</h3>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div><label className={labelCls}>العنوان (عربي)</label><input className={inputCls} value={newDraft.title ?? ""} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (إنجليزي)</label><input className={inputCls} value={newDraft.titleEn ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleEn: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (أردو)</label><input className={inputCls} value={newDraft.titleUr ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleUr: e.target.value })} /></div>
            </div>
            <div>
              <label className={labelCls}>رابط الصورة</label>
              <input className={inputCls} value={newDraft.imageUrl ?? ""} onChange={(e) => setNewDraft({ ...newDraft, imageUrl: e.target.value })} />
            </div>
            <SaveRow onSave={() => { onSave(undefined, newDraft, "POST"); setShowNew(false); setNewDraft({ title: "", imageUrl: "", subtitle: "", isActive: true }) }} saving={saving} />
          </div>
        </div>
      )}

      <NewItemButton onClick={() => setShowNew((v) => !v)} saving={saving} />
    </div>
  )
}

function VideosEditor({ items, setItems, onSave, onDelete, onMove, saving }: {
  items: VideoItem[]
  setItems: (items: VideoItem[]) => void
  onSave: (id: string | undefined, payload: any, method: string) => void
  onDelete: (id: string) => void
  onMove: (i: number, d: number) => void
  saving: boolean
}) {
  const [drafts, setDrafts] = useState<VideoItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<VideoItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<VideoItem>>({ title: "", videoUrl: "", isActive: true })

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `فيديو ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(["العنوان (عربي)", "العنوان (إنجليزي)", "العنوان (أردو)"], { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(["الوصف (عربي)", "الوصف (إنجليزي)", "الوصف (أردو)"], { ar: item.description, en: item.descriptionEn, ur: item.descriptionUr }, (v) => update(i, { description: v.ar, descriptionEn: v.en, descriptionUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>رابط الفيديو (YouTube/MP4)</label>
                <input className={inputCls} value={item.videoUrl} onChange={(e) => update(i, { videoUrl: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>رابط الصورة المصغرة</label>
                <input className={inputCls} value={item.posterUrl ?? ""} onChange={(e) => update(i, { posterUrl: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
              <input type="checkbox" checked={item.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} />
              مفعّل
            </label>
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">فيديو جديد</h3>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div><label className={labelCls}>العنوان (عربي)</label><input className={inputCls} value={newDraft.title ?? ""} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (إنجليزي)</label><input className={inputCls} value={newDraft.titleEn ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleEn: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (أردو)</label><input className={inputCls} value={newDraft.titleUr ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleUr: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>رابط الفيديو</label>
                <input className={inputCls} value={newDraft.videoUrl ?? ""} onChange={(e) => setNewDraft({ ...newDraft, videoUrl: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>الصورة المصغرة</label>
                <input className={inputCls} value={newDraft.posterUrl ?? ""} onChange={(e) => setNewDraft({ ...newDraft, posterUrl: e.target.value })} />
              </div>
            </div>
            <SaveRow onSave={() => { onSave(undefined, newDraft, "POST"); setShowNew(false); setNewDraft({ title: "", videoUrl: "", isActive: true }) }} saving={saving} />
          </div>
        </div>
      )}

      <NewItemButton onClick={() => setShowNew((v) => !v)} saving={saving} />
    </div>
  )
}

function AdsEditor({ items, setItems, onSave, onDelete, onMove, saving }: {
  items: AdItem[]
  setItems: (items: AdItem[]) => void
  onSave: (id: string | undefined, payload: any, method: string) => void
  onDelete: (id: string) => void
  onMove: (i: number, d: number) => void
  saving: boolean
}) {
  const [drafts, setDrafts] = useState<AdItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<AdItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<AdItem>>({ title: "", imageUrl: "", animation: "fade", isActive: true })

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `إعلان ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(["العنوان (عربي)", "العنوان (إنجليزي)", "العنوان (أردو)"], { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(["الوصف (عربي)", "الوصف (إنجليزي)", "الوصف (أردو)"], { ar: item.subtitle, en: item.subtitleEn, ur: item.subtitleUr }, (v) => update(i, { subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>رابط الصورة</label>
                <input className={inputCls} value={item.imageUrl} onChange={(e) => update(i, { imageUrl: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>رابط الانتقال</label>
                <input className={inputCls} value={item.linkUrl ?? ""} onChange={(e) => update(i, { linkUrl: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>نوع الحركة</label>
              <select className={inputCls} value={item.animation} onChange={(e) => update(i, { animation: e.target.value })}>
                <option value="fade">تلاشي (Fade)</option>
                <option value="slide">انزلاق (Slide)</option>
                <option value="bounce">ارتداد (Bounce)</option>
                <option value="pulse">نبض (Pulse)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
              <input type="checkbox" checked={item.isActive} onChange={(e) => update(i, { isActive: e.target.checked })} />
              مفعّل
            </label>
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">إعلان جديد</h3>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div><label className={labelCls}>العنوان (عربي)</label><input className={inputCls} value={newDraft.title ?? ""} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (إنجليزي)</label><input className={inputCls} value={newDraft.titleEn ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleEn: e.target.value })} /></div>
              <div><label className={labelCls}>العنوان (أردو)</label><input className={inputCls} value={newDraft.titleUr ?? ""} onChange={(e) => setNewDraft({ ...newDraft, titleUr: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>رابط الصورة</label>
                <input className={inputCls} value={newDraft.imageUrl ?? ""} onChange={(e) => setNewDraft({ ...newDraft, imageUrl: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>نوع الحركة</label>
                <select className={inputCls} value={newDraft.animation ?? "fade"} onChange={(e) => setNewDraft({ ...newDraft, animation: e.target.value })}>
                  <option value="fade">تلاشي (Fade)</option>
                  <option value="slide">انزلاق (Slide)</option>
                  <option value="bounce">ارتداد (Bounce)</option>
                  <option value="pulse">نبض (Pulse)</option>
                </select>
              </div>
            </div>
            <SaveRow onSave={() => { onSave(undefined, newDraft, "POST"); setShowNew(false); setNewDraft({ title: "", imageUrl: "", animation: "fade", isActive: true }) }} saving={saving} />
          </div>
        </div>
      )}

      <NewItemButton onClick={() => setShowNew((v) => !v)} saving={saving} />
    </div>
  )
}
