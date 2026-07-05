import "server-only";
import { validateSignature } from "@line/bot-sdk";

export function isValidLineSignature(
  rawBody: string,
  channelSecret: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  try {
    return validateSignature(rawBody, channelSecret, signature);
  } catch {
    return false;
  }
}
