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
