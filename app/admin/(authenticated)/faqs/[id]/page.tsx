import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { updateFaq } from "@/lib/actions/faqs";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { data: faq } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .single();

  if (!faq) notFound();

  return (
    <form action={updateFaq.bind(null, faq.id)} className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        FAQを編集
      </h2>
      <Textarea
        label="質問"
        name="question"
        rows={3}
        defaultValue={faq.question}
        required
      />
      <Textarea
        label="回答"
        name="answer"
        rows={5}
        defaultValue={faq.answer}
        required
      />
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={faq.is_active}
          className="h-5 w-5"
        />
        有効にする
      </label>
      <Button type="submit">保存する</Button>
    </form>
  );
}
