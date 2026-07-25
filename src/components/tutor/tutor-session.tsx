"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CircleHelp,
  Mic,
  Send,
  ThumbsDown,
  ThumbsUp,
  ToggleLeft,
  User,
  WandSparkles,
} from "lucide-react";

import { EnergyCurveChart } from "@/components/charts/energy-curve-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aiApi } from "@/services/api";
import { tokenStore } from "@/services/http";

const MODE_CONTEXT = {
  socratic:
    "Use the Socratic method: respond with guiding questions and progressive hints instead of direct answers. Topic: kinetic energy (KE = 1/2 m v^2).",
  explainable:
    "The student pressed 'I give up'. Switch to Explainable AI mode: give a complete step-by-step explanation, then end with one short verification question. Topic: kinetic energy.",
} as const;

type ChatBody =
  | { kind: "ai"; paragraphs: string[]; question?: string }
  | { kind: "user"; text: string }
  | { kind: "chart" }
  | { kind: "breakdown" };

type ChatMessage = ChatBody & { id: number };

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    kind: "ai",
    paragraphs: [
      "Excellent progress, Alex! Let's visualize how the energy scales. Look at the graph below—notice how the slope increases rapidly as velocity goes up? That's the v² relationship in action.",
    ],
    question:
      "If you were to double the velocity from 5m/s to 10m/s, by what factor does the kinetic energy increase on the Y-axis?",
  },
  { id: 2, kind: "chart" },
  {
    id: 3,
    kind: "user",
    text: "Ah, I see! It increases from 25J to 100J. So it quadruples, just like the theory says!",
  },
  {
    id: 4,
    kind: "ai",
    paragraphs: [
      "Great start on that calculation! Before we move on to the final answer, looking at your work for Step 2…",
    ],
    question:
      "Why do you think we need to square the velocity in the kinetic energy formula KE = ½mv²? What physical reality is that reflecting?",
  },
  {
    id: 5,
    kind: "user",
    text: "Honestly, I'm not sure. I just know it's the formula. Is it because energy is a scalar?",
  },
];

const SOCRATIC_REPLY: ChatBody = {
  kind: "ai",
  paragraphs: ["Interesting thought—let's test it against the graph together."],
  question:
    "Pick two velocities on the curve where one is double the other. What happens to the energy each time you double it?",
};

const VERIFICATION_REPLY: ChatBody = {
  kind: "ai",
  paragraphs: [
    "Welcome back to Socratic mode! Now that we've broken down where v² comes from, here's a quick check of your understanding.",
  ],
  question:
    "A 4kg ball is moving at 3m/s. Using KE = ½mv², what is its kinetic energy in joules?",
};

const BREAKDOWN_STEPS = [
  {
    title: "Work-Energy Theorem",
    body: "Energy is the capacity to do work. Work is Force × Distance. When we integrate force over distance (F = ma), we mathematically derive v².",
  },
  {
    title: "Quadratic Scaling",
    body: "This means if you double your speed, you don't double your energy—you quadruple it. This is why car crashes are significantly more dangerous at 60mph than 30mph.",
  },
];

function AiAvatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <CircleHelp className="size-4" />
    </span>
  );
}

