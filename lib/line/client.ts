import "server-only";
import { messagingApi } from "@line/bot-sdk";

export function createLineClient(channelAccessToken: string) {
  return new messagingApi.MessagingApiClient({ channelAccessToken });
}

export async function replyText(
  channelAccessToken: string,
  replyToken: string,
  text: string,
) {
  const client = createLineClient(channelAccessToken);
  await client.replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  });
}

export async function pushText(
  channelAccessToken: string,
  to: string,
  text: string,
) {
  const client = createLineClient(channelAccessToken);
  await client.pushMessage({
    to,
    messages: [{ type: "text", text }],
  });
}

export async function broadcastText(
  channelAccessToken: string,
  text: string,
) {
  const client = createLineClient(channelAccessToken);
  await client.broadcast({
    messages: [{ type: "text", text }],
  });
}

/**
 * Returns the user's LINE display name, or null if it can't be fetched
 * (e.g. the user blocked the account) — this is only used to help the
 * owner find the right conversation in the LINE app, so it must never
 * fail the caller's flow.
 */
export async function getDisplayName(
  channelAccessToken: string,
  userId: string,
): Promise<string | null> {
  const client = createLineClient(channelAccessToken);
  try {
    const profile = await client.getProfile(userId);
    return profile.displayName;
  } catch {
    return null;
  }
}
