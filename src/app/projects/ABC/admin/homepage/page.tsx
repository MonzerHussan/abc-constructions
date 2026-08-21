"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  LayoutDashboard, Image as ImageIcon, Video as VideoIcon, Megaphone,
  Plus, Trash2, Save, Loader2, ChevronUp, ChevronDown, Upload, PanelsTopLeft,
} from "lucide-react"
import { cn, getMediaUrlIssue, isUsableMediaUrl } from "@/lib/utils"
import { useLanguage } from "@/lib/LanguageContext"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"

type Tab = "content" | "slides" | "videos" | "ads" | "zones"

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

interface ZoneItem {
  id: string
  type: string
  title: string
  titleEn: string
  titleUr: string
  subtitle: string
  subtitleEn: string
  subtitleUr: string
  body: string
  bodyEn: string
  bodyUr: string
  imageUrl: string
  videoUrl: string
  posterUrl: string
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
  primaryCtaLabel: "", primaryCtaLabelEn: "", primaryCtaLabelUr: "", primaryCtaHref: "/projects/ABC?register=1",
  secondaryCtaLabel: "", secondaryCtaLabelEn: "", secondaryCtaLabelUr: "", secondaryCtaHref: "/projects/ABC/tenders/projects",
  isActive: true,
}

const EMPTY_ZONE: Partial<ZoneItem> = {
  type: "text", title: "", subtitle: "", body: "", imageUrl: "", animation: "fade", isActive: true,
}

type Resource = "slides" | "videos" | "ads" | "zones"

