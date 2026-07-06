import { NextResponse } from "next/server";
import type { webhook } from "@line/bot-sdk";
import { isValidLineSignature } from "@/lib/line/verify";
import { replyText, pushText, getDisplayName } from "@/lib/line/client";
import { getFaqAnswer } from "@/lib/ai/responder";
import { getSettings, updateSettings } from "@/lib/settings";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const HOLDING_MESSAGE =
  "お問い合わせありがとうございます。確認のうえ、改めてご連絡いたします。";

const POSTGRES_UNIQUE_VIOLATION = "23505";

async function claimMessage(
  lineUserId: string,
  lineMessageId: string,
  text: string,
): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      line_user_id: lineUserId,
      line_message_id: lineMessageId,
      message_text: text,
    })
    .select("id")
    .single();

  if (error) {
    // Unique violation on line_message_id means LINE re-delivered this webhook;
    // returning null tells the caller to skip processing instead of double-replying.
    if (error.code === POSTGRES_UNIQUE_VIOLATION) return null;
    // Any other error is a real failure (network blip, RLS misconfig, etc.) —
    // throw so the caller's try/catch logs it instead of silently dropping the message.
    throw new Error(`会話の記録に失敗しました: ${error.message}`);
  }
  return data.id as string;
}

async function markAnswered(conversationId: string, answer: string) {
  const supabase = getSupabaseServerClient();
  await supabase
    .from("conversations")
    .update({ answer_text: answer, status: "auto_answered" })
    .eq("id", conversationId);
}

async function markEscalated(conversationId: string, displayName: string | null) {
  const supabase = getSupabaseServerClient();
  await supabase
    .from("conversations")
    .update({ status: "escalated", display_name: displayName })
    .eq("id", conversationId);
}

/**
 * Sends a LINE reply and swallows failures (expired token, LINE API errors)
 * instead of throwing — a failed delivery must not prevent the caller from
 * still recording the correct conversation status.
 */
async function safeReply(
  channelAccessToken: string,
  replyToken: string | undefined,
  text: string,
): Promise<boolean> {
  if (!replyToken) return false;
  try {
    await replyText(channelAccessToken, replyToken, text);
    return true;
  } catch (error) {
    console.error("LINEへの返信に失敗しました", error);
    return false;
  }
}

async function handleOwnerSetupCode(
  event: webhook.MessageEvent,
  text: string,
  settings: Awaited<ReturnType<typeof getSettings>>,
) {
  const userId = event.source?.type === "user" ? event.source.userId : undefined;
  if (
    !userId ||
    !settings.setup_code ||
    settings.owner_line_user_id_confirmed ||
    text.trim() !== settings.setup_code
  ) {
    return false;
  }

  await updateSettings({
    owner_line_user_id: userId,
    owner_line_user_id_confirmed: true,
    setup_code: null,
  });

  if (event.replyToken && settings.line_channel_access_token) {
    await replyText(
      settings.line_channel_access_token,
      event.replyToken,
      "オーナー様として登録されました。今後、未回答の質問はこちらのLINEに通知されます。",
    );
  }
  return true;
}

async function handleEvent(
  event: webhook.Event,
  settings: Awaited<ReturnType<typeof getSettings>>,
) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const messageEvent = event as webhook.MessageEvent;
  const text = (messageEvent.message as webhook.TextMessageContent).text;
  const userId =
    messageEvent.source?.type === "user" ? messageEvent.source.userId : undefined;
  const messageId = messageEvent.message.id;

  if (!userId || !settings.line_channel_access_token) return;

  if (await handleOwnerSetupCode(messageEvent, text, settings)) return;

  const conversationId = await claimMessage(userId, messageId, text);
  if (!conversationId) return; // duplicate delivery, already processed

  const result = settings.anthropic_api_key
    ? await getFaqAnswerFromSettings(text, settings)
    : { status: "unknown" as const };

  if (result.status === "answered") {
    const delivered = await safeReply(
      settings.line_channel_access_token,
      messageEvent.replyToken,
      result.answer,
    );
    if (delivered) {
      await markAnswered(conversationId, result.answer);
      return;
    }
    // The AI had an answer but delivery failed (expired token, LINE outage) —
    // the customer never actually received it, so escalate for human follow-up
    // instead of marking this as a successful auto-answer.
  } else {
    await safeReply(settings.line_channel_access_token, messageEvent.replyToken, HOLDING_MESSAGE);
  }

  const displayName = await getDisplayName(settings.line_channel_access_token, userId);
  await markEscalated(conversationId, displayName);

  if (settings.owner_line_user_id_confirmed && settings.owner_line_user_id) {
    const appUrl = process.env.APP_URL ?? "";
    const fromLine = displayName ? `お客様（${displayName}さん）より:\n` : "";
    await pushText(
      settings.line_channel_access_token,
      settings.owner_line_user_id,
      `【未回答の質問】\n${fromLine}${text}\n\nLINEのトーク一覧から${displayName ? `「${displayName}」さんを探して` : "該当のお客様を探して"}直接ご返信ください。\n管理画面で確認: ${appUrl}/admin`,
    );
  }
}

async function getFaqAnswerFromSettings(
  text: string,
  settings: Awaited<ReturnType<typeof getSettings>>,
) {
  const supabase = getSupabaseServerClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return getFaqAnswer(settings.anthropic_api_key!, text, faqs ?? []);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  const settings = await getSettings();
  if (
    !settings.line_channel_secret ||
    !isValidLineSignature(rawBody, settings.line_channel_secret, signature)
  ) {
    return new NextResponse(null, { status: 401 });
  }

  const body = JSON.parse(rawBody) as webhook.CallbackRequest;
  const events = body.events ?? [];

  for (const event of events) {
    try {
      await handleEvent(event, settings);
    } catch (error) {
      console.error("LINEイベント処理中にエラーが発生しました", error);
    }
  }

  return new NextResponse(null, { status: 200 });
}
