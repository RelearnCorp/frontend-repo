import { ArrowRight, Rocket, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const FEATURES = [
  {
    icon: Rocket,
    title: "Ship faster",
    description:
      "Pre-wired App Router, Tailwind, and shadcn/ui so you can start building features on day one.",
  },
  {
    icon: ShieldCheck,
    title: "Type-safe by default",
    description:
      "Strict TypeScript across app, components, and services keeps refactors safe as the codebase grows.",
  },
  {
    icon: Sparkles,
    title: "Consistent UI",
    description:
      "A shared design system of accessible, themeable components keeps every screen on-brand.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Launch your next SaaS idea in record time
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          A production-ready Next.js starter with Tailwind CSS, shadcn/ui, and
          a scalable project structure built in.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Dialog>
            <DialogTrigger render={<Button size="lg" />}>
              Get started
              <ArrowRight />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create your account</DialogTitle>
                <DialogDescription>
                  Start your free trial. No credit card required.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="you@company.com" />
                  <FieldDescription>
                    We&apos;ll send a confirmation link to this address.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="submit">Create account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="lg" variant="outline">
            View docs
          </Button>
        </div>
      </section>

      <section
        id="product"
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 size-5 text-primary" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section
        id="pricing"
        className="flex flex-col items-center gap-4 rounded-2xl bg-muted/50 px-6 py-16 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to build?
        </h2>
        <CardContent className="p-0 text-muted-foreground">
          Clone the starter, install dependencies, and ship your first
          feature today.
        </CardContent>
        <Button size="lg">
          Start building
          <ArrowRight />
        </Button>
      </section>
    </div>
  );
}
