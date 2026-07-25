import Link from "next/link";
import { ArrowRight, Rocket, ShieldCheck, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Rocket,
    title: "Socratic AI Tutor",
    description:
      "Guided questioning by default, with a one-tap switch to step-by-step explanations when students feel stuck.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded in your materials",
    description:
      "RAG keeps every answer anchored to the syllabus and lecture notes teachers upload — not generic model knowledge.",
  },
  {
    icon: Sparkles,
    title: "Teacher intelligence",
    description:
      "Learning twin analytics, risk alerts, and concept heatmaps show exactly which students and topics need attention.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-16">
      <section className="relative flex flex-col items-center gap-6 text-center py-12 lg:py-20">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl leading-tight">
          Learning that <span className="font-handwriting text-indigo-500 font-normal text-[1.2em]">asks</span> the <span className="font-handwriting text-amber-500 font-normal text-[1.2em]">right</span> questions
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          Relearn pairs a Socratic AI Tutor with learning twin analytics, so
          students think actively and teachers see exactly where to help.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row mt-4">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 shadow-sm hover:shadow-md transition-all")}>
            Get started
            <ArrowRight />
          </Link>
        </div>
      </section>

      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-left">
          Our <span className="font-handwriting text-indigo-500 font-normal text-4xl">interactive</span> features
        </h2>
        <section
          id="product"
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }, idx) => {
            const cardColors = [
              "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100",
              "bg-indigo-600 text-white dark:bg-indigo-800",
              "bg-amber-300 text-amber-950 dark:bg-amber-500"
            ];
            const iconBg = [
              "bg-indigo-200/50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
              "bg-white/20 text-white",
              "bg-white/40 text-amber-900"
            ];
            const descColor = [
              "text-indigo-700/80 dark:text-indigo-200/80",
              "text-indigo-100",
              "text-amber-800"
            ];
            return (
            <Card key={title} className={cn("border-none shadow-sm rounded-[2rem] p-6 aspect-[4/5] sm:aspect-square flex flex-col justify-end text-left relative overflow-hidden transition-transform hover:-translate-y-1", cardColors[idx % 3])}>
              <div className={cn("absolute top-8 left-8 p-3 rounded-full", iconBg[idx % 3])}>
                <Icon className="size-6" />
              </div>
              <div className="space-y-3 z-10 px-2">
                <h3 className="text-2xl font-bold leading-tight">{title}</h3>
                <p className={cn("text-sm", descColor[idx % 3])}>{description}</p>
              </div>
            </Card>
          )})}
        </section>
      </div>

    </div>
  );
}
