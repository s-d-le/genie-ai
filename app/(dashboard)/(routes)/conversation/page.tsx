"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { Loader, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; //installed with react-hook-form
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
}

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<IMessage[]>([]);

  // validation with zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  /// function to call the openai and process the streaming response
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userMessage: IMessage = {
      role: "user", // user is the question asker
      content: values.prompt,
    };

    // Setting the tone for the conversation. Must be last in the array
    const systemMessage: IMessage = {
      role: "system",
      content: "facts, basic, important context, one liners",
    };

    // posting the entire conversation to openAI for context
    const newMessages: IMessage[] = [...messages, userMessage, systemMessage];

    const response: Response = await fetch("/api/conversation", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages,
      }),
      next: { revalidate: 0 },
    });

    let resptext = "";
    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();

    /// procees the stream
    while (true) {
      const readResult = await reader?.read();
      if (readResult?.done) {
        router.refresh();
        break;
      }
      const value = readResult?.value;

      if (value) {
        resptext += value;
        setMessages([
          userMessage,
          { role: "assistant", content: resptext },
          ...messages,
        ]);
      }
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="The most advanced conversation model"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl className="m-0 p-0">
                        <Input
                          {...field}
                          className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          placeholder="What is the distance between the sun and the moon?"
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <Button
                className="col-span-12 lg-col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {messages.length === 0 && !isLoading && (
            <Empty label="Start a conversation" />
          )}
          <div className="flex flex-col gap-y-4">
            {messages
              .filter((message) => message.role !== "system")
              .map((message, index) => {
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-8 w-full flex items-start gap-x-8 rounded-lg",
                      message.role === "user"
                        ? "bg-white border border-black/10"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                    <p className="text-sm">{message.content}</p>
                  </div>
                );
              })}
          </div>
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
