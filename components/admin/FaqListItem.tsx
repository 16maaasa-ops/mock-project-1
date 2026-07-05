import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Button } from "@/components/ui/Button";
import { deleteFaq, moveFaq } from "@/lib/actions/faqs";
import type { Faq } from "@/lib/db/types";

export function FaqListItem({
  faq,
  isFirst,
  isLast,
}: {
  faq: Faq;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {faq.question}
        </p>
        <Badge tone={faq.is_active ? "success" : "neutral"}>
          {faq.is_active ? "有効" : "無効"}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {faq.answer}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/faqs/${faq.id}`}
          className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        >
          編集
        </Link>
        <form action={moveFaq.bind(null, faq.id, "up")}>
          <Button type="submit" variant="secondary" disabled={isFirst} className="px-3 py-2 text-sm">
            上へ
          </Button>
        </form>
        <form action={moveFaq.bind(null, faq.id, "down")}>
          <Button type="submit" variant="secondary" disabled={isLast} className="px-3 py-2 text-sm">
            下へ
          </Button>
        </form>
        <ConfirmButton
          action={deleteFaq.bind(null, faq.id)}
          confirmMessage="このFAQを削除しますか？"
          variant="danger"
        >
          削除
        </ConfirmButton>
      </div>
    </Card>
  );
}
