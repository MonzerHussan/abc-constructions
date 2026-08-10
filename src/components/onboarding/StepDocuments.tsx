"use client";

import { useRef, useCallback } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Icon } from "@/components/ui/icon";
import { documentTypeOptions } from "@/lib/data/onboarding-options";
import type { OnboardingDocument } from "@/lib/onboarding/types";
import { uploadDocument } from "@/lib/onboarding/api";
import { FileText, Upload, X, Check, AlertCircle, Loader2 } from "lucide-react";

interface StepDocumentsProps {
  documents: OnboardingDocument[];
  onChange: (documents: OnboardingDocument[]) => void;
  errors: Record<string, string>;
}

export function StepDocuments({ documents, onChange, errors }: StepDocumentsProps) {
  const { t, dir } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (docId: string, file: File | null) => {
      if (!file) return;

      const updatedDocs = documents.map((doc) =>
        doc.id === docId
          ? { ...doc, file, name: file.name, status: "uploading" as const, progress: 0 }
          : doc
      );
      onChange(updatedDocs);

      try {
        const result = await uploadDocument(file, (progress) => {
          const progressDocs = updatedDocs.map((doc) =>
            doc.id === docId ? { ...doc, progress } : doc
          );
          onChange(progressDocs);
        });

        const finalDocs = updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                name: file.name,
                url: result.url,
                status: "uploaded" as const,
                progress: 100,
              }
            : doc
        );
        onChange(finalDocs);
      } catch {
        const errorDocs = updatedDocs.map((doc) =>
          doc.id === docId ? { ...doc, status: "error" as const, progress: 0 } : doc
        );
        onChange(errorDocs);
      }
    },
    [documents, onChange]
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
    onChange(
      documents.map((doc) => (doc.id === id ? { ...doc, type } : doc))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-primary-500 mb-2">
          {t("obDocumentsTitle")}
        </h3>
        <p className="text-surface-600 mb-6">{t("obDocumentsSubtitle")}</p>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardBody className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {t("obDocType")}
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) =>
                        handleTypeChange(doc.id, e.target.value as OnboardingDocument["type"])
                      }
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none bg-white"
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {t(option.key as TranslationKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-[2]">
                    {doc.status === "pending" && !doc.file ? (
                      <div
                        className="border-2 border-dashed border-surface-300 rounded-xl p-4 text-center hover:border-secondary-500 hover:bg-secondary-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] || null;
                            handleFileSelect(doc.id, file);
                          };
                          input.click();
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-surface-400" />
                          <span className="text-sm text-surface-600">
                            {t("obDropFile")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-surface-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 text-surface-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-surface-900 truncate">
                              {doc.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="p-1 text-surface-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {doc.status === "uploading" && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-surface-500">
                              <span>{t("obUploading")}</span>
                              <span>{doc.progress}%</span>
                            </div>
                            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary-500 rounded-full transition-all duration-300"
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {doc.status === "uploaded" && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="w-4 h-4" />
                            <span>{t("obUploaded")}</span>
                          </div>
                        )}
                        {doc.status === "error" && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>{t("obUploadError")}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <button
          onClick={handleAddDocument}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-secondary-500 text-secondary-600 rounded-xl font-bold hover:bg-secondary-50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t("obAddDocument")}
        </button>

        {errors.documents && (
          <p className="text-red-500 text-sm mt-2">
            {t(errors.documents as TranslationKey)}
          </p>
        )}
      </div>
    </div>
  );
}

export default StepDocuments;
