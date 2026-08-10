import { OnboardingState, OnboardingApiResponse } from "./types";

/**
 * Real onboarding API service.
 *
 * Endpoints used:
 * - POST /api/upload                              -> document upload (session auth)
 * - POST /api/v1/entity-registry/sync-entity-profile -> create entity + profile (session auth)
 * - POST /api/v1/entity-registry/sync-supplier       -> bridge supplier profile (session auth)
 * - POST /api/v1/entity-registry/profiles            -> update profile (session auth)
 *
 * Security note: userId is NEVER sent in the request body. It is read from the
 * session by the backend (Programmer 5 / Gatekeeper).
 */

function accountTypeToRegistry(
  accountType: string
): {
  entityType: "CUST" | "SUPP" | "ECO" | "INT";
  entitySubtype: string;
  crmClassification: string;
} {
  switch (accountType) {
    case "supplier":
      return {
        entityType: "SUPP",
        entitySubtype: "SUPPLIER",
        crmClassification: "SUPPLIER",
      };
    case "mainContractor":
      return {
        entityType: "CUST",
        entitySubtype: "CONTRACTOR",
        crmClassification: "CUSTOMER",
      };
    case "subcontractor":
      return {
        entityType: "CUST",
        entitySubtype: "CONTRACTOR",
        crmClassification: "CUSTOMER",
      };
    case "consultant":
      return {
        entityType: "CUST",
        entitySubtype: "CONSULTANT",
        crmClassification: "CUSTOMER",
      };
    case "clientInvestor":
      return {
        entityType: "CUST",
        entitySubtype: "INVESTOR",
        crmClassification: "INVESTOR",
      };
    default:
      return {
        entityType: "CUST",
        entitySubtype: "SERVICE_PROVIDER",
        crmClassification: "LEAD",
      };
  }
}

