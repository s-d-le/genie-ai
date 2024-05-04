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
import { readStreamableValue } from "ai/rsc";
import { IMessage, continueConversation } from "./actions";
import { auth } from "@clerk/nextjs";

const ConversationPage = () => {
  const router = useRouter();
  const [conversation, setConversation] = useState<IMessage[]>([]);

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
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: "user", content: values.prompt },
    ]);

    let textContent = "";

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([
        ...messages,
        { role: "assistant", content: textContent },
      ]);
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
          {conversation.length === 0 && !isLoading && (
            <Empty label="Start a conversation" />
          )}
          <div className="flex flex-col gap-y-4">
            {conversation.map((message, index) => {
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
