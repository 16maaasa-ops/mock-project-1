"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createFaq(formData: FormData) {
  await verifySession();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  const supabase = getSupabaseServerClient();
  const { count } = await supabase
    .from("faqs")
    .select("id", { count: "exact", head: true });

  await supabase.from("faqs").insert({
    question,
    answer,
    display_order: count ?? 0,
  });

  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

export async function updateFaq(id: string, formData: FormData) {
  await verifySession();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const isActive = formData.get("is_active") === "on";
  if (!question || !answer) return;

  const supabase = getSupabaseServerClient();
  await supabase
    .from("faqs")
    .update({ question, answer, is_active: isActive })
    .eq("id", id);

  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

export async function deleteFaq(id: string) {
  await verifySession();
  const supabase = getSupabaseServerClient();
  await supabase.from("faqs").delete().eq("id", id);
  revalidatePath("/admin/faqs");
}

export async function moveFaq(id: string, direction: "up" | "down") {
  await verifySession();
  const supabase = getSupabaseServerClient();

  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, display_order")
    .order("display_order", { ascending: true });
  if (!faqs) return;

  const index = faqs.findIndex((f) => f.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= faqs.length) return;

  const current = faqs[index];
  const swapTarget = faqs[swapIndex];

  await supabase
    .from("faqs")
    .update({ display_order: swapTarget.display_order })
    .eq("id", current.id);
  await supabase
    .from("faqs")
    .update({ display_order: current.display_order })
    .eq("id", swapTarget.id);

  revalidatePath("/admin/faqs");
}
