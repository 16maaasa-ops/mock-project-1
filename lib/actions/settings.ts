"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import {
  updateSettings,
  issueOwnerSetupCode,
  resetOwnerRegistration,
} from "@/lib/settings";

export async function saveLineCredentials(formData: FormData) {
  await verifySession();

  const channelSecret = String(formData.get("line_channel_secret") ?? "").trim();
  const accessToken = String(formData.get("line_channel_access_token") ?? "").trim();

  const patch: Record<string, string> = {};
  if (channelSecret) patch.line_channel_secret = channelSecret;
  if (accessToken) patch.line_channel_access_token = accessToken;
  if (Object.keys(patch).length > 0) {
    await updateSettings(patch);
  }

  revalidatePath("/admin/settings");
}

export async function saveAnthropicKey(formData: FormData) {
  await verifySession();

  const apiKey = String(formData.get("anthropic_api_key") ?? "").trim();
  if (apiKey) {
    await updateSettings({ anthropic_api_key: apiKey });
  }

  revalidatePath("/admin/settings");
}

export async function issueSetupCodeAction() {
  await verifySession();
  await issueOwnerSetupCode();
  revalidatePath("/admin/settings");
}

export async function resetOwnerAction() {
  await verifySession();
  await resetOwnerRegistration();
  revalidatePath("/admin/settings");
}