function htmlLangToLanguagePreference(
  lang: string
): "ARABIC" | "ENGLISH" | "URDU" {
  const normalized = lang?.toLowerCase().split("-")[0];
  if (normalized === "en") return "ENGLISH";
  if (normalized === "ur") return "URDU";
  return "ARABIC";
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: { timestamp: string; requestId: string };
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const envelope = (await res
    .json()
    .catch(() => ({}))) as ApiEnvelope<T> & { message?: string };

  if (!res.ok || envelope.success === false) {
    const message =
      envelope.error?.message ??
      envelope.message ??
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (envelope.data === undefined) {
    throw new Error("Invalid API response: missing data envelope");
  }

  return envelope.data;
}

export async function submitOnboarding(
  state: OnboardingState
): Promise<OnboardingApiResponse> {
  const { profile, documents, survey } = state;

  if (!profile.accountType || !profile.fullName || !profile.email || !profile.phone) {
    return {
      success: false,
      message: "Profile information is incomplete",
      errors: { profile: "missing" },
    };
  }

  const uploadedDocs = documents.filter((d) => d.status === "uploaded");
  if (uploadedDocs.length === 0) {
    return {
      success: false,
      message: "At least one document is required",
      errors: { documents: "empty" },
    };
  }

  if (
    survey.selectedCategories.length === 0 ||
    survey.subcategories.length === 0 ||
    !survey.hasProjects ||
    !survey.budgetRange ||
    !survey.urgency
  ) {
    return {
      success: false,
      message: "Survey is incomplete",
      errors: { survey: "incomplete" },
    };
  }

  const { entityType, entitySubtype, crmClassification } =
    accountTypeToRegistry(profile.accountType);

  const languagePreference = htmlLangToLanguagePreference(
    typeof document !== "undefined" ? document.documentElement.lang : "ar"
  );

  const syncPayload = {
    entity: {
      entityType,
      entitySubtype,
      companyName: profile.companyName,
      contactPerson: profile.fullName,
      contactEmail: profile.email,
      contactPhone: profile.phone,
      languagePreference,
      location: survey.projectLocations[0] ?? undefined,
      relationshipStatus: "NEW" as const,
      source: "INTERNAL" as const,
      sourceDetail: "onboarding",
      pilotStatus: "STARTED" as const,
      crmClassification,
    },
    profile: {
      businessActivity: profile.accountType,
      companySize: survey.budgetRange,
      relevantCategories: survey.selectedCategories,
      subcategories: survey.subcategories,
      capabilities: survey.projectLocations,
    },
  };

  const result = await apiPost<{
    entity: { entityId: string };
    profile: { profileId: string };
  }>("/api/v1/entity-registry/sync-entity-profile", syncPayload);

  return {
    success: true,
    message: "Onboarding submitted successfully",
    trackingId: result.entity?.entityId ?? `ONB-${Date.now()}`,
  };
}

export async function uploadDocument(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText) as {
            success?: boolean;
            data?: { url: string; fileName: string };
            url?: string;
            fileName?: string;
            error?: { message: string };
          };
          if (parsed.success === false || parsed.error) {
            throw new Error(parsed.error?.message ?? "Upload failed");
          }
          const url = parsed.data?.url ?? parsed.url;
          const name = parsed.data?.fileName ?? parsed.fileName;
          if (!url || !name) {
            throw new Error("Invalid upload response");
          }
          resolve({ url, name });
        } catch {
          reject(new Error("Invalid upload response"));
        }
      } else {
        let message = "Upload failed";
        try {
          const data = JSON.parse(xhr.responseText) as { error?: { message: string }; message?: string };
          if (data.error?.message) message = data.error.message;
          else if (data.message) message = data.message;
        } catch {}
        reject(new Error(message));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

/**
 * Bridge an existing Marketplace SupplierProfile to the Entity Registry.
 * Requires the supplierProfileId returned by the Marketplace supplier creation flow.
 */
export async function syncSupplierToRegistry(payload: {
  supplierProfileId: string;
  companyName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  languagePreference?: "ARABIC" | "ENGLISH" | "URDU";
  location?: string;
  businessActivity?: string;
  companySize?: string;
  relevantCategories?: string[];
  subcategories?: string[];
  capabilities?: string[];
}): Promise<{
  entity: { entityId: string };
  profile: { profileId: string };
  supplierProfileId: string;
}> {
  const languagePreference =
    payload.languagePreference ??
    htmlLangToLanguagePreference(
      typeof document !== "undefined" ? document.documentElement.lang : "ar"
    );

  return apiPost<{
    entity: { entityId: string };
    profile: { profileId: string };
    supplierProfileId: string;
  }>("/api/v1/entity-registry/sync-supplier", {
    entity: {
      entityType: "SUPP" as const,
      entitySubtype: "SUPPLIER" as const,
      companyName: payload.companyName,
      contactPerson: payload.contactPerson,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      languagePreference,
      location: payload.location,
      relationshipStatus: "NEW" as const,
      source: "INTERNAL" as const,
      sourceDetail: "supplier-bridge",
      pilotStatus: "STARTED" as const,
      crmClassification: "SUPPLIER" as const,
    },
    supplierProfileId: payload.supplierProfileId,
    profile: {
      businessActivity: payload.businessActivity,
      companySize: payload.companySize,
      relevantCategories: payload.relevantCategories,
      subcategories: payload.subcategories,
      capabilities: payload.capabilities,
    },
  });
}

export async function updateOnboardingProfile(
  entityId: string,
  updates: {
    companySize?: string;
    annualVolume?: string;
    businessActivity?: string;
    relevantCategories?: string[];
    subcategories?: string[];
    hasCatalog?: boolean;
    digitalMaturity?: string;
    apiReadiness?: string;
    capabilities?: string[];
  }
): Promise<OnboardingApiResponse> {
  await apiPost<{
    profileId: string;
    entityId: string;
  }>("/api/v1/entity-registry/profiles", {
    entityId,
    ...updates,
  });

  return {
    success: true,
    message: "Profile updated",
  };
}