function AiMessage({
  paragraphs,
  question,
}: {
  paragraphs: string[];
  question?: string;
}) {
  const [feedback, setFeedback] = useState<"helpful" | "confusing" | null>(
    null,
  );

  return (
    <div className="flex max-w-3xl gap-3">
      <AiAvatar />
      <div className="min-w-0">
        <p className="flex items-center gap-2 pb-2">
          <span className="text-sm font-bold">Relearn AI</span>
          <Badge className="bg-indigo-50 text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:bg-indigo-950/60 dark:text-indigo-300">
            Socratic Mode
          </Badge>
        </p>
        <Card size="sm" className="gap-3 rounded-2xl rounded-tl-sm">
          <CardContent className="space-y-3 text-sm leading-relaxed">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {question && <p className="font-semibold">{question}</p>}
          </CardContent>
        </Card>
        <div className="flex items-center gap-2 pt-1.5">
          <Button
            variant="ghost"
            size="xs"
            aria-pressed={feedback === "helpful"}
            onClick={() =>
              setFeedback(feedback === "helpful" ? null : "helpful")
            }
            className={cn(
              "text-muted-foreground",
              feedback === "helpful" &&
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
            )}
          >
            <ThumbsUp />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="xs"
            aria-pressed={feedback === "confusing"}
            onClick={() =>
              setFeedback(feedback === "confusing" ? null : "confusing")
            }
            className={cn(
              "text-muted-foreground",
              feedback === "confusing" &&
                "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
            )}
          >
            <ThumbsDown />
            Confusing
          </Button>
        </div>
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

function ChartCard() {
  return (
    <Card className="max-w-3xl gap-0 rounded-2xl py-0 ring-indigo-100 dark:ring-indigo-950">
      <CardHeader className="flex-row items-center border-b border-indigo-100 bg-indigo-50/60 py-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] dark:border-indigo-950 dark:bg-indigo-950/40">
        <p className="flex items-center gap-2 text-sm font-bold">
          <WandSparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
          Interactive Energy Scaling
        </p>
        <span className="ml-auto text-[10px] font-bold tracking-wider text-indigo-500 uppercase dark:text-indigo-400">
          Live Simulation
        </span>
      </CardHeader>
      <CardContent className="py-5">
        <EnergyCurveChart />
        <p className="mt-3 rounded-lg border px-4 py-2.5 text-xs text-muted-foreground">
          Visualizing: Kinetic Energy (KE = ½mv²) with Mass = 2kg
        </p>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="max-w-3xl gap-0 rounded-2xl py-0 ring-indigo-200 dark:ring-indigo-900">
      <CardHeader className="flex-row items-center gap-3 bg-indigo-50 py-3 dark:bg-indigo-950/50">
        <p className="flex items-center gap-2 text-sm font-bold">
          <WandSparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
          Explainable AI Breakdown
        </p>
        <span className="ml-auto text-right text-[10px] font-bold tracking-wider text-indigo-500 uppercase dark:text-indigo-400">
          Activated via &ldquo;I Give Up&rdquo;
        </span>
      </CardHeader>
      <CardContent className="py-5">
        <ol className="space-y-5 px-2">
          {BREAKDOWN_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-teal-300 bg-teal-50 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold">{step.title}</p>
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="justify-center bg-transparent py-3.5">
        <Button
          variant="link"
          onClick={onContinue}
          className="h-auto p-0 font-bold text-indigo-600 dark:text-indigo-400"
        >
          Continue Socratic Learning Session
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TutorSession() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [mode, setMode] = useState<"socratic" | "explainable">("socratic");
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"unknown" | "live" | "offline">(
    "unknown",
  );
  const nextId = useRef(INITIAL_MESSAGES.length + 1);
  const feedRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  // Synchronous mirror of `mode` so rapid double-clicks can't slip past the
  // guards before React re-renders.
  const modeRef = useRef(mode);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    // Jump instantly on first paint; smooth-scroll only for new messages.
    feed.scrollTo({
      top: feed.scrollHeight,
      behavior: hasMounted.current ? "smooth" : "instant",
    });
    hasMounted.current = true;
  }, [messages, isThinking]);

  const append = (message: ChatBody) => {
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);
  };

  const handleGiveUp = () => {
    if (modeRef.current === "explainable") return;
    modeRef.current = "explainable";
    setMode("explainable");
    append({ kind: "breakdown" });
  };

  const handleContinue = () => {
    if (modeRef.current === "socratic") return;
    modeRef.current = "socratic";
    setMode("socratic");
    append(VERIFICATION_REPLY);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft("");
    append({ kind: "user", text });
    setIsThinking(true);

    // Backed by POST /ai/chat when the backend is reachable and the user is
    // logged in; otherwise fall back to the scripted demo reply.
    try {
      if (!tokenStore.getAccessToken()) throw new Error("not authenticated");
      sessionId.current ??= crypto.randomUUID();
      const data = await aiApi.chat({
        session_id: sessionId.current,
        message: text,
        context: MODE_CONTEXT[modeRef.current],
      });
      setLiveStatus("live");
      append({
        kind: "ai",
        paragraphs: data.message.split(/\n{2,}/).filter(Boolean),
      });
    } catch {
      setLiveStatus("offline");
      append(SOCRATIC_REPLY);
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
        {messages.map((message) => {
          switch (message.kind) {
            case "ai":
              return (
                <AiMessage
                  key={message.id}
                  paragraphs={message.paragraphs}
                  question={message.question}
                />
              );
            case "user":
              return <UserMessage key={message.id} text={message.text} />;
            case "chart":
              return <ChartCard key={message.id} />;
            case "breakdown":
              return (
                <BreakdownCard key={message.id} onContinue={handleContinue} />
              );
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
          <Button
            variant="outline"
            onClick={handleGiveUp}
            aria-pressed={mode === "explainable"}
            className={cn(
              "h-auto gap-3 rounded-full px-5 py-2.5 text-left shadow-xs",
              mode === "explainable" &&
                "border-indigo-300 bg-indigo-50 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/60 dark:hover:bg-indigo-950/60",
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ToggleLeft className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-bold">
                I&apos;m Tired / I Give Up
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {mode === "explainable"
                  ? "Step-by-Step Explanation active for this topic"
                  : "Switch to Step-by-Step Explanation"}
              </span>
            </span>
          </Button>
        </div>

        <form onSubmit={handleSend} className="mx-auto flex max-w-4xl gap-3">
          <div className="relative flex-1">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a follow-up or answer the question..."
              className="h-12 rounded-xl bg-muted/40 pr-11 pl-4"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Voice input"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
            >
              <Mic className="size-4.5" />
            </Button>
          </div>
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

        <p className="flex items-center justify-center gap-5 pt-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                liveStatus === "offline" ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            {liveStatus === "live"
              ? "Groq Live"
              : liveStatus === "offline"
                ? "Offline Demo"
                : "Groq Powered"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            RAG Verified
          </span>
        </p>
      </div>
    </div>
  );
}
