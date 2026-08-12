"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Settings, Grid3X3, Images, Menu, Link2, Megaphone, Save, Trash2, Plus, RefreshCw,
  ShieldAlert, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "config" | "zone" | "slide" | "menu" | "footerlink" | "ad"

const LANG_LABELS: Record<string, string> = { ar: "عربي", en: "English", ur: "اردو" }

interface LText { ar: string; en: string; ur: string }

interface ZoneRow {
  id: string; location: string; contentType: string;
  title: LText; body: LText; mediaUrl: string; link: string;
  enabled: boolean; order: number;
}

interface SlideRow {
  id: string; title: LText; subtitle: LText; imageUrl: string;
  link: string; order: number; enabled: boolean;
}

interface ItemRow {
  id: string; menuId: string; label: LText; href: string; order: number; enabled: boolean;
}

interface MenuRow {
  id: string; key: string; label: LText; order: number;
  enabled: boolean; items: ItemRow[];
}

interface FooterLinkRow { id: string; label: LText; href: string; order: number; enabled: boolean }

interface AdRow { id: string; title: LText; imageUrl: string; link: string; order: number; enabled: boolean }

type ConfigRow = {
  id: string; key: string; logoUrl: string; ctaLabel: LText; ctaHref: string;
  heroTitle: LText; heroSubtitle: LText; heroDescription: LText; footerText: LText;
  showLanguage: boolean; showLogin: boolean; showRegister: boolean;
}

const emptyText = (): LText => ({ ar: "", en: "", ur: "" })

function isLText(v: unknown): v is LText {
  return !!v && typeof v === "object" && "ar" in (v as object)
}

function toText(v: unknown): LText {
  if (isLText(v)) return { ar: v.ar ?? "", en: v.en ?? "", ur: v.ur ?? "" }
  return emptyText()
}

function norm<T>(rows: T[]): T[] { return rows }

function TextInput({ lang, value, onChange }: {
  lang: string; value: string; onChange: (v: string) => void
}) {
  return (
    <label className="block text-xs">
      <span className="text-surface-400 font-semibold mb-1 block">{LANG_LABELS[lang]}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
        dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}
      />
    </label>
  )
}

function LTextFields({ value, onChange }: { value: LText; onChange: (v: LText) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["ar", "en", "ur"] as const).map((l) => (
        <TextInput key={l} lang={l} value={value[l]} onChange={(v) => onChange({ ...value, [l]: v })} />
      ))}
    </div>
  )
}

async function api(path: string, opts?: RequestInit): Promise<any> {
  const res = await fetch(path, {
    headers: opts?.body ? { "Content-Type": "application/json" } : undefined,
    ...opts,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); if (j?.error) msg = j.error } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json()
}

const resource = (t: Tab | "menuitem") => `/api/admin/homepage?resource=${t}`

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5">
        <span className="text-xs text-surface-400 font-semibold">{label}</span>
        {hint && <span className="text-xs text-surface-300 mr-2">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="accent-amber-600 w-4 h-4" />
      {label}
    </label>
  )
}

