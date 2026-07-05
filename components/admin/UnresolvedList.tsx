import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { markResolved } from "@/lib/actions/conversations";
import type { Conversation } from "@/lib/db/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UnresolvedList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  if (conversations.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          現在、要対応の質問はありません。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((c) => (
        <Card key={c.id}>
          <p className="text-xs text-gray-400">{formatTime(c.created_at)}</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {c.message_text}
          </p>
          <form action={markResolved.bind(null, c.id)} className="mt-3">
            <Button type="submit" variant="secondary">
              対応済みにする
            </Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
