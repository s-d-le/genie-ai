import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

// Set the runtime to edge for best performance
export const config = {
  runtime: "edge",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { userId } = auth();
  const body = await req.json();
  const { messages } = body;
  console.log(body);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!openai.apiKey) {
    return new NextResponse("OpenAI API key not configured", { status: 500 });
  }

  if (!messages) {
    return new NextResponse("Message is required", { status: 400 });
  }

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "give a system design of an ecommerce react app",
      },
    ],
    model: "gpt-3.5-turbo",
    stream: true,
  });

  try {
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
