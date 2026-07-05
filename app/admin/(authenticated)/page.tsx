import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getJstTodayRangeUtc } from "@/lib/date";
import { StatCard } from "@/components/admin/StatCard";
import { UnresolvedList } from "@/components/admin/UnresolvedList";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  const { startUtc, endUtc } = getJstTodayRangeUtc();

  const [todayResult, escalatedResult] = await Promise.all([
    supabase
      .from("conversations")
      .select("status")
      .gte("created_at", startUtc)
      .lt("created_at", endUtc),
    supabase
      .from("conversations")
      .select("*")
      .eq("status", "escalated")
      .order("created_at", { ascending: false }),
  ]);

  const todayConversations = todayResult.data ?? [];
  const totalToday = todayConversations.length;
  const autoAnsweredToday = todayConversations.filter(
    (c) => c.status === "auto_answered",
  ).length;
  const autoAnswerRate =
    totalToday === 0 ? "-" : `${Math.round((autoAnsweredToday / totalToday) * 100)}%`;

  const escalated = escalatedResult.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="本日の問い合わせ" value={String(totalToday)} />
        <StatCard label="自動応答率" value={autoAnswerRate} />
        <StatCard label="要対応" value={String(escalated.length)} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          要対応の質問
        </h2>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          実際の返信はLINE公式アカウントアプリから行ってください。ここでは対応済みの記録のみ行います。
        </p>
        <UnresolvedList conversations={escalated} />
      </div>
    </div>
  );
}
