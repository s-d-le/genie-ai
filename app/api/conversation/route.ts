import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { message } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      //   messages: [{ role: "user", content: message }],
      messages: message,
      model: "gpt-3.5-turbo",
    });

    return new NextResponse(
      JSON.stringify({ message: response.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
