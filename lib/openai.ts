import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;

    if (!apiKey || !resourceName) {
      throw new Error(
        "Azure OpenAI configuration is missing. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_RESOURCE_NAME in your .env.local file."
      );
    }

    client = new OpenAI({
      apiKey,
      baseURL: `https://${resourceName}.openai.azure.com/openai/v1/`,
    });
  }
  return client;
}

export const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5.2";

export async function chatCompletion(
  messages: { role: string; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json";
  }
): Promise<string> {
  const openaiClient = getOpenAIClient();
  
  // Convert messages to Responses API input format
  let input = messages.map(m => ({
    role: m.role as "system" | "user" | "assistant",
    content: m.content,
  }));

  // If JSON format is requested, add instruction to system message
  if (options?.responseFormat === "json") {
    // Find system message and append JSON instruction
    const systemIndex = input.findIndex(m => m.role === "system");
    if (systemIndex >= 0) {
      input[systemIndex] = {
        ...input[systemIndex],
        content: input[systemIndex].content + "\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no explanation, just the JSON object.",
      };
    } else {
      // Add system message if none exists
      input = [
        { role: "system" as const, content: "You must respond with valid JSON only. No markdown, no explanation, just the JSON object." },
        ...input,
      ];
    }
  }

  const response = await (openaiClient as any).responses.create({
    model: DEPLOYMENT,
    input,
    temperature: options?.temperature ?? 0.7,
    max_output_tokens: options?.maxTokens ?? 4096,
  });

  return response.output_text || "";
}

export async function streamChatCompletion(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const openaiClient = getOpenAIClient();
  
  // Convert messages to Responses API input format
  const input = messages.map(m => ({
    role: m.role as "system" | "user" | "assistant",
    content: m.content,
  }));

  const stream = await (openaiClient as any).responses.create({
    model: DEPLOYMENT,
    input,
    temperature: options?.temperature ?? 0.7,
    max_output_tokens: options?.maxTokens ?? 4096,
    stream: true,
  });

  let fullContent = "";

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      const content = event.delta || "";
      fullContent += content;
      onChunk(content);
    }
  }

  return fullContent;
}

export default getOpenAIClient;
