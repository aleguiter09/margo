"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { SendHorizonal, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { cn } from "@/modules/shared/utils/cn";
import { CreateMovementApprovalCard } from "./CreateMovementApprovalCard";

const SUGGESTION_KEYS = [
  "monthSummary",
  "cashflow",
  "budgets",
  "addExpense",
] as const;

export function AiChat() {
  const t = useTranslations("ai");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, error, addToolApprovalResponse } =
    useChat({
      transport,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    void sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="flex h-[calc(100dvh-var(--navbar-height)-env(safe-area-inset-bottom,0px)-2.5rem)] flex-col">
      <header className="mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xs">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
            <div>
              <p className="font-medium text-foreground">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("emptyDescription")}
              </p>
            </div>
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {SUGGESTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={isBusy}
                  onClick={() => submitText(t(`suggestions.${key}`))}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {t(`suggestions.${key}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const textParts = message.parts.filter(
                (part) => part.type === "text" && part.text.trim().length > 0,
              );
              const toolParts = message.parts.filter(
                (part) =>
                  isToolUIPart(part) && part.type === "tool-createMovement",
              );

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[90%] flex-col gap-1",
                    message.role === "user" ? "items-end self-end" : "items-start self-start",
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === "user" ? t("you") : t("assistant")}
                  </span>
                  {textParts.length > 0 ? (
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-foreground",
                      )}
                    >
                      {textParts.map((part, index) =>
                        part.type === "text" ? (
                          <span key={`${message.id}-text-${index}`}>
                            {part.text}
                          </span>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                  {toolParts.map((part) => {
                    if (
                      !isToolUIPart(part) ||
                      part.type !== "tool-createMovement"
                    ) {
                      return null;
                    }

                    const approvalId =
                      "approval" in part &&
                      part.approval &&
                      typeof part.approval === "object" &&
                      "id" in part.approval
                        ? String(part.approval.id)
                        : undefined;

                    return (
                      <CreateMovementApprovalCard
                        key={part.toolCallId}
                        state={part.state}
                        input={
                          (part.input ?? {}) as {
                            type?: string;
                            amount?: number;
                            description?: string;
                            date?: string;
                            accountName?: string;
                            categoryName?: string;
                            toAccountName?: string;
                            schedule?: string;
                            frequency?: string;
                            installmentCount?: number;
                          }
                        }
                        output={
                          "output" in part
                            ? (part.output as
                                | { success: true; summary: string }
                                | { success: false; error: string }
                                | undefined)
                            : undefined
                        }
                        approvalId={approvalId}
                        onApprove={(id) =>
                          void addToolApprovalResponse({
                            id,
                            approved: true,
                          })
                        }
                        onDeny={(id) =>
                          void addToolApprovalResponse({
                            id,
                            approved: false,
                            reason: "User cancelled",
                          })
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
            {isBusy ? (
              <p className="text-sm text-muted-foreground">{t("thinking")}</p>
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {t("error")}
        </p>
      ) : null}

      <form
        className="mt-3 flex shrink-0 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitText(input);
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          disabled={isBusy}
          aria-label={t("placeholder")}
          className="bg-card"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isBusy || !input.trim()}
          aria-label={t("send")}
        >
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
}
