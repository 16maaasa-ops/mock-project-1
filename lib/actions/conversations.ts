"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function markResolved(id: string) {
  await verifySession();
  const supabase = getSupabaseServerClient();
  await supabase
    .from("conversations")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}