export default function AdminHomepagePage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>("content")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [content, setContent] = useState<ContentForm>(EMPTY_CONTENT)
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [ads, setAds] = useState<AdItem[]>([])
  const [zones, setZones] = useState<ZoneItem[]>([])

  const tabList: { key: Tab; label: string; icon: any }[] = [
    { key: "content", label: t("tabContent"), icon: LayoutDashboard },
    { key: "slides", label: t("tabSlides"), icon: ImageIcon },
    { key: "videos", label: t("tabVideos"), icon: VideoIcon },
    { key: "ads", label: t("tabAds"), icon: Megaphone },
    { key: "zones", label: t("tabZones"), icon: PanelsTopLeft },
  ]

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
          primaryCtaLabel: c.primaryCtaLabel ?? "", primaryCtaLabelEn: c.primaryCtaLabelEn ?? "", primaryCtaLabelUr: c.primaryCtaLabelUr ?? "", primaryCtaHref: c.primaryCtaHref ?? "/projects/ABC?register=1",
          secondaryCtaLabel: c.secondaryCtaLabel ?? "", secondaryCtaLabelEn: c.secondaryCtaLabelEn ?? "", secondaryCtaLabelUr: c.secondaryCtaLabelUr ?? "", secondaryCtaHref: c.secondaryCtaHref ?? "/projects/ABC/tenders/projects",
          isActive: c.isActive ?? true,
        })
      }
      setSlides(data.slides ?? [])
      setVideos(data.videos ?? [])
      setAds(data.ads ?? [])
      setZones(data.zones ?? [])
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

  async function saveItem(resource: Resource, id: string | undefined, payload: any, method: string) {
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

  async function deleteItem(resource: Resource, id: string) {
    await fetch(`/projects/ABC/api/admin/homepage/${resource}/${id}`, { method: "DELETE" })
    await load()
  }

  async function moveItem(resource: Resource, list: any[], index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= list.length) return
    const next = [...list]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    const updated = next.map((el, i) => ({ ...el, sortOrder: i }))
    if (resource === "slides") setSlides(updated)
    if (resource === "videos") setVideos(updated)
    if (resource === "ads") setAds(updated)
    if (resource === "zones") setZones(updated)
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
        <Loader2 className="w-5 h-5 animate-spin ml-2" /> {t("loading")}
      </div>
    )
  }

  return (
    <AdminSurveyShell
      title={t("adminHomepageTitle")}
      subtitle={t("adminHomepageSubtitle")}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {tabList.map((tb) => {
          const Icon = tb.icon
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                tab === tb.key
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tb.label}
            </button>
          )
        })}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg text-sm">
          {t("savedSuccessfully")}
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-6">
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">{t("labelIntroSection")}</h2>
            {localeFields("introTitle", [t("titleAr"), t("titleEn"), t("titleUr")])}
            <div className="mt-3">
              <label className={labelCls}>{t("introBodyAr")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBody}
                onChange={(e) => setContent({ ...content, introBody: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>{t("introBodyEn")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBodyEn}
                onChange={(e) => setContent({ ...content, introBodyEn: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>{t("introBodyUr")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.introBodyUr}
                onChange={(e) => setContent({ ...content, introBodyUr: e.target.value })}
              />
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">{t("labelVisionSection")}</h2>
            {localeFields("visionTitle", [t("visionTitleAr"), t("visionTitleEn"), t("visionTitleUr")])}
            <div className="mt-3">
              <label className={labelCls}>{t("visionBodyAr")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBody}
                onChange={(e) => setContent({ ...content, visionBody: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>{t("visionBodyEn")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBodyEn}
                onChange={(e) => setContent({ ...content, visionBodyEn: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <label className={labelCls}>{t("visionBodyUr")}</label>
              <textarea
                className={cn(inputCls, "min-h-24")}
                value={content.visionBodyUr}
                onChange={(e) => setContent({ ...content, visionBodyUr: e.target.value })}
              />
            </div>
          </section>

          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-surface-900 mb-4">{t("labelCtaSection")}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>{t("primaryCtaAr")}</label>
                <input className={inputCls} value={content.primaryCtaLabel} onChange={(e) => setContent({ ...content, primaryCtaLabel: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("primaryCtaEn")}</label>
                <input className={inputCls} value={content.primaryCtaLabelEn} onChange={(e) => setContent({ ...content, primaryCtaLabelEn: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("primaryCtaUr")}</label>
                <input className={inputCls} value={content.primaryCtaLabelUr} onChange={(e) => setContent({ ...content, primaryCtaLabelUr: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("primaryCtaLink")}</label>
                <input className={inputCls} value={content.primaryCtaHref} onChange={(e) => setContent({ ...content, primaryCtaHref: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("secondaryCtaAr")}</label>
                <input className={inputCls} value={content.secondaryCtaLabel} onChange={(e) => setContent({ ...content, secondaryCtaLabel: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("secondaryCtaEn")}</label>
                <input className={inputCls} value={content.secondaryCtaLabelEn} onChange={(e) => setContent({ ...content, secondaryCtaLabelEn: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("secondaryCtaUr")}</label>
                <input className={inputCls} value={content.secondaryCtaLabelUr} onChange={(e) => setContent({ ...content, secondaryCtaLabelUr: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{t("secondaryCtaLink")}</label>
                <input className={inputCls} value={content.secondaryCtaHref} onChange={(e) => setContent({ ...content, secondaryCtaHref: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-medium text-surface-700">
              <input type="checkbox" checked={content.isActive} onChange={(e) => setContent({ ...content, isActive: e.target.checked })} />
              {t("labelEnableContent")}
            </label>
          </section>

          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("saveContent")}
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

      {tab === "zones" && (
        <ZonesEditor
          items={zones}
          setItems={setZones}
          onSave={(id, payload, method) => saveItem("zones", id, payload, method)}
          onDelete={(id) => deleteItem("zones", id)}
          onMove={(i, d) => moveItem("zones", zones, i, d)}
          saving={saving}
        />
      )}
    </AdminSurveyShell>
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

function MediaUrlInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}) {
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const issue = getMediaUrlIssue(value)

  async function handleUpload(file: File | null) {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("purpose", "homepage")
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("upload failed")
      const json = (await res.json()) as { url?: string }
      if (json.url) onChange(json.url)
    } catch {
      window.alert(t("uploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("mediaUrlPlaceholder")}
        dir="ltr"
      />
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-surface-300 rounded-lg hover:bg-surface-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {t("uploadImage")}
        </button>
        {isUsableMediaUrl(value) && (
          <span className="text-[10px] text-emerald-600">{t("validLink")}</span>
        )}
      </div>
      {issue === "localPathNotAllowed" && (
        <p className="mt-1 text-[11px] text-amber-700 leading-snug">{t("localPathNotAllowed")}</p>
      )}
      {issue === "invalidMediaUrl" && (
        <p className="mt-1 text-[11px] text-amber-700">{t("invalidMediaUrl")}</p>
      )}
      {hint && <p className="mt-1 text-[10px] text-surface-500">{hint}</p>}
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
  const { t } = useLanguage()
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-surface-900">{title}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100" title={t("moveUpTitle")}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={onMoveDown} className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100" title={t("moveDownTitle")}>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-danger-500 hover:text-danger-700 rounded-lg hover:bg-danger-50" title={t("delete")}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

function NewItemButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors"
    >
      <Plus className="w-4 h-4" /> {t("addNewItem")}
    </button>
  )
}

function SaveRow({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {t("saveChanges")}
    </button>
  )
}

function EnabledCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { t } = useLanguage()
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {t("labelEnabled")}
    </label>
  )
}

function AnimationSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage()
  return (
    <div>
      <label className={labelCls}>{t("labelAnimation")}</label>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="fade">{t("animFade")}</option>
        <option value="slide">{t("animSlide")}</option>
        <option value="bounce">{t("animBounce")}</option>
        <option value="pulse">{t("animPulse")}</option>
      </select>
    </div>
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
  const { t } = useLanguage()
  const [drafts, setDrafts] = useState<SlideItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<SlideItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<SlideItem>>({ title: "", imageUrl: "", subtitle: "", isActive: true })
  const titleLabels: [string, string, string] = [t("titleAr"), t("titleEn"), t("titleUr")]
  const subtitleLabels: [string, string, string] = [t("subtitleAr"), t("subtitleEn"), t("subtitleUr")]

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `${t("slide")} ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(subtitleLabels, { ar: item.subtitle, en: item.subtitleEn, ur: item.subtitleUr }, (v) => update(i, { subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <MediaUrlInput
                label={t("labelImageUrl")}
                value={item.imageUrl}
                onChange={(url) => update(i, { imageUrl: url })}
              />
              <div>
                <label className={labelCls}>{t("labelLinkUrl")}</label>
                <input className={inputCls} value={item.linkUrl ?? ""} onChange={(e) => update(i, { linkUrl: e.target.value })} placeholder="/projects/ABC/..." dir="ltr" />
              </div>
            </div>
            <EnabledCheckbox checked={item.isActive} onChange={(v) => update(i, { isActive: v })} />
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">{t("newSlide")}</h3>
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: newDraft.title ?? "", en: newDraft.titleEn ?? "", ur: newDraft.titleUr ?? "" }, (v) => setNewDraft({ ...newDraft, title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            <MediaUrlInput
              label={t("labelImageUrl")}
              value={newDraft.imageUrl ?? ""}
              onChange={(url) => setNewDraft({ ...newDraft, imageUrl: url })}
            />
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
  const { t } = useLanguage()
  const [drafts, setDrafts] = useState<VideoItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<VideoItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<VideoItem>>({ title: "", videoUrl: "", isActive: true })
  const titleLabels: [string, string, string] = [t("titleAr"), t("titleEn"), t("titleUr")]
  const subtitleLabels: [string, string, string] = [t("subtitleAr"), t("subtitleEn"), t("subtitleUr")]

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `${t("video")} ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(subtitleLabels, { ar: item.description, en: item.descriptionEn, ur: item.descriptionUr }, (v) => update(i, { description: v.ar, descriptionEn: v.en, descriptionUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>{t("labelVideoUrl")}</label>
                <input className={inputCls} value={item.videoUrl} onChange={(e) => update(i, { videoUrl: e.target.value })} />
              </div>
              <MediaUrlInput
                label={t("labelPosterUrl")}
                value={item.posterUrl ?? ""}
                onChange={(url) => update(i, { posterUrl: url })}
              />
            </div>
            <EnabledCheckbox checked={item.isActive} onChange={(v) => update(i, { isActive: v })} />
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">{t("newVideo")}</h3>
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: newDraft.title ?? "", en: newDraft.titleEn ?? "", ur: newDraft.titleUr ?? "" }, (v) => setNewDraft({ ...newDraft, title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>{t("labelVideoUrl")}</label>
                <input className={inputCls} value={newDraft.videoUrl ?? ""} onChange={(e) => setNewDraft({ ...newDraft, videoUrl: e.target.value })} />
              </div>
              <MediaUrlInput
                label={t("labelPosterUrl")}
                value={newDraft.posterUrl ?? ""}
                onChange={(url) => setNewDraft({ ...newDraft, posterUrl: url })}
              />
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
  const { t } = useLanguage()
  const [drafts, setDrafts] = useState<AdItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<AdItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<AdItem>>({ title: "", imageUrl: "", animation: "fade", isActive: true })
  const titleLabels: [string, string, string] = [t("titleAr"), t("titleEn"), t("titleUr")]
  const subtitleLabels: [string, string, string] = [t("subtitleAr"), t("subtitleEn"), t("subtitleUr")]

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `${t("ad")} ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(subtitleLabels, { ar: item.subtitle, en: item.subtitleEn, ur: item.subtitleUr }, (v) => update(i, { subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <MediaUrlInput
                label={t("labelImageUrl")}
                value={item.imageUrl}
                onChange={(url) => update(i, { imageUrl: url })}
              />
              <div>
                <label className={labelCls}>{t("labelLinkUrl")}</label>
                <input className={inputCls} value={item.linkUrl ?? ""} onChange={(e) => update(i, { linkUrl: e.target.value })} placeholder="/projects/ABC/..." dir="ltr" />
              </div>
            </div>
            <AnimationSelect value={item.animation} onChange={(v) => update(i, { animation: v })} />
            <EnabledCheckbox checked={item.isActive} onChange={(v) => update(i, { isActive: v })} />
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">{t("newAd")}</h3>
          <div className="space-y-3">
            {localeRow(titleLabels, { ar: newDraft.title ?? "", en: newDraft.titleEn ?? "", ur: newDraft.titleUr ?? "" }, (v) => setNewDraft({ ...newDraft, title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            <div className="grid gap-3 md:grid-cols-2">
              <MediaUrlInput
                label={t("labelImageUrl")}
                value={newDraft.imageUrl ?? ""}
                onChange={(url) => setNewDraft({ ...newDraft, imageUrl: url })}
              />
              <AnimationSelect value={newDraft.animation ?? "fade"} onChange={(v) => setNewDraft({ ...newDraft, animation: v })} />
            </div>
            <SaveRow onSave={() => { onSave(undefined, newDraft, "POST"); setShowNew(false); setNewDraft({ title: "", imageUrl: "", animation: "fade", isActive: true }) }} saving={saving} />
          </div>
        </div>
      )}

      <NewItemButton onClick={() => setShowNew((v) => !v)} saving={saving} />
    </div>
  )
}

function ZonesEditor({ items, setItems, onSave, onDelete, onMove, saving }: {
  items: ZoneItem[]
  setItems: (items: ZoneItem[]) => void
  onSave: (id: string | undefined, payload: any, method: string) => void
  onDelete: (id: string) => void
  onMove: (i: number, d: number) => void
  saving: boolean
}) {
  const { t } = useLanguage()
  const [drafts, setDrafts] = useState<ZoneItem[]>([])
  useEffect(() => { setDrafts(items) }, [items])
  const update = (index: number, patch: Partial<ZoneItem>) => {
    setDrafts((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<Partial<ZoneItem>>(EMPTY_ZONE)
  const titleLabels: [string, string, string] = [t("titleAr"), t("titleEn"), t("titleUr")]
  const subtitleLabels: [string, string, string] = [t("subtitleAr"), t("subtitleEn"), t("subtitleUr")]
  const bodyLabels: [string, string, string] = [t("introBodyAr"), t("introBodyEn"), t("introBodyUr")]

  return (
    <div className="space-y-4">
      {drafts.map((item, i) => (
        <EditorCard
          key={item.id}
          title={item.title || `${t("zone")} ${i + 1}`}
          onDelete={() => onDelete(item.id)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        >
          <div className="space-y-3">
            <div>
              <label className={labelCls}>{t("labelZoneType")}</label>
              <select className={inputCls} value={item.type} onChange={(e) => update(i, { type: e.target.value })}>
                <option value="text">{t("zoneTypeText")}</option>
                <option value="image">{t("zoneTypeImage")}</option>
                <option value="video">{t("zoneTypeVideo")}</option>
                <option value="mixed">{t("zoneTypeMixed")}</option>
              </select>
            </div>
            {localeRow(titleLabels, { ar: item.title, en: item.titleEn, ur: item.titleUr }, (v) => update(i, { title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(subtitleLabels, { ar: item.subtitle, en: item.subtitleEn, ur: item.subtitleUr }, (v) => update(i, { subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <div>
              <label className={labelCls}>{t("labelZoneBody")} (Ar/En/Ur)</label>
              <textarea
                className={cn(inputCls, "min-h-20")}
                value={item.body ?? ""}
                onChange={(e) => update(i, { body: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <MediaUrlInput
                label={t("labelImageUrl")}
                value={item.imageUrl}
                onChange={(url) => update(i, { imageUrl: url })}
              />
              <div>
                <label className={labelCls}>{t("labelLinkUrl")}</label>
                <input className={inputCls} value={item.linkUrl ?? ""} onChange={(e) => update(i, { linkUrl: e.target.value })} placeholder="/projects/ABC/..." dir="ltr" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelCls}>{t("labelVideoUrl")}</label>
                <input className={inputCls} value={item.videoUrl ?? ""} onChange={(e) => update(i, { videoUrl: e.target.value })} />
              </div>
              <MediaUrlInput
                label={t("labelPosterUrl")}
                value={item.posterUrl ?? ""}
                onChange={(url) => update(i, { posterUrl: url })}
              />
            </div>
            <AnimationSelect value={item.animation} onChange={(v) => update(i, { animation: v })} />
            <EnabledCheckbox checked={item.isActive} onChange={(v) => update(i, { isActive: v })} />
            <SaveRow onSave={() => onSave(item.id, drafts[i], "PATCH")} saving={saving} />
          </div>
        </EditorCard>
      ))}

      {showNew && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold text-surface-900 mb-4">{t("newZone")}</h3>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>{t("labelZoneType")}</label>
              <select className={inputCls} value={newDraft.type ?? "text"} onChange={(e) => setNewDraft({ ...newDraft, type: e.target.value })}>
                <option value="text">{t("zoneTypeText")}</option>
                <option value="image">{t("zoneTypeImage")}</option>
                <option value="video">{t("zoneTypeVideo")}</option>
                <option value="mixed">{t("zoneTypeMixed")}</option>
              </select>
            </div>
            {localeRow(titleLabels, { ar: newDraft.title ?? "", en: newDraft.titleEn ?? "", ur: newDraft.titleUr ?? "" }, (v) => setNewDraft({ ...newDraft, title: v.ar, titleEn: v.en, titleUr: v.ur }))}
            {localeRow(subtitleLabels, { ar: newDraft.subtitle ?? "", en: newDraft.subtitleEn ?? "", ur: newDraft.subtitleUr ?? "" }, (v) => setNewDraft({ ...newDraft, subtitle: v.ar, subtitleEn: v.en, subtitleUr: v.ur }))}
            <MediaUrlInput
              label={t("labelImageUrl")}
              value={newDraft.imageUrl ?? ""}
              onChange={(url) => setNewDraft({ ...newDraft, imageUrl: url })}
            />
            <SaveRow onSave={() => { onSave(undefined, newDraft, "POST"); setShowNew(false); setNewDraft(EMPTY_ZONE) }} saving={saving} />
          </div>
        </div>
      )}

      <NewItemButton onClick={() => setShowNew((v) => !v)} saving={saving} />
      <p className="text-xs text-surface-400">
        {t("tabZones")}
      </p>
    </div>
  )
}
