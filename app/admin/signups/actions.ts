"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BUSINESS_FIELDS,
  PERSONAL_FIELDS,
  businessSchema,
  businessToRow,
  fieldErrors,
  isUuid,
  personalSchema,
  personalToRow,
  readFields,
  type EditState,
} from "@/lib/admin/edit";

// Admin actions that change data. Every one of them checks again on the
// server that the person is a signed in admin who passed MFA, BEFORE it
// reads the form or uses the secret key. Each change and its entry in the
// admin record are saved together by one database function.
// Errors are logged as a code only, never with personal data.

const NOT_SAVED = "We could not save the changes. Please try again in a moment.";
const NOT_FOUND = "This signup no longer exists. It may have been deleted.";
const CHECK_BOXES = "Please check the boxes marked below.";
const EMAIL_TAKEN = "Another signup already uses this email address.";

export async function updateApplicant(_prev: EditState, formData: FormData): Promise<EditState> {
  const admin = await requireAdmin();
  const id = formData.get("id");
  if (!isUuid(id)) return { error: NOT_FOUND };

  const values = readFields(formData, PERSONAL_FIELDS);
  const parsed = personalSchema.safeParse(values);
  if (!parsed.success) {
    return { error: CHECK_BOXES, fieldErrors: fieldErrors(parsed.error), values };
  }

  const { data: found, error } = await createAdminClient().rpc("admin_update_applicant", {
    p_admin: admin.id,
    p_id: id,
    p_data: personalToRow(parsed.data),
  });
  if (error) {
    if (error.code === "23505") {
      return { error: CHECK_BOXES, fieldErrors: { email: EMAIL_TAKEN }, values };
    }
    console.error("Admin edit failed, code:", error.code);
    return { error: NOT_SAVED, values };
  }
  if (!found) return { error: NOT_FOUND, values };

  redirect(`/admin/signups/${id}?done=personal`);
}

export async function updateBusiness(_prev: EditState, formData: FormData): Promise<EditState> {
  const admin = await requireAdmin();
  const id = formData.get("id");
  const businessId = formData.get("businessId");
  if (!isUuid(id) || !isUuid(businessId)) return { error: NOT_FOUND };

  const values = readFields(formData, BUSINESS_FIELDS);
  const parsed = businessSchema.safeParse(values);
  if (!parsed.success) {
    return { error: CHECK_BOXES, fieldErrors: fieldErrors(parsed.error), values };
  }

  const { data: found, error } = await createAdminClient().rpc("admin_update_business", {
    p_admin: admin.id,
    p_applicant: id,
    p_id: businessId,
    p_data: businessToRow(parsed.data),
  });
  if (error) {
    console.error("Admin business edit failed, code:", error.code);
    return { error: NOT_SAVED, values };
  }
  if (!found) return { error: NOT_FOUND, values };

  redirect(`/admin/signups/${id}?done=business`);
}

export async function withdrawConsent(_prev: EditState, formData: FormData): Promise<EditState> {
  const admin = await requireAdmin();
  const id = formData.get("id");
  const kind = formData.get("kind");
  if (!isUuid(id) || (kind !== "privacy" && kind !== "email")) return { error: NOT_FOUND };

  const { data: found, error } = await createAdminClient().rpc("admin_withdraw_consent", {
    p_admin: admin.id,
    p_id: id,
    p_kind: kind,
  });
  if (error) {
    console.error("Admin withdrawal failed, code:", error.code);
    return { error: "We could not record the withdrawal. Please try again in a moment." };
  }
  if (!found) return { error: NOT_FOUND };

  redirect(`/admin/signups/${id}?done=${kind}`);
}

export async function deleteApplicant(_prev: EditState, formData: FormData): Promise<EditState> {
  const admin = await requireAdmin();
  const id = formData.get("id");
  if (!isUuid(id)) return { error: NOT_FOUND };

  const { data: found, error } = await createAdminClient().rpc("admin_delete_applicant", {
    p_admin: admin.id,
    p_id: id,
  });
  if (error) {
    console.error("Admin delete failed, code:", error.code);
    return { error: "We could not delete this signup. Please try again in a moment." };
  }
  if (!found) return { error: NOT_FOUND };

  redirect("/admin?done=deleted");
}