export default function AdminHomepagePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<Tab>("config")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [config, setConfig] = useState<ConfigRow | null>(null)
  const [zones, setZones] = useState<ZoneRow[]>([])
  const [slides, setSlides] = useState<SlideRow[]>([])
  const [menus, setMenus] = useState<MenuRow[]>([])
  const [footerLinks, setFooterLinks] = useState<FooterLinkRow[]>([])
  const [ads, setAds] = useState<AdRow[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [c, z, s, m, f, a] = await Promise.all([
        api(resource("config")), api(resource("zone")), api(resource("slide")),
        api(resource("menu")), api(resource("footerlink")), api(resource("ad")),
      ])
      setConfig(c?.[0] ?? null)
      setZones(z.map((r: any) => ({ ...r, title: toText(r.title), body: toText(r.body) })))
      setSlides(s.map((r: any) => ({ ...r, title: toText(r.title), subtitle: toText(r.subtitle) })))
      setMenus(m.map((r: any) => ({
        ...r,
        label: toText(r.label),
        items: (r.items ?? []).map((i: any) => ({ ...i, label: toText(i.label) })),
      })))
      setFooterLinks(f.map((r: any) => ({ ...r, label: toText(r.label) })))
      setAds(a.map((r: any) => ({ ...r, title: toText(r.title) })))
    } catch (e) {
      setMessage({ type: "err", text: `فشل تحميل البيانات: ${(e as Error).message}` })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/projects/ABC/auth/login?callbackUrl=/admin/homepage")
      return
    }
    if (status === "authenticated") refresh()
  }, [status, refresh, router])

  function flash(text: string, type: "ok" | "err" = "ok") {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  async function run(path: string, method: string, body?: any, okText?: string) {
    setSaving(true)
    setMessage(null)
    try {
      await api(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })
      flash(okText ?? "تم الحفظ", "ok")
      await refresh()
    } catch (e) {
      flash((e as Error).message, "err")
    } finally {
      setSaving(false)
    }
  }

  const tabs: { id: Tab; icon: any; label: string; count: number }[] = [
    { id: "config", icon: Settings, label: "الإعدادات", count: config ? 1 : 0 },
    { id: "zone", icon: Grid3X3, label: "المناطق", count: zones.length },
    { id: "slide", icon: Images, label: "الكاروسيل", count: slides.length },
    { id: "menu", icon: Menu, label: "القوائم", count: menus.length },
    { id: "footerlink", icon: Link2, label: "فوتر", count: footerLinks.length },
    { id: "ad", icon: Megaphone, label: "الإعلانات", count: ads.length },
  ]

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <div className="p-6 flex items-center gap-3 text-surface-500"><RefreshCw className="w-5 h-5 animate-spin" /> جارِ تحميل لوحة الصفحة الرئيسية...</div>
  }

  const userRole = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-center py-20">
        <ShieldAlert className="w-12 h-12 text-surface-300" />
        <h2 className="text-lg font-bold text-surface-700">صلاحية وصول مطلوبة</h2>
        <p className="text-surface-500">هذه الصفحة مخصصة لمدراء المنصة</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">إدارة الصفحة الرئيسية</h1>
          <p className="text-surface-500 text-sm">التحكم الكامل في كل عناصر الصفحة الرئيسية</p>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className={cn("text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md",
              message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
              {message.type === "ok" ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {message.text}
            </span>
          )}
          <a href="/projects/ABC" target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">معاينة الصفحة ←</a>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap border-b pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-colors",
              tab === t.id ? "bg-amber-600 text-white" : "text-surface-600 hover:bg-amber-50")}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tab === t.id ? "bg-white/20" : "bg-surface-100")}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "config" && (
        <ConfigEditor
          row={config}
          saving={saving}
          onSave={(d) => run(`${resource("config")}&id=${config!.id}`, "PATCH", d, "تم حفظ الإعدادات")}
          onCreate={(d) => run(resource("config"), "POST", d, "تم إنشاء الإعداد")}
        />
      )}

      {tab === "zone" && (
        <ListPane
          title="مناطق الصفحة (يسار/يمين، أعلى/أسفل)"
          hint="محتوى معروض داخل الأعمدة — نص أو صورة أو فيديو"
          rows={norm(zones)}
          emptyText={() => ({ id: "", location: "LEFT_TOP", contentType: "TEXT", title: emptyText(), body: emptyText(), mediaUrl: "", link: "", enabled: true, order: 0 })}
          summary={(r) => `${(r as ZoneRow).location} • ${(r as ZoneRow).contentType}`}
          render={(row, onSave) => (
            <ZoneEditor key={row.id} row={row as ZoneRow} onSave={(d) => onSave({ ...d, location: row.location })} />
          )}
          onSave={(row) => run(`${resource("zone")}&id=${row.id}`, "PATCH", row, "تم حفظ المنطقة")}
          onDelete={(row) => run(`${resource("zone")}&id=${row.id}`, "DELETE", undefined, "تم حذف المنطقة")}
          onAdd={() => run(resource("zone"), "POST", {
            location: `ZONE_${zones.length}`, contentType: "TEXT", title: emptyText(), body: emptyText(),
            mediaUrl: "", link: "", enabled: true, order: zones.length,
          }, "تم إنشاء منطقة")}
        />
      )}

      {tab === "slide" && (
        <ListPane
          title="لقطات الكاروسيل"
          hint="عناوين قصيرة وترتيب يحدد الظهور"
          rows={norm(slides)}
          emptyText={() => ({ id: "", title: emptyText(), subtitle: emptyText(), imageUrl: "", link: "", order: 0, enabled: true })}
          summary={(r) => ((r as SlideRow).title?.ar) || ((r as SlideRow).imageUrl) || "لقطة"}
          render={(row, onSave) => <SlideEditor key={row.id} row={row as SlideRow} onSave={onSave} />}
          onSave={(row) => run(`${resource("slide")}&id=${row.id}`, "PATCH", row, "تم حفظ اللقطة")}
          onDelete={(row) => run(`${resource("slide")}&id=${row.id}`, "DELETE", undefined, "تم حذف اللقطة")}
          onAdd={() => run(resource("slide"), "POST", {
            title: emptyText(), subtitle: emptyText(), imageUrl: "", link: "", order: slides.length, enabled: true,
          }, "تم إنشاء لقطة")}
        />
      )}

      {tab === "menu" && (
        <MenuPane
          rows={norm(menus)}
          saving={saving}
          addMenu={() => run(resource("menu"), "POST", { key: `menu-${Date.now()}`, label: emptyText(), order: menus.length, enabled: true }, "تم إنشاء قائمة")}
          saveMenu={(row) => run(`${resource("menu")}&id=${row.id}`, "PATCH", row, "تم حفظ القائمة")}
          deleteMenu={(row) => run(`${resource("menu")}&id=${row.id}`, "DELETE", undefined, "تم حذف القائمة")}
          addItem={(menuId) => run(resource("menuitem"), "POST", { menuId, label: emptyText(), href: "#", order: 0, enabled: true }, "تم إنشاء عنصر")}
          saveItem={(row) => run(`${resource("menuitem")}&id=${row.id}`, "PATCH", row, "تم حفظ العنصر")}
          deleteItem={(row) => run(`${resource("menuitem")}&id=${row.id}`, "DELETE", undefined, "تم حذف العنصر")}
        />
      )}

      {tab === "footerlink" && (
        <ListPane
          title="روابط الفوتر"
          hint="نصوص وروابط أسفل الصفحة (بعرض كامل)"
          rows={norm(footerLinks)}
          emptyText={() => ({ id: "", label: emptyText(), href: "", order: 0, enabled: true })}
          summary={(r) => ((r as FooterLinkRow).label?.ar) || ((r as FooterLinkRow).href) || "رابط"}
          render={(row, onSave) => <FooterLinkEditor key={row.id} row={row as FooterLinkRow} onSave={onSave} />}
          onSave={(row) => run(`${resource("footerlink")}&id=${row.id}`, "PATCH", row, "تم حفظ الرابط")}
          onDelete={(row) => run(`${resource("footerlink")}&id=${row.id}`, "DELETE", undefined, "تم حذف الرابط")}
          onAdd={() => run(resource("footerlink"), "POST", { label: emptyText(), href: "/", order: footerLinks.length, enabled: true }, "تم إنشاء رابط")}
        />
      )}

      {tab === "ad" && (
        <ListPane
          title="منطقة الإعلانات (أسفل الكاروسيل)"
          hint="تُعرض بالكامل دون الحاجة للتمرير"
          rows={norm(ads)}
          emptyText={() => ({ id: "", title: emptyText(), imageUrl: "", link: "", order: 0, enabled: true })}
          summary={(r) => ((r as AdRow).title?.ar) || ((r as AdRow).imageUrl) || "إعلان"}
          render={(row, onSave) => <AdEditor key={row.id} row={row as AdRow} onSave={onSave} />}
          onSave={(row) => run(`${resource("ad")}&id=${row.id}`, "PATCH", row, "تم حفظ الإعلان")}
          onDelete={(row) => run(`${resource("ad")}&id=${row.id}`, "DELETE", undefined, "تم حذف الإعلان")}
          onAdd={() => run(resource("ad"), "POST", { title: emptyText(), imageUrl: "", link: "", order: ads.length, enabled: true }, "تم إنشاء إعلان")}
        />
      )}
    </div>
  )
}

