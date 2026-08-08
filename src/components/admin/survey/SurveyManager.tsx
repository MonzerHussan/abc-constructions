"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  Plus,
  GripVertical,
  Pencil,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Save,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  SurveyConfig,
  SurveyQuestion,
  getSubcategoriesForCategory,
  findQuestion,
  sortByOrder,
} from "@/lib/admin/survey-config";
import {
  fetchSurveyConfig,
  saveSurveyConfig,
  createQuestion,
  updateQuestion,
  reorderQuestions,
} from "@/lib/admin/survey-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type EditorState =
  | { mode: "closed" }
  | { mode: "create"; type: SurveyQuestion["type"]; parentId: string | null }
  | { mode: "edit"; question: SurveyQuestion };

interface EditorDraft {
  labelAr: string;
  labelEn: string;
}

const emptyDraft: EditorDraft = { labelAr: "", labelEn: "" };

export function SurveyManager() {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [isRemote, setIsRemote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { config: cfg, isRemote: remote } = await fetchSurveyConfig();
      if (cancelled) return;
      setConfig(cfg);
      setIsRemote(remote);
      setDirty(false);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next: SurveyConfig) => {
      setConfig(next);
      setDirty(true);
      const ok = await saveSurveyConfig(next);
      if (ok) setDirty(false);
    },
    [],
  );

  const toggleActive = useCallback(
    async (id: string) => {
      const cfg = configRef.current;
      if (!cfg) return;
      const inCategories = cfg.categories.some((c) => c.id === id);
      const updated = inCategories
        ? {
            ...cfg,
            categories: cfg.categories.map((c) =>
              c.id === id ? { ...c, isActive: !c.isActive } : c,
            ),
          }
        : {
            ...cfg,
            subcategories: cfg.subcategories.map((s) =>
              s.id === id ? { ...s, isActive: !s.isActive } : s,
            ),
          };
      await persist(updated);
      const q = findQuestion(updated, id);
      if (q) await updateQuestion(id, { isActive: q.isActive });
    },
    [persist],
  );

  const move = useCallback(
    async (
      list: SurveyQuestion[],
      fromIndex: number,
      toIndex: number,
    ): Promise<SurveyQuestion[]> => {
      if (toIndex < 0 || toIndex >= list.length || fromIndex === toIndex)
        return list;
      const next = [...list];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((q, i) => ({ ...q, sortOrder: i }));
    },
    [],
  );

  const moveCategory = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const cfg = configRef.current;
      if (!cfg) return;
      const nextCategories = await move(
        cfg.categories,
        fromIndex,
        toIndex,
      );
      await persist({ ...cfg, categories: nextCategories });
      await reorderQuestions(nextCategories.map((c) => c.id));
    },
    [move, persist],
  );

  const moveSubcategory = useCallback(
    async (categoryId: string, fromIndex: number, toIndex: number) => {
      const cfg = configRef.current;
      if (!cfg) return;
      const list = getSubcategoriesForCategory(cfg, categoryId);
      const nextList = await move(list, fromIndex, toIndex);
      const nextSubcategories = cfg.subcategories
        .filter((s) => s.parentId !== categoryId)
        .concat(nextList);
      await persist({
        ...cfg,
        subcategories: sortByOrder(nextSubcategories),
      });
      await reorderQuestions(nextList.map((s) => s.id));
    },
    [move, persist],
  );

  const handleDropCategory = (toIndex: number) => {
    if (draggingId === null) return;
    const cfg = configRef.current;
    if (!cfg) return;
    const fromIndex = cfg.categories.findIndex((c) => c.id === draggingId);
    if (fromIndex >= 0) moveCategory(fromIndex, toIndex);
    setDraggingId(null);
  };

  const handleDropSubcategory = (categoryId: string, toIndex: number) => {
    if (draggingId === null) return;
    const cfg = configRef.current;
    if (!cfg) return;
    const list = getSubcategoriesForCategory(cfg, categoryId);
    const fromIndex = list.findIndex((s) => s.id === draggingId);
    if (fromIndex >= 0) moveSubcategory(categoryId, fromIndex, toIndex);
    setDraggingId(null);
  };

  const handleSaveNew = useCallback(
    async (draft: EditorDraft) => {
      if (editor.mode !== "create") return;
      if (!draft.labelAr.trim() || !draft.labelEn.trim()) {
        setNotice("الرجاء تعبئة التسمية بالعربية والإنجليزية");
        return;
      }
      const q = await createQuestion({
        ...draft,
        type: editor.type,
        parentId: editor.parentId,
      });
      if (q) {
        const cfg = configRef.current;
        if (cfg) {
          if (q.type === "category") {
            await persist({
              ...cfg,
              categories: [...cfg.categories, q],
            });
          } else {
            await persist({
              ...cfg,
              subcategories: [...cfg.subcategories, q],
            });
          }
        }
      } else {
        // لا يزال الـ API غير جاهز — نُضيف محلياً بمعرّف مؤقت.
        const cfg = configRef.current;
        if (cfg) {
          const local: SurveyQuestion = {
            ...draft,
            id: `local-${Date.now()}`,
            type: editor.type,
            parentId: editor.parentId,
            sortOrder: Math.max(
              ...(editor.type === "category"
                ? cfg.categories.map((c) => c.sortOrder)
                : cfg.subcategories
                    .filter((s) => s.parentId === editor.parentId)
                    .map((s) => s.sortOrder)),
              0,
            ) + 1,
            isActive: true,
          };
          if (local.type === "category") {
            await persist({ ...cfg, categories: [...cfg.categories, local] });
          } else {
            await persist({
              ...cfg,
              subcategories: [...cfg.subcategories, local],
            });
          }
        }
      }
      setEditor({ mode: "closed" });
      setNotice(null);
    },
    [editor, persist],
  );

  const handleSaveEdit = useCallback(
    async (draft: EditorDraft) => {
      if (editor.mode !== "edit") return;
      if (!draft.labelAr.trim() || !draft.labelEn.trim()) {
        setNotice("الرجاء تعبئة التسمية بالعربية والإنجليزية");
        return;
      }
      const updated = await updateQuestion(editor.question.id, draft);
      if (updated) {
        const cfg = configRef.current;
        if (cfg) {
          await persist({
            ...cfg,
            categories: cfg.categories.map((c) =>
              c.id === updated.id ? updated : c,
            ),
            subcategories: cfg.subcategories.map((s) =>
              s.id === updated.id ? updated : s,
            ),
          });
        }
      } else {
        const cfg = configRef.current;
        if (cfg) {
          const patch = { ...draft };
          await persist({
            ...cfg,
            categories: cfg.categories.map((c) =>
              c.id === editor.question.id ? { ...c, ...patch } : c,
            ),
            subcategories: cfg.subcategories.map((s) =>
              s.id === editor.question.id ? { ...s, ...patch } : s,
            ),
          });
        }
      }
      setEditor({ mode: "closed" });
      setNotice(null);
    },
    [editor, persist],
  );

  const sortedCategories = useMemo(
    () => (config ? sortByOrder(config.categories) : []),
    [config],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-surface-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري تحميل الاستبيان...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<ClipboardList className="w-7 h-7" />}
          title="تعذّر تحميل الاستبيان"
          description="لم نتمكن من جلب إعداد الاستبيان من الخادم."
        />
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">إدارة الاستبيان</h1>
              <p className="text-surface-500 text-sm">Survey Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={isRemote ? "success" : "warning"}>
              {isRemote === null
                ? "جارٍ التحقق..."
                : isRemote
                  ? "متصل بالـ API"
                  : "وضع محلي (بانتظار API المبرمج 6)"}
            </Badge>
            {dirty && <Badge variant="neutral">تغييرات غير محفوظة</Badge>}
            {!isRemote && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                تُحفظ التغييرات محلياً حتى يجهز الـ backend
              </span>
            )}
          </div>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setEditor({ mode: "create", type: "category", parentId: null })}
        >
          إضافة فئة
        </Button>
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {sortedCategories.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-7 h-7" />}
          title="لا توجد فئات بعد"
          description="ابدأ بإضافة أول فئة للاستبيان."
          action={
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() =>
                setEditor({ mode: "create", type: "category", parentId: null })
              }
            >
              إضافة فئة
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>الفئات والفئات الفرعية ({config.categories.length})</CardTitle>
            <span className="text-xs text-surface-500">
              اسحب للتّرتيب · عدّل · فعّل/عطّل
            </span>
          </CardHeader>
          <CardBody className="space-y-2">
            {sortedCategories.map((category, catIndex) => {
              const subcategories = getSubcategoriesForCategory(config, category.id);
              const isExpanded = expanded.has(category.id);
              const isDragging = draggingId === category.id;
              return (
                <div key={category.id} className="space-y-1">
                  <div
                    draggable
                    onDragStart={() => setDraggingId(category.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropCategory(catIndex)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      isDragging ? "border-amber-300 bg-amber-50" : "border-surface-200 bg-white"
                    } ${!category.isActive ? "opacity-50" : ""}`}
                  >
                    <button
                      className="cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500"
                      aria-label="سحب لإعادة الترتيب"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-surface-400 hover:text-surface-600"
                      aria-label={isExpanded ? "طيّ" : "توسيع"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-surface-900">{category.labelAr}</p>
                      <p className="text-xs text-surface-400">{category.labelEn}</p>
                    </div>
                    <span className="text-xs text-surface-400">{subcategories.length}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditor({ mode: "edit", question: category })}
                      aria-label="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={category.isActive}
                      onChange={() => toggleActive(category.id)}
                      aria-label="تفعيل/تعطيل"
                    />
                    <span className="text-xs text-surface-400 w-6 text-center">
                      {category.isActive ? <Eye className="w-4 h-4 inline text-success-600" /> : <EyeOff className="w-4 h-4 inline text-surface-300" />}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="ms-10 space-y-1 border-s-2 border-surface-100 ps-2">
                      {subcategories.length === 0 && (
                        <p className="text-xs text-surface-400 px-3 py-1">
                          لا توجد فئات فرعية — أضف واحدة.
                        </p>
                      )}
                      {subcategories.map((sub, subIndex) => {
                        const isSubDragging = draggingId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            draggable
                            onDragStart={() => setDraggingId(sub.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropSubcategory(category.id, subIndex)}
                            onDragEnd={() => setDraggingId(null)}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                              isSubDragging
                                ? "border-amber-300 bg-amber-50"
                                : "border-surface-200 bg-surface-50/50"
                            } ${!sub.isActive ? "opacity-50" : ""}`}
                          >
                            <button
                              className="cursor-grab active:cursor-grabbing text-surface-300 hover:text-surface-500"
                              aria-label="سحب لإعادة الترتيب"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-surface-900">{sub.labelAr}</p>
                              <p className="text-xs text-surface-400">{sub.labelEn}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditor({ mode: "edit", question: sub })}
                              aria-label="تعديل"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Switch
                              checked={sub.isActive}
                              onChange={() => toggleActive(sub.id)}
                              aria-label="تفعيل/تعطيل"
                            />
                            <span className="text-xs text-surface-400 w-6 text-center">
                              {sub.isActive ? (
                                <Eye className="w-4 h-4 inline text-success-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 inline text-surface-300" />
                              )}
                            </span>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() =>
                          setEditor({
                            mode: "create",
                            type: "subcategory",
                            parentId: category.id,
                          })
                        }
                      >
                        إضافة فئة فرعية
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          leftIcon={<Save className="w-4 h-4" />}
          loading={saving}
          onClick={async () => {
            setSaving(true);
            const cfg = configRef.current;
            if (cfg) await saveSurveyConfig(cfg);
            setSaving(false);
            setDirty(false);
          }}
        >
          حفظ الكل
        </Button>
      </div>

      {editor.mode !== "closed" && (
        <QuestionEditorModal
          editor={editor}
          config={config}
          onSave={editor.mode === "create" ? handleSaveNew : handleSaveEdit}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </div>
  );
}

function QuestionEditorModal({
  editor,
  config,
  onSave,
  onClose,
}: {
  editor: Exclude<EditorState, { mode: "closed" }>;
  config: SurveyConfig;
  onSave: (draft: EditorDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<EditorDraft>(
    editor.mode === "edit"
      ? { labelAr: editor.question.labelAr, labelEn: editor.question.labelEn }
      : emptyDraft,
  );
  const [savingLocal, setSavingLocal] = useState(false);

  const parentLabel =
    editor.mode === "create" && editor.type === "subcategory" && editor.parentId
      ? findQuestion(config, editor.parentId)
      : undefined;

  const isComplete = draft.labelAr.trim().length > 0 && draft.labelEn.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-5 py-4 border-b border-surface-200">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">
              {editor.mode === "create" ? "إضافة عنصر جديد" : "تعديل العنصر"}
            </h3>
            <p className="text-sm text-surface-500 mt-1">
              {editor.mode === "create"
                ? editor.type === "category"
                  ? "فئة رئيسية للاستبيان"
                  : parentLabel
                    ? `فئة فرعية ضمن: ${parentLabel.labelAr}`
                    : "فئة فرعية"
                : "فئة رئيسية"}
            </p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">
                التسمية بالعربية <span className="text-danger-500">*</span>
              </label>
              <Input
                value={draft.labelAr}
                onChange={(e) => setDraft({ ...draft, labelAr: e.target.value })}
                placeholder="مثال: مواد البناء"
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">
                التسمية بالإنجليزية <span className="text-danger-500">*</span>
              </label>
              <Input
                value={draft.labelEn}
                onChange={(e) => setDraft({ ...draft, labelEn: e.target.value })}
                placeholder="Example: Construction Materials"
                dir="ltr"
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4">
            <p className="text-xs font-medium text-surface-500 mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              معاينة فورية
            </p>
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl border border-surface-300 bg-white text-sm text-surface-700">
                {draft.labelAr.trim() || "التسمية بالعربية..."}
              </div>
              <div className="px-4 py-3 rounded-xl border border-surface-300 bg-white text-sm text-surface-700" dir="ltr">
                {draft.labelEn.trim() || "English label..."}
              </div>
            </div>
          </div>

          {!isComplete && (
            <p className="text-sm text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              أكمل التسمية بالعربية والإنجليزية قبل الحفظ.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface-200">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            loading={savingLocal}
            disabled={!isComplete}
            onClick={async () => {
              setSavingLocal(true);
              await onSave(draft);
              setSavingLocal(false);
            }}
          >
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
}
