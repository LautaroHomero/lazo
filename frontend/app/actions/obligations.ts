"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL || "http://backend:8000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
function parseApiErrorDetail(rawMessage: string): string | undefined {
  try {
    const parsed = JSON.parse(rawMessage);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "detail" in parsed &&
      typeof parsed.detail === "string"
    ) {
      return parsed.detail;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getFriendlyApiErrorMessage(rawMessage: string, locale: string) {
  const normalized = rawMessage.trim().toLowerCase();
  const translations = {
    en: {
      invalidDueDate: "The due date must be today or later.",
      obligationNotFound: "The obligation could not be found.",
      invalidTransition: "That status transition is not allowed.",
      documentRequired: "A document is required for this obligation.",
      conflict: "The obligation was updated elsewhere. Reload and try again.",
      requestFailed: "Unable to complete the request. Please try again.",
    },
    es: {
      invalidDueDate: "La fecha de vencimiento debe ser hoy o en el futuro.",
      obligationNotFound: "No se pudo encontrar la obligación.",
      invalidTransition: "Esa transición de estado no está permitida.",
      documentRequired: "Se requiere un documento para esta obligación.",
      conflict:
        "La obligación se actualizó en otro lugar. Vuelve a cargar e intenta nuevamente.",
      requestFailed:
        "No se pudo completar la solicitud. Por favor intenta otra vez.",
    },
  } as const;

  const localeTranslations =
    locale === "es" ? translations.es : translations.en;
  const detail = parseApiErrorDetail(rawMessage);
  if (detail) {
    return getFriendlyApiErrorMessage(String(detail), locale);
  }

  if (normalized.includes("due_date") && normalized.includes("past")) {
    return localeTranslations.invalidDueDate;
  }

  if (normalized.includes("obligation") && normalized.includes("not found")) {
    return localeTranslations.obligationNotFound;
  }

  if (
    normalized.includes("transition") &&
    (normalized.includes("not allowed") || normalized.includes("invalid"))
  ) {
    return localeTranslations.invalidTransition;
  }

  if (normalized.includes("document") && normalized.includes("required")) {
    return localeTranslations.documentRequired;
  }

  if (normalized.includes("conflict") || normalized.includes("version")) {
    return localeTranslations.conflict;
  }

  if (
    normalized.includes("unable to") ||
    normalized.includes("request failed") ||
    normalized.includes("failed")
  ) {
    return localeTranslations.requestFailed;
  }

  return rawMessage;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    try {
      const body = JSON.parse(text);
      const message = body?.detail ?? body?.message ?? text;
      throw new Error(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  return JSON.parse(text) as T;
}

function buildRedirectPath(
  path: string,
  searchParams?: URLSearchParams,
): string {
  const query = searchParams?.toString();
  return query ? `${path}?${query}` : path;
}

function formDataToParams(formData: FormData, fields: string[]) {
  const params = new URLSearchParams();

  fields.forEach((field) => {
    const value = formData.get(field);

    if (field === "requires_document") {
      params.set(field, formData.get(field) === "on" ? "1" : "0");
      return;
    }

    if (typeof value === "string" && value.length > 0) {
      params.set(field, value);
    }
  });

  return params;
}

export async function createObligationAction(formData: FormData) {
  const locale = (formData.get("lang") as string) || "en";
  const fields = [
    "title",
    "description",
    "type",
    "due_date",
    "owner",
    "company_tax_id",
    "requires_document",
  ];
  const params = formDataToParams(formData, fields);
  params.set("lang", locale);

  const payload = {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    obligation_type: String(formData.get("type") || "").trim(),
    due_date: String(formData.get("due_date") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
    requires_document: formData.get("requires_document") === "on",
    company_tax_id: String(formData.get("company_tax_id") || "").trim(),
  };

  try {
    const response = await fetch(`${API_URL}/obligations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await parseJson<{ id: string }>(response);
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "Unable to create obligation";
    const friendly = getFriendlyApiErrorMessage(rawMessage, locale);
    params.set("error", friendly);
    redirect(buildRedirectPath("/obligations/new", params));
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?lang=${locale}`);
}

export async function updateObligationAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const locale = (formData.get("lang") as string) || "en";
  const fields = [
    "title",
    "description",
    "type",
    "due_date",
    "owner",
    "company_tax_id",
    "requires_document",
  ];
  const params = formDataToParams(formData, fields);
  params.set("lang", locale);

  const payload = {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    obligation_type: String(formData.get("type") || "").trim(),
    due_date: String(formData.get("due_date") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
    requires_document: formData.get("requires_document") === "on",
    company_tax_id: String(formData.get("company_tax_id") || "").trim(),
  };

  try {
    const response = await fetch(`${API_URL}/obligations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await parseJson(response);
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "Unable to update obligation";
    const friendly = getFriendlyApiErrorMessage(rawMessage, locale);
    params.set("error", friendly);
    redirect(buildRedirectPath(`/obligations/${id}/edit`, params));
  }

  revalidatePath(`/obligations/${id}`);
  redirect(`/obligations/${id}?lang=${locale}`);
}

export async function changeStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "").trim();
  const locale = (formData.get("lang") as string) || "en";

  try {
    const response = await fetch(`${API_URL}/obligations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_status: status }),
    });
    await parseJson(response);
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "Unable to change status";
    const friendly = getFriendlyApiErrorMessage(rawMessage, locale);
    redirect(
      `/obligations/${id}?lang=${locale}&error=${encodeURIComponent(friendly)}`,
    );
  }

  revalidatePath(`/obligations/${id}`);
  redirect(`/obligations/${id}?lang=${locale}`);
}

export async function attachDocumentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const locale = (formData.get("lang") as string) || "en";
  const file = formData.get("file");

  if (!(file instanceof File)) {
    const friendly = getFriendlyApiErrorMessage("No file selected", locale);
    redirect(
      `/obligations/${id}?lang=${locale}&error=${encodeURIComponent(friendly)}`,
    );
  }

  const uploadData = new FormData();
  uploadData.set("file", file, file.name);
  uploadData.set("lang", locale);

  try {
    const response = await fetch(`${API_URL}/obligations/${id}/documents`, {
      method: "POST",
      body: uploadData,
    });
    await parseJson(response);
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "Unable to attach document";
    const friendly = getFriendlyApiErrorMessage(rawMessage, locale);
    redirect(
      `/obligations/${id}?lang=${locale}&error=${encodeURIComponent(friendly)}`,
    );
  }

  revalidatePath(`/obligations/${id}`);
  redirect(`/obligations/${id}?lang=${locale}`);
}

export async function deleteObligationAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const locale = (formData.get("lang") as string) || "en";

  try {
    const response = await fetch(`${API_URL}/obligations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Unable to delete obligation");
    }
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "Unable to delete obligation";
    const friendly = getFriendlyApiErrorMessage(rawMessage, locale);
    redirect(
      `/obligations/${id}?lang=${locale}&error=${encodeURIComponent(friendly)}`,
    );
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?lang=${locale}`);
}
