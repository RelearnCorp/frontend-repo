import {
  ChevronRight,
  Layers,
  Lightbulb,
  Maximize2,
  Waypoints,
} from "lucide-react";

import { EnergyCurveChart } from "@/components/charts/energy-curve-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eyebrow, Muted } from "@/components/ui/typography";

const QUICK_REVIEW_CARDS = [
  {
    title: "Work-Energy Principle",
    description: "The net work done on an object equals its change in KE.",
  },
  {
    title: "Conservative Forces",
    description: "Forces where the total work done is independent of the path.",
  },
  {
    title: "Kinetic Energy",
    description: "Energy of motion: KE = ½mv², scaling with velocity squared.",
  },
  {
    title: "Momentum Conservation",
    description: "Total momentum stays constant in an isolated system.",
  },
];

export function TutorSidebar() {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-7 overflow-y-auto border-r bg-background p-5 xl:flex">
      <section>
        <div className="flex items-center justify-between pb-3">
          <Eyebrow render={<h2 />} className="flex items-center gap-2 text-xs text-foreground">
            <Lightbulb className="size-4 text-amber-500" />
            Hint Buddy
          </Eyebrow>
          <Badge className="bg-amber-100 text-[10px] font-bold tracking-wide text-amber-700 uppercase dark:bg-amber-950 dark:text-amber-300">
            Nudge Ready
          </Badge>
        </div>
        <Card
          size="sm"
          className="gap-2 bg-amber-50 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-900"
        >
          <p className="px-(--card-spacing) text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            &ldquo;Think about the relationship between velocity and mass. If
            the mass doubles but the velocity stays the same, what happens to
            the total energy?&rdquo;
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto justify-start self-start px-(--card-spacing) font-bold text-amber-700 dark:text-amber-300"
          >
            Tell me more
            <ChevronRight />
          </Button>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between pb-3">
          <Eyebrow render={<h2 />} className="flex items-center gap-2 text-xs text-foreground">
            <Layers className="size-4 text-indigo-500" />
            Quick Review
          </Eyebrow>
          <span className="text-[11px] font-medium text-muted-foreground">
            {QUICK_REVIEW_CARDS.length} Cards
          </span>
        </div>
        <div className="space-y-3">
          {QUICK_REVIEW_CARDS.map((card) => (
            <Card
              key={card.title}
              size="sm"
              className="gap-0.5 transition-colors hover:bg-sidebar-accent/40"
            >
              <CardHeader>
                <CardTitle className="text-sm font-semibold" render={<h3 />}>
                  {card.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-auto">
        <div className="flex items-center justify-between pb-3">
          <Eyebrow render={<h2 />} className="flex items-center gap-2 text-xs text-foreground">
            <Waypoints className="size-4 text-teal-500" />
            Concept Map
          </Eyebrow>
          <Button variant="ghost" size="icon-xs" aria-label="Expand concept map">
            <Maximize2 />
          </Button>
        </div>
        <Card size="sm" className="gap-2 bg-muted/40">
          <figure>
            <figcaption className="px-(--card-spacing) pb-1 text-xs font-medium text-muted-foreground">
              Energy vs. Velocity (v²)
            </figcaption>
            <EnergyCurveChart compact className="px-2" />
            <Muted className="mx-(--card-spacing) mt-2 rounded-lg bg-card px-3 py-2 text-[11px] ring-1 ring-foreground/5">
              Visualizing: Kinetic Energy vs. Velocity Squared
            </Muted>
          </figure>
        </Card>
      </section>
    </aside>
  );
}