function ConfigEditor({ row, saving, onSave, onCreate }: {
  row: ConfigRow | null; saving: boolean; onSave: (d: any) => void; onCreate: (d: any) => void
}) {
  const [d, setD] = useState<ConfigRow>(() => row ?? {
    id: "", key: "main", logoUrl: "/images/logo.png", ctaLabel: emptyText(), ctaHref: "/register",
    heroTitle: emptyText(), heroSubtitle: emptyText(), heroDescription: emptyText(), footerText: emptyText(),
    showLanguage: true, showLogin: true, showRegister: true,
  })

  useEffect(() => { if (row) setD(row) }, [row])

  const set = (patch: Partial<ConfigRow>) => setD((p) => ({ ...p, ...patch }))

  return (
    <div className="bg-white border rounded-xl p-5 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="رابط الشعار">
          <input value={d.logoUrl} onChange={(e) => set({ logoUrl: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
        </Field>
        <Field label="زر CTA — الرابط">
          <input value={d.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
        </Field>
      </div>

      <Field label="زر CTA — النص" hint="معروض في منطقة CTA أسفل اليمين">
        <LTextFields value={d.ctaLabel} onChange={(v) => set({ ctaLabel: v })} />
      </Field>
      <Field label="العنوان الرئيسي (heroTitle)">
        <LTextFields value={d.heroTitle} onChange={(v) => set({ heroTitle: v })} />
      </Field>
      <Field label="العنوان الفرعي (heroSubtitle)">
        <LTextFields value={d.heroSubtitle} onChange={(v) => set({ heroSubtitle: v })} />
      </Field>
      <Field label="الوصف (heroDescription)">
        <LTextFields value={d.heroDescription} onChange={(v) => set({ heroDescription: v })} />
      </Field>
      <Field label="نص الفوتر (footerText)">
        <LTextFields value={d.footerText} onChange={(v) => set({ footerText: v })} />
      </Field>

      <div className="flex gap-6 flex-wrap">
        <Toggle value={d.showLanguage} onChange={(v) => set({ showLanguage: v })} label="إظهار مُبدّل اللغة" />
        <Toggle value={d.showLogin} onChange={(v) => set({ showLogin: v })} label="إظهار زر تسجيل الدخول" />
        <Toggle value={d.showRegister} onChange={(v) => set({ showRegister: v })} label="إظهار زر التسجيل" />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => row ? onSave(d) : onCreate(d)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {row ? "حفظ الإعدادات" : "إنشاء الإعداد"}
        </button>
        {!row && <span className="text-sm text-surface-400">لا يوجد إعداد بعد — سيُظهر الموقع المحتويات الافتراضية.</span>}
      </div>
    </div>
  )
}

function ListPane<T extends { id: string; enabled?: boolean }>({ title, hint, rows, emptyText, summary, render, onSave, onDelete, onAdd }: {
  title: string; hint: string; rows: T[]; emptyText: () => Omit<T, "id"> & { id: string };
  summary: (row: T) => string; render: (row: any, onSave: (d: any) => void, primaryKey: string) => React.ReactNode;
  onSave: (row: T) => void; onDelete: (row: T) => void; onAdd: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-surface-800">{title}</h3>
          <p className="text-xs text-surface-400">{hint}</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-semibold">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {rows.length === 0 && <p className="text-sm text-surface-400 bg-surface-50 border rounded-lg p-4">لا توجد عناصر — استخدم «إضافة» لإنشاء أول عنصر.</p>}

      {rows.map((row) => {
        const open = openId === row.id
        const pk = (row as unknown as any).location || (row as unknown as any).key || row.id
        return (
          <div key={row.id || "new"} className="bg-white border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpenId(open ? null : row.id)}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-800 text-sm truncate">{summary(row)}</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full",
                row.enabled !== false ? "bg-emerald-50 text-emerald-600" : "bg-surface-100 text-surface-400")}>
                {row.enabled !== false ? "مفعّل" : "معطّل"}
              </span>
              <button onClick={(e) => { e.stopPropagation(); onDelete(row) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {open && (
              <div className="px-4 pb-4 border-t pt-3">
                {render(row, (d) => onSave({ id: row.id, ...d }), pk)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SaveButton({ saving, onClick, label }: { saving?: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white rounded-md text-sm font-semibold">
      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  )
}

function ZoneEditor({ row, onSave }: { row: ZoneRow; onSave: (d: any) => void }) {
  const [d, setD] = useState<ZoneRow>({ ...row, title: { ...row.title }, body: { ...row.body } })
  const set = (patch: Partial<ZoneRow>) => setD((p) => ({ ...p, ...patch }))
  useEffect(() => setD({ ...row, title: { ...row.title }, body: { ...row.body } }), [row])
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="الموقع">{<input value={d.location} onChange={(e) => set({ location: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />}</Field>
      <Field label="النوع">
        <select value={d.contentType} onChange={(e) => set({ contentType: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm bg-white">
          <option value="TEXT">نص</option>
          <option value="IMAGE">صورة</option>
          <option value="VIDEO">فيديو</option>
        </select>
      </Field>
      <Field label="رابط الوسائط (صورة/فيديو)">
        <input value={d.mediaUrl} onChange={(e) => set({ mediaUrl: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" placeholder="https://..." />
      </Field>
      <Field label="رابط">
        <input value={d.link} onChange={(e) => set({ link: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
      </Field>
      <Field label="العنوان"><LTextFields value={d.title} onChange={(v) => set({ title: v })} /></Field>
      <Field label="النص"><LTextFields value={d.body} onChange={(v) => set({ body: v })} /></Field>
      <Field label="الترتيب">
        <input type="number" value={d.order} onChange={(e) => set({ order: Number(e.target.value) })} className="w-full px-2 py-1.5 border rounded-md text-sm" />
      </Field>
      <Toggle value={d.enabled} onChange={(v) => set({ enabled: v })} label="مفعّل" />
      <div className="md:col-span-2 mt-2"><SaveButton onClick={() => onSave(d)} label="حفظ المنطقة" /></div>
    </div>
  )
}

function SlideEditor({ row, onSave }: { row: SlideRow; onSave: (d: any) => void }) {
  const [d, setD] = useState<SlideRow>({ ...row, title: { ...row.title }, subtitle: { ...row.subtitle } })
  const set = (patch: Partial<SlideRow>) => setD((p) => ({ ...p, ...patch }))
  useEffect(() => setD({ ...row, title: { ...row.title }, subtitle: { ...row.subtitle } }), [row])
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="العنوان"><LTextFields value={d.title} onChange={(v) => set({ title: v })} /></Field>
      <Field label="العنوان الفرعي"><LTextFields value={d.subtitle} onChange={(v) => set({ subtitle: v })} /></Field>
      <Field label="الصورة"><input value={d.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" /></Field>
      <Field label="الرابط"><input value={d.link} onChange={(e) => set({ link: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" /></Field>
      <Field label="الترتيب"><input type="number" value={d.order} onChange={(e) => set({ order: Number(e.target.value) })} className="w-full px-2 py-1.5 border rounded-md text-sm" /></Field>
      <Toggle value={d.enabled} onChange={(v) => set({ enabled: v })} label="مفعّل" />
      <div className="md:col-span-2 mt-2"><SaveButton onClick={() => onSave(d)} label="حفظ اللقطة" /></div>
    </div>
  )
}

function AdEditor({ row, onSave }: { row: AdRow; onSave: (d: any) => void }) {
  const [d, setD] = useState<AdRow>({ ...row, title: { ...row.title } })
  const set = (patch: Partial<AdRow>) => setD((p) => ({ ...p, ...patch }))
  useEffect(() => setD({ ...row, title: { ...row.title } }), [row])
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="العنوان"><LTextFields value={d.title} onChange={(v) => set({ title: v })} /></Field>
      <Field label="الصورة"><input value={d.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" /></Field>
      <Field label="الرابط"><input value={d.link} onChange={(e) => set({ link: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" /></Field>
      <Field label="الترتيب"><input type="number" value={d.order} onChange={(e) => set({ order: Number(e.target.value) })} className="w-full px-2 py-1.5 border rounded-md text-sm" /></Field>
      <Toggle value={d.enabled} onChange={(v) => set({ enabled: v })} label="مفعّل" />
      <div className="md:col-span-2 mt-2"><SaveButton onClick={() => onSave(d)} label="حفظ الإعلان" /></div>
    </div>
  )
}

function FooterLinkEditor({ row, onSave }: { row: FooterLinkRow; onSave: (d: any) => void }) {
  const [d, setD] = useState<FooterLinkRow>({ ...row, label: { ...row.label } })
  const set = (patch: Partial<FooterLinkRow>) => setD((p) => ({ ...p, ...patch }))
  useEffect(() => setD({ ...row, label: { ...row.label } }), [row])
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="التسمية"><LTextFields value={d.label} onChange={(v) => set({ label: v })} /></Field>
      <Field label="الرابط"><input value={d.href} onChange={(e) => set({ href: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" /></Field>
      <Field label="الترتيب"><input type="number" value={d.order} onChange={(e) => set({ order: Number(e.target.value) })} className="w-full px-2 py-1.5 border rounded-md text-sm" /></Field>
      <Toggle value={d.enabled} onChange={(v) => set({ enabled: v })} label="مفعّل" />
      <div className="md:col-span-2 mt-2"><SaveButton onClick={() => onSave(d)} label="حفظ الرابط" /></div>
    </div>
  )
}

function MenuPane({ rows, saving, addMenu, saveMenu, deleteMenu, addItem, saveItem, deleteItem }: {
  rows: MenuRow[]; saving: boolean;
  addMenu: () => void; saveMenu: (row: MenuRow) => void; deleteMenu: (row: MenuRow) => void;
  addItem: (menuId: string) => void; saveItem: (row: ItemRow) => void; deleteItem: (row: ItemRow) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-surface-800">قوائم الهيدر</h3>
          <p className="text-xs text-surface-400">تُعرض من نهاية العمود الأيسر حتى نهاية الشاشة — مفاتيح معروفة: bids / market / community / register</p>
        </div>
        <button onClick={addMenu} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-semibold">
          <Plus className="w-4 h-4" /> إضافة قائمة
        </button>
      </div>

      {rows.length === 0 && <p className="text-sm text-surface-400 bg-surface-50 border rounded-lg p-4">لا توجد قوائم — ستُعرض القوائم الافتراضية.</p>}

      {rows.map((menu) => {
        const open = openId === menu.id
        return (
          <div key={menu.id || "new"} className="bg-white border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpenId(open ? null : menu.id)}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-800 text-sm">{menu.label?.ar || menu.key}</p>
                <p className="text-xs text-surface-400">key: <code className="bg-surface-50 px-1 rounded">{menu.key}</code> • {menu.items?.length ?? 0} عنصر</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", menu.enabled ? "bg-emerald-50 text-emerald-600" : "bg-surface-100 text-surface-400")}>
                {menu.enabled ? "مفعّل" : "معطّل"}
              </span>
              <button onClick={(e) => { e.stopPropagation(); deleteMenu(menu) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
            </div>
            {open && (
              <div className="px-4 pb-4 border-t pt-3 space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <Field label="المفتاح (key)">
                    <input value={menu.key} onChange={(e) => saveMenu({ ...menu, key: e.target.value })} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
                  </Field>
                  <Field label="الترتيب">
                    <input type="number" value={menu.order} onChange={(e) => saveMenu({ ...menu, order: Number(e.target.value) })} className="w-full px-2 py-1.5 border rounded-md text-sm" />
                  </Field>
                </div>
                <Field label="تسمية القائمة">
                  <LTextFields value={menu.label} onChange={(v) => saveMenu({ ...menu, label: v })} />
                </Field>
                <Toggle value={menu.enabled} onChange={(v) => saveMenu({ ...menu, enabled: v })} label="مفعّل" />

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-surface-700">العناصر ({menu.items?.length ?? 0})</h4>
                    <button onClick={() => addItem(menu.id)} className="flex items-center gap-1.5 px-2.5 py-1 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-md text-xs font-semibold">
                      <Plus className="w-3.5 h-3.5" /> إضافة عنصر
                    </button>
                  </div>
                  {(menu.items ?? []).map((mi) => (
                    <div key={mi.id} className="flex flex-wrap items-center gap-2 bg-surface-50 rounded-lg p-2 my-1.5">
                      <div className="flex-1 min-w-[200px]">
                        <LTextFields value={mi.label} onChange={(v) => saveItem({ ...mi, label: v })} />
                      </div>
                      <input value={mi.href} onChange={(e) => saveItem({ ...mi, href: e.target.value })} className="px-2 py-1.5 border rounded-md text-sm flex-1 min-w-[150px]" dir="ltr" placeholder="رابط" />
                      <input type="number" value={mi.order} onChange={(e) => saveItem({ ...mi, order: Number(e.target.value) })} className="px-2 py-1.5 border rounded-md text-sm w-20" />
                      <input type="checkbox" checked={mi.enabled} onChange={(e) => saveItem({ ...mi, enabled: e.target.checked })} className="accent-amber-600 w-4 h-4" title="مفعّل" />
                      <button onClick={() => deleteItem(mi)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}