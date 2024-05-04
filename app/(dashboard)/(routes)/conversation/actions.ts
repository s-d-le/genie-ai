"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
}

export async function continueConversation(history: IMessage[]) {
  "use server";

  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 500 });
  }

  if (!history) {
    return new NextResponse("Message is required", { status: 500 });
  }

  try {
    const stream = createStreamableValue();

    (async () => {
      const { textStream } = await streamText({
        model: openai("gpt-3.5-turbo"),
        system: "Facts, concise, important context, one liners",
        messages: history,
      });

      for await (const text of textStream) {
        stream.update(text);
      }

      stream.done();
    })();

    return {
      messages: history,
      newMessage: stream.value,
    };
  } catch (error) {
    // Open pro modal
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
