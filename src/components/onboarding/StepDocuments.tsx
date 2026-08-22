"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
  AUTH_PANEL_INPUT_CLS,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";
import { documentTypeOptions } from "@/lib/data/onboarding-options";
import type { OnboardingDocument } from "@/lib/onboarding/types";
import { uploadDocument } from "@/lib/onboarding/api";
import { FileText, Upload, X, Check, AlertCircle } from "lucide-react";

interface StepDocumentsProps {
  documents: OnboardingDocument[];
  onChange: (documents: OnboardingDocument[]) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function StepDocuments({ documents, onChange, errors, disabled }: StepDocumentsProps) {
  const { t } = useLanguage();

  const handleFileSelect = useCallback(
    async (docId: string, file: File | null) => {
      if (!file || disabled) return;

      const updatedDocs = documents.map((doc) =>
        doc.id === docId
          ? { ...doc, file, name: file.name, status: "uploading" as const, progress: 0 }
          : doc,
      );
      onChange(updatedDocs);

      try {
        const result = await uploadDocument(file, (progress) => {
          const progressDocs = updatedDocs.map((doc) =>
            doc.id === docId ? { ...doc, progress } : doc,
          );
          onChange(progressDocs);
        }, { purpose: "verification" });

        const finalDocs = updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                name: file.name,
                url: result.url,
                status: "uploaded" as const,
                progress: 100,
              }
            : doc,
        );
        onChange(finalDocs);
      } catch {
        const errorDocs = updatedDocs.map((doc) =>
          doc.id === docId ? { ...doc, status: "error" as const, progress: 0 } : doc,
        );
        onChange(errorDocs);
      }
    },
    [documents, onChange, disabled],
  );

  const handleAddDocument = () => {
    const newDoc: OnboardingDocument = {
      id: `doc-${Date.now()}`,
      type: "other",
      file: null,
      name: "",
      status: "pending",
      progress: 0,
    };
    onChange([...documents, newDoc]);
  };

  const handleRemoveDocument = (id: string) => {
    onChange(documents.filter((doc) => doc.id !== id));
  };

  const handleTypeChange = (id: string, type: OnboardingDocument["type"]) => {
    onChange(documents.map((doc) => (doc.id === id ? { ...doc, type } : doc)));
  };

  const openFilePicker = (docId: string) => {
    if (disabled) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      handleFileSelect(docId, file);
    };
    input.click();
  };

  return (
    <div className={`space-y-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div>
        <p className={AUTH_PANEL_HEADER_TITLE}>{t("obDocumentsTitle")}</p>
        <p className={AUTH_PANEL_HEADER_SUBTITLE}>{t("obDocumentsSubtitle")}</p>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-none border border-surface-200 bg-surface-50/40 p-2.5"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="sm:w-[38%] shrink-0">
                <label className={AUTH_PANEL_LABEL_CLS}>{t("obDocType")}</label>
                <select
                  value={doc.type}
                  onChange={(e) =>
                    handleTypeChange(doc.id, e.target.value as OnboardingDocument["type"])
                  }
                  className={AUTH_PANEL_INPUT_CLS + " bg-white"}
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {t(option.key as TranslationKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-0">
                {doc.status === "pending" && !doc.file ? (
                  <button
                    type="button"
                    onClick={() => openFilePicker(doc.id)}
                    className="w-full min-h-[72px] border border-dashed border-surface-300 bg-white px-3 py-3 text-center hover:border-secondary-500 hover:bg-secondary-50/40 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-4 h-4 text-surface-400" />
                      <span className="text-[11px] text-surface-600">{t("obDropFile")}</span>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-none border border-surface-200 bg-white p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                        <span className="text-[11px] font-medium text-surface-900 truncate">
                          {doc.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-0.5 text-surface-400 hover:text-danger-500 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {doc.status === "uploading" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-surface-500">
                          <span>{t("obUploading")}</span>
                          <span>{doc.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 overflow-hidden">
                          <div
                            className="h-full bg-secondary-500 transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {doc.status === "uploaded" && (
                      <div className="flex items-center gap-1.5 text-[11px] text-success-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t("obUploaded")}</span>
                      </div>
                    )}
                    {doc.status === "error" && (
                      <div className="flex items-center gap-1.5 text-[11px] text-danger-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{t("obUploadError")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddDocument}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold border border-secondary-500 text-secondary-600 hover:bg-secondary-50 transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        {t("obAddDocument")}
      </button>

      {errors.documents && (
        <p className="text-[10px] text-danger-600">{t(errors.documents as TranslationKey)}</p>
      )}
    </div>
  );
}

export default StepDocuments;
