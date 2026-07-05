import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Faq } from "@/lib/db/types";

const MODEL = "claude-haiku-4-5";
const MAX_ANSWER_TOKENS = 300;

const TOOL_NAME = "answer_faq";

type ResponderResult =
  | { status: "answered"; answer: string }
  | { status: "unknown" };

function buildFaqBlock(faqs: Faq[]): string {
  return faqs
    .map((faq, i) => `${i + 1}. Q: ${faq.question}\n   A: ${faq.answer}`)
    .join("\n");
}

const SYSTEM_PROMPT_HEADER = `あなたは店舗の公式LINEアカウントの窓口です。以下のFAQのみを根拠にお客様の質問に回答してください。
- FAQに明確に含まれない質問には can_answer: false を返し、answer は null にしてください。憶測や一般知識で補完しないでください。
- 回答は簡潔な日本語で、LINEのトーク画面にそのまま送れる自然な文章にしてください（Markdown記法は使わないでください）。
- 該当するFAQ:`;

export async function getFaqAnswer(
  apiKey: string,
  question: string,
  faqs: Faq[],
): Promise<ResponderResult> {
  const activeFaqs = faqs.filter((f) => f.is_active);
  if (activeFaqs.length === 0) {
    return { status: "unknown" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_ANSWER_TOKENS,
      system: [
        {
          type: "text",
          text: `${SYSTEM_PROMPT_HEADER}\n${buildFaqBlock(activeFaqs)}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: TOOL_NAME,
          description:
            "提供されたFAQのみを根拠にお客様の質問へ回答する。FAQで回答できない場合はcan_answerをfalseにする。",
          input_schema: {
            type: "object",
            properties: {
              can_answer: { type: "boolean" },
              answer: { type: ["string", "null"] },
            },
            required: ["can_answer", "answer"],
          },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: question }],
    });

    const toolUse = message.content.find(
      (block) => block.type === "tool_use" && block.name === TOOL_NAME,
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      return { status: "unknown" };
    }

    const input = toolUse.input as { can_answer?: boolean; answer?: string | null };
    if (input.can_answer && typeof input.answer === "string" && input.answer.trim()) {
      return { status: "answered", answer: input.answer.trim() };
    }
    return { status: "unknown" };
  } catch (error) {
    console.error("Claude API呼び出しに失敗しました", error);
    return { status: "unknown" };
  }
}
