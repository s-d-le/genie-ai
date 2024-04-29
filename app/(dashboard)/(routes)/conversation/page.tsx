"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; //installed with react-hook-form

import { formSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import openai from "openai";

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<openai.ChatCompletionMessage[]>([]);
  // const [messages, setMessages] = useState<openai.ChatCompletionUserMessageParam[]>([]);

  // validation with zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: openai.ChatCompletionUserMessageParam = {
        role: "user",
        content: values.prompt,
      };

      // posting the entire conversation to openAI for context
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });

      // all messages of the current chat add the new message in prompt
      setMessages((current) => [
        ...current,
        userMessage,
        response.data.message,
      ]);

      form.reset();
    } catch (error) {
      // TODO: Open Pro Modal
      console.error(error);
    } finally {
      router.refresh();
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
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => {
              return (
                <div
                  key={index}
                  className={`${
                    message?.role !== "assistant" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    key={index}
                    className="bg-gray-100 p-4 rounded-lg inline-block"
                  >
                    {message?.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
