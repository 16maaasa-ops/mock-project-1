import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { FaqListItem } from "@/components/admin/FaqListItem";

export default async function FaqsPage() {
  const supabase = getSupabaseServerClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });

  const list = faqs ?? [];

  return (
    <div className="space-y-4">
      <Link href="/admin/faqs/new">
        <Button>+ FAQを追加</Button>
      </Link>

      {list.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          FAQがまだ登録されていません。
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((faq, i) => (
            <FaqListItem
              key={faq.id}
              faq={faq}
              isFirst={i === 0}
              isLast={i === list.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
