import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppSettings } from "@/lib/db/types";

export async function getSettings(): Promise<AppSettings> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(`設定の取得に失敗しました: ${error?.message}`);
  }
  return data;
}

export async function updateSettings(
  patch: Partial<
    Pick<
      AppSettings,
      | "line_channel_secret"
      | "line_channel_access_token"
      | "anthropic_api_key"
      | "owner_line_user_id"
      | "owner_line_user_id_confirmed"
      | "setup_code"
    >
  >,
) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("app_settings")
    .update(patch)
    .eq("id", 1);

  if (error) {
    throw new Error(`設定の更新に失敗しました: ${error.message}`);
  }
}

function generateSetupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function issueOwnerSetupCode(): Promise<string> {
  const code = generateSetupCode();
  await updateSettings({
    setup_code: code,
    owner_line_user_id_confirmed: false,
    owner_line_user_id: null,
  });
  return code;
}

export async function resetOwnerRegistration() {
  await updateSettings({
    setup_code: null,
    owner_line_user_id: null,
    owner_line_user_id_confirmed: false,
  });
}
