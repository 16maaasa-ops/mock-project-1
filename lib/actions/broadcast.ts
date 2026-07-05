"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { broadcastText } from "@/lib/line/client";

export async function sendBroadcast(formData: FormData) {
  await verifySession();

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return;

  const supabase = getSupabaseServerClient();
  const settings = await getSettings();

  if (!settings.line_channel_access_token) {
    await supabase.from("broadcasts").insert({
      message_text: message,
      status: "failed",
      error_message: "LINEアクセストークンが設定されていません",
    });
    revalidatePath("/admin/broadcast");
    return;
  }

  try {
    await broadcastText(settings.line_channel_access_token, message);
    await supabase.from("broadcasts").insert({
      message_text: message,
      status: "sent",
    });
  } catch (error) {
    await supabase.from("broadcasts").insert({
      message_text: message,
      status: "failed",
      error_message: error instanceof Error ? error.message : "不明なエラー",
    });
  }

  revalidatePath("/admin/broadcast");
}
