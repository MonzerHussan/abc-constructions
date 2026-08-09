"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Search,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { OnboardingAnswerType } from "@/generated/prisma/enums";
import {
  SurveyQuestion,
  SurveyQuestionDraft,
  SurveyQuestionOption,
  listSurveyQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/admin/survey-questions-api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const CHOICE_TYPES: OnboardingAnswerType[] = [
  OnboardingAnswerType.SINGLE_CHOICE,
  OnboardingAnswerType.MULTIPLE_CHOICE,
  OnboardingAnswerType.DROPDOWN,
];

const ANSWER_TYPE_LABELS: Record<OnboardingAnswerType, { ar: string; en: string }> = {
  TEXT: { ar: "نص قصير", en: "Short text" },
  TEXTAREA: { ar: "نص طويل", en: "Long text" },
  SINGLE_CHOICE: { ar: "اختيار واحد", en: "Single choice" },
  MULTIPLE_CHOICE: { ar: "اختيار متعدد", en: "Multiple choice" },
  DROPDOWN: { ar: "قائمة منسدلة", en: "Dropdown" },
  RATING: { ar: "تقييم", en: "Rating" },
  LINEAR_SCALE: { ar: "مقياس خطي", en: "Linear scale" },
  YES_NO: { ar: "نعم / لا", en: "Yes / No" },
  EMAIL: { ar: "بريد إلكتروني", en: "Email" },
  PHONE: { ar: "رقم هاتف", en: "Phone" },
  DATE: { ar: "تاريخ", en: "Date" },
};

const ALL_TYPES = Object.values(OnboardingAnswerType) as OnboardingAnswerType[];

interface QuestionFormState {
  category: string;
  questionText: string;
  answerType: OnboardingAnswerType;
  options: SurveyQuestionOption[];
  order: number;
  isActive: boolean;
}

const emptyForm = (category: string): QuestionFormState => ({
  category,
  questionText: "",
  answerType: OnboardingAnswerType.TEXT,
  options: [
    { label: "", value: "" },
    { label: "", value: "" },
  ],
  order: 0,
  isActive: true,
});

function buildPayload(draft: QuestionFormState): SurveyQuestionDraft {
  return {
    category: draft.category,
    questionText: draft.questionText,
    answerType: draft.answerType,
    options: CHOICE_TYPES.includes(draft.answerType)
      ? draft.options.filter((o) => o.label.trim())
      : undefined,
    order: draft.order,
    isActive: draft.isActive,
  };
}

export function QuestionBankManager({ categories }: { categories: string[] }) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SurveyQuestion | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await listSurveyQuestions({
      page,
      limit,
      category: filterCategory || undefined,
      answerType: filterType || undefined,
      isActive: filterActive ? filterActive === "true" : undefined,
    });
    if (!data) {
      setError("تعذّر تحميل بنك الأسئلة من الخادم.");
      setLoading(false);
      return;
    }
    setQuestions(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [page, limit, filterCategory, filterType, filterActive]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredLocal = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter((item) =>
      item.questionText.toLowerCase().includes(q),
    );
  }, [questions, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleCreate = useCallback(
    async (draft: QuestionFormState) => {
      setSaving(true);
      const created = await createQuestion(buildPayload(draft));
      setSaving(false);
      if (!created) {
        setError("فشل إنشاء السؤال — حاول مجدداً.");
        return false;
      }
      setNotice("تمّ إنشاء السؤال بنجاح.");
      setCreating(false);
      await load();
      return true;
    },
    [load],
  );

  const handleUpdate = useCallback(
    async (id: string, draft: QuestionFormState) => {
      setSaving(true);
      const updated = await updateQuestion(id, buildPayload(draft));
      setSaving(false);
      if (!updated) {
        setError("فشل تحديث السؤال — حاول مجدداً.");
        return false;
      }
      setNotice("تمّ تحديث السؤال بنجاح.");
      setEditing(null);
      await load();
      return true;
    },
    [load],
  );

  const handleToggleActive = useCallback(
    async (q: SurveyQuestion) => {
      const updated = await updateQuestion(q.id, { isActive: !q.isActive });
      if (updated) {
        setQuestions((prev) =>
          prev.map((x) => (x.id === q.id ? updated : x)),
        );
      } else {
        setError("فشل تحديث حالة السؤال.");
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (q: SurveyQuestion) => {
      if (!confirm(`حذف السؤال "${q.questionText}"؟`)) return;
      const ok = await deleteQuestion(q.id);
      if (!ok) {
        setError("فشل حذف السؤال.");
        return;
      }
      setNotice("تمّ حذف السؤال.");
      setOpenId(null);
      await load();
    },
    [load],
  );

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-surface-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري تحميل بنك الأسئلة...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">بنك الأسئلة</h1>
              <p className="text-surface-500 text-sm">أسئلة الاستبيان وأنواع الإجابات</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="info">{total} سؤالاً إجمالاً</Badge>
            {saving && (
              <span className="flex items-center gap-1 text-xs text-surface-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                جاري الحفظ...
              </span>
            )}
          </div>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreating(true)}>
          إضافة سؤال
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-danger-50 border border-danger-200 rounded-xl px-4 py-3 text-sm text-danger-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </span>
          <button onClick={() => setError(null)} aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between gap-3 bg-success-50 border border-success-200 rounded-xl px-4 py-3 text-sm text-success-700">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-surface-400 absolute start-3 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في نص السؤال..."
              className="ps-9"
            />
          </div>
          <Select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">كل الفئات</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">كل الأنواع</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>{ANSWER_TYPE_LABELS[t].ar}</option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {filteredLocal.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-7 h-7" />}
          title="لا توجد أسئلة"
          description="أضف أول سؤال من زر «إضافة سؤال» أو عدّل الفلاتر."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>الأسئلة ({filteredLocal.length})</CardTitle>
            <span className="text-xs text-surface-500">عرض {filteredLocal.length} من {total}</span>
          </CardHeader>
          <CardBody className="space-y-2">
            {filteredLocal.map((q) => {
              const isOpen = openId === q.id;
              const hasOptions = Array.isArray(q.options) && q.options.length > 0;
              return (
                <QuestionRow
                  key={q.id}
                  question={q}
                  isOpen={isOpen}
                  onToggleOpen={() => setOpenId(isOpen ? null : q.id)}
                  onToggleActive={() => handleToggleActive(q)}
                  onEdit={() => setEditing(q)}
                  onDelete={() => handleDelete(q)}
                  hasOptions={hasOptions}
                  answerTypeLabel={ANSWER_TYPE_LABELS[q.answerType].ar}
                />
              );
            })}
          </CardBody>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-surface-200">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                السابق
              </Button>
              <span className="text-sm text-surface-500">صفحة {page} من {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                التالي
              </Button>
            </div>
          )}
        </Card>
      )}

      {(creating || editing) && (
        <QuestionFormModal
          categories={categories}
          initial={
            editing
              ? {
                  category: editing.category,
                  questionText: editing.questionText,
                  answerType: editing.answerType,
                  options: (editing.options ?? [{ label: "", value: "" }]).slice(),
                  order: editing.order,
                  isActive: editing.isActive,
                }
              : emptyForm(categories[0] ?? "")
          }
          saving={saving}
          title={editing ? "تعديل سؤال" : "إضافة سؤال جديد"}
          onSave={async (draft) => (editing ? handleUpdate(editing.id, draft) : handleCreate(draft))}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function QuestionRow({
  question,
  isOpen,
  onToggleOpen,
  onToggleActive,
  onEdit,
  onDelete,
  hasOptions,
  answerTypeLabel,
}: {
  question: SurveyQuestion;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasOptions: boolean;
  answerTypeLabel: string;
}) {
  return (
    <div className={`rounded-lg border ${isOpen ? "border-sky-300 bg-sky-50/30" : "border-surface-200 bg-white"} px-3 py-2`}>
      <div className="flex items-center gap-3">
        <button onClick={onToggleOpen} className="min-w-0 flex-1 text-start">
          <p className={`font-medium text-sm text-surface-900 ${!question.isActive ? "opacity-50" : ""}`}>
            {question.questionText}
          </p>
          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-2">
            <span dir="ltr">{question.category}</span>
            <span className="text-surface-300">·</span>
            <span>{answerTypeLabel}</span>
            {question.order > 0 && (
              <>
                <span className="text-surface-300">·</span>
                <span>ترتيب {question.order}</span>
              </>
            )}
          </p>
        </button>
        <Badge variant={question.isActive ? "success" : "neutral"}>
          {question.isActive ? "مفعّل" : "معطّل"}
        </Badge>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="تعديل">
          <Pencil className="w-4 h-4" />
        </Button>
        <Switch checked={question.isActive} onChange={onToggleActive} aria-label="تفعيل/تعطيل" />
        <span className="text-xs text-surface-400 w-6 text-center">
          {question.isActive ? (
            <Eye className="w-4 h-4 inline text-success-600" />
          ) : (
            <EyeOff className="w-4 h-4 inline text-surface-300" />
          )}
        </span>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="حذف" className="text-danger-500 hover:text-danger-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      {isOpen && hasOptions && (
        <div className="mt-3 ms-4 space-y-1">
          <p className="text-xs font-medium text-surface-400">الخيارات:</p>
          {(question.options as SurveyQuestionOption[]).map((opt, i) => (
            <p key={i} className="text-xs text-surface-600 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
              {opt.label}
              {opt.value ? <span className="text-surface-400" dir="ltr">({opt.value})</span> : null}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionFormModal({
  categories,
  initial,
  saving,
  title,
  onSave,
  onClose,
}: {
  categories: string[];
  initial: QuestionFormState;
  saving: boolean;
  title: string;
  onSave: (draft: QuestionFormState) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<QuestionFormState>(initial);
  const requiresOptions = CHOICE_TYPES.includes(draft.answerType);
  const hasEnoughOptions = draft.options.filter((o) => o.label.trim()).length >= 2;
  const isComplete =
    draft.category.trim().length > 0 &&
    draft.questionText.trim().length > 0 &&
    (!requiresOptions || hasEnoughOptions);

  const updateOption = (index: number, field: keyof SurveyQuestionOption, value: string) => {
    const next = draft.options.map((o, i) => (i === index ? { ...o, [field]: value } : o));
    setDraft({ ...draft, options: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-5 py-4 border-b border-surface-200">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
            <p className="text-sm text-surface-500 mt-1">احفظ بعد تعبئة الحقول المطلوبة.</p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <FormField label="الفئة" required helper="حدّد الفئة التي سيُطرح بها السؤال.">
            <Select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {categories.length === 0 && <option value="">لا توجد فئات</option>}
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="نص السؤال" required helper="كيف سيُطرح السؤال على المستخدم.">
            <Textarea
              value={draft.questionText}
              onChange={(e) => setDraft({ ...draft, questionText: e.target.value })}
              placeholder="مثال: اختر مجالات البناء التي تعمل بها..."
              rows={3}
            />
          </FormField>

          <FormField label="نوع الإجابة" required>
            <Select
              value={draft.answerType}
              onChange={(e) => {
                const next = e.target.value as OnboardingAnswerType;
                const opts =
                  CHOICE_TYPES.includes(next) &&
                  draft.options.filter((o) => o.label.trim()).length < 2
                    ? [{ label: "", value: "" }, { label: "", value: "" }]
                    : draft.options;
                setDraft({ ...draft, answerType: next, options: opts });
              }}
            >
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ANSWER_TYPE_LABELS[t].ar} — {ANSWER_TYPE_LABELS[t].en}
                </option>
              ))}
            </Select>
          </FormField>

          {requiresOptions && (
            <div className="rounded-xl border border-surface-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-700">الخيارات (اثنان على الأقل)</p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setDraft({ ...draft, options: [...draft.options, { label: "", value: "" }] })}
                >
                  إضافة خيار
                </Button>
              </div>
              {draft.options.map((opt, index) => (
                <div key={index} className="flex items-end gap-2">
                  <FormField label={`الخيار ${index + 1}`} className="flex-1">
                    <Input
                      value={opt.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                      placeholder="نص الخيار"
                    />
                  </FormField>
                  <Input
                    value={opt.value ?? ""}
                    onChange={(e) => updateOption(index, "value", e.target.value)}
                    placeholder="قيمة (اختيارية)"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDraft({ ...draft, options: draft.options.filter((_, i) => i !== index) })}
                    disabled={draft.options.length <= 2}
                    aria-label="حذف الخيار"
                    className="text-surface-400 hover:text-danger-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {draft.options.filter((o) => o.label.trim()).length < 2 && (
                <p className="text-sm text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  أضف خيارين فعليين على الأقل.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="الترتيب" helper="0 يعني الأول.">
              <Input
                type="number"
                min={0}
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="الحالة">
              <div className="flex items-center justify-between rounded-md border border-surface-200 px-3 py-2">
                <span className="text-sm text-surface-700">{draft.isActive ? "مفعّل" : "معطّل"}</span>
                <Switch checked={draft.isActive} onChange={() => setDraft({ ...draft, isActive: !draft.isActive })} />
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface-200">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            leftIcon={<Save className="w-4 h-4" />}
            loading={saving}
            disabled={!isComplete}
            onClick={async () => {
              const ok = await onSave(draft);
              if (ok) onClose();
            }}
          >
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
}