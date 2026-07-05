import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendBroadcast } from "@/lib/actions/broadcast";
import { Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BroadcastSubmitButton } from "@/components/admin/BroadcastSubmitButton";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BroadcastPage() {
  const supabase = getSupabaseServerClient();
  const { data: broadcasts } = await supabase
    .from("broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <form action={sendBroadcast} className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          お知らせを配信
        </h2>
        <Textarea
          label="配信内容"
          name="message"
          rows={5}
          placeholder="友だち全員に届くお知らせを入力してください"
          required
        />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          送信すると友だち全員に配信されます。取り消せません。
        </p>
        <BroadcastSubmitButton />
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          配信履歴
        </h2>
        {!broadcasts || broadcasts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            まだ配信履歴がありません。
          </p>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <Card key={b.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400">{formatTime(b.created_at)}</p>
                  <Badge tone={b.status === "sent" ? "success" : "danger"}>
                    {b.status === "sent" ? "送信済み" : "失敗"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {b.message_text}
                </p>
                {b.error_message && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {b.error_message}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
