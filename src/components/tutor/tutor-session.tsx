"use client";

import { useEffect, useRef, useState } from "react";
import { CircleHelp, Send, TriangleAlert, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/typography";
import { TiredButton } from "@/components/tutor/tired-button";
import { aiApi } from "@/services/api";
import { ApiError, tokenStore } from "@/services/http";

const EXPLAIN_CONTEXT =
  "The student asked for a direct, step-by-step explanation instead of guided questions.";

type ChatMessage =
  | { id: number; kind: "ai"; text: string }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "error"; text: string };

function AiAvatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <CircleHelp className="size-4" />
    </span>
  );
}

function AiMessage({ text }: { text: string }) {
  return (
    <div className="flex max-w-3xl gap-3">
      <AiAvatar />
      <div className="min-w-0">
        <p className="flex items-center gap-2 pb-2">
          <span className="text-sm font-bold">Relearn AI</span>
        </p>
        <Card size="sm" className="gap-3 rounded-2xl rounded-tl-sm">
          <CardContent className="space-y-3 text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end gap-3">
      <div className="flex flex-col items-end">
        <p className="pb-2 text-sm font-bold">You</p>
        <p className="max-w-xl rounded-2xl rounded-tr-sm bg-indigo-600 px-5 py-3.5 text-sm leading-relaxed text-white shadow-xs">
          {text}
        </p>
      </div>
      <span className="mt-7 flex size-9 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
        <User className="size-4" />
      </span>
    </div>
  );
}

function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="flex max-w-3xl gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-4" />
      </span>
      <Card size="sm" className="gap-3 rounded-2xl rounded-tl-sm border-destructive/30">
        <CardContent className="text-sm leading-relaxed text-destructive">{text}</CardContent>
      </Card>
    </div>
  );
}

export function TutorSession({ classContext }: { classContext?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [explainMode, setExplainMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const nextId = useRef(1);
  const feedRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTo({
      top: feed.scrollHeight,
      behavior: hasMounted.current ? "smooth" : "instant",
    });
    hasMounted.current = true;
  }, [messages, isThinking]);

  const append = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ } as ChatMessage]);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft("");
    append({ kind: "user", text });
    setIsThinking(true);

    try {
      if (!tokenStore.getAccessToken()) {
        throw new ApiError("UNAUTHORIZED", "You need to be signed in to chat with the AI tutor.", 401);
      }
      sessionId.current ??= crypto.randomUUID();
      const context = [classContext, explainMode ? EXPLAIN_CONTEXT : null]
        .filter(Boolean)
        .join(" ");
      const data = await aiApi.chat({
        session_id: sessionId.current,
        message: text,
        context: context || undefined,
      });
      append({ kind: "ai", text: data.message });
    } catch (err) {
      append({
        kind: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Couldn't reach the AI tutor. Please try again.",
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div
        ref={feedRef}
        role="log"
        aria-live="polite"
        aria-label="Tutoring conversation"
        className="flex-1 space-y-8 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <AiAvatar />
            <p className="pt-2 text-sm font-semibold">Ask the AI tutor anything</p>
            <p className="max-w-xs text-xs">
              Questions about your class material, a concept you&apos;re stuck
              on, or anything else you&apos;re studying.
            </p>
          </div>
        )}
        {messages.map((message) => {
          switch (message.kind) {
            case "ai":
              return <AiMessage key={message.id} text={message.text} />;
            case "user":
              return <UserMessage key={message.id} text={message.text} />;
            case "error":
              return <ErrorMessage key={message.id} text={message.text} />;
          }
        })}
        {isThinking && (
          <div className="flex items-center gap-3">
            <AiAvatar />
            <span className="flex gap-1 rounded-2xl border bg-card px-4 py-3">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40"
                  style={{ animationDelay: `${dot * 150}ms` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t bg-background px-4 pt-4 pb-3 sm:px-8">
        <div className="flex justify-center pb-4">
          <TiredButton
            active={explainMode}
            onClick={() => setExplainMode((v) => !v)}
          />
        </div>

        <form onSubmit={handleSend} className="mx-auto flex max-w-4xl gap-3">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question…"
            className="h-12 flex-1 rounded-xl bg-muted/40 px-4"
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl px-6 font-bold"
            disabled={!draft.trim() || isThinking}
          >
            Send
            <Send />
          </Button>
        </form>

        <Eyebrow className="flex items-center justify-center gap-5 pt-3 text-[10px]">
          <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase">
            AI Tutor
          </Badge>
        </Eyebrow>
      </div>
    </div>
  );
}
