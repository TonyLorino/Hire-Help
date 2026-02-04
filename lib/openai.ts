import { AzureOpenAI } from "openai";
import type OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let azureClient: AzureOpenAI | null = null;

function getAzureOpenAIClient(): AzureOpenAI {
  if (!azureClient) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";

    if (!apiKey || !endpoint) {
      throw new Error(
        "Azure OpenAI configuration is missing. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in your .env.local file."
      );
    }

    azureClient = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
    });
  }
  return azureClient;
}

export const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1";

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json";
  }
): Promise<string> {
  const client = getAzureOpenAIClient();
  const response = await client.chat.completions.create({
    model: DEPLOYMENT,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    response_format: options?.responseFormat === "json" 
      ? { type: "json_object" } 
      : undefined,
  });

  return response.choices[0]?.message?.content || "";
}

export async function streamChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  onChunk: (chunk: string) => void,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getAzureOpenAIClient();
  const stream = await client.chat.completions.create({
    model: DEPLOYMENT,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    stream: true,
  });

  let fullContent = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
    onChunk(content);
  }

  return fullContent;
}

export default getAzureOpenAIClient;
