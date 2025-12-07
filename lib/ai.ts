// Simple server-side AI helper stub. Replace with real model call.
// Expects process.env.AI_API_KEY to be set.

type GenerateRequest = {
  systemPrompt: string;
  userPrompt: string;
};

export async function generateText({
  systemPrompt,
  userPrompt,
}: GenerateRequest): Promise<string> {
  try {
    const key = process.env.AI_API_KEY;
    if (!key) {
      return `AI_API_KEY not set. Stub response.\n\nSYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt.slice(
        0,
        2000,
      )}`;
    }

    // TODO: Implement real AI call (e.g., OpenAI/Anthropic) using `key`.
    return `AI response placeholder for prompt:\n${userPrompt.slice(0, 2000)}`;
  } catch (err: any) {
    return "AI generation failed.";
  }
}
