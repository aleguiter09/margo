import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { createClient } from "@/infra/supabase/server";
import { buildChatContext } from "@/modules/ai/services/build-chat-context";
import { createAiTools } from "@/modules/ai/tools/ai-tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as { messages?: UIMessage[] };
  const messages = body.messages ?? [];

  const { systemPrompt } = await buildChatContext();
  const tools = createAiTools();

  const result = streamText({
    model: "nvidia/nemotron-3.5-lightning-free",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
