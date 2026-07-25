import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold tracking-tight",
      h2: "text-2xl font-bold tracking-tight",
      h3: "text-xl font-bold tracking-tight",
      h4: "text-lg font-semibold tracking-tight",
      lead: "text-lg text-muted-foreground",
      p: "text-sm leading-relaxed",
      muted: "text-sm text-muted-foreground",
      eyebrow:
        "text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

const DEFAULT_TAG = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  p: "p",
  muted: "p",
  eyebrow: "p",
} as const

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

function Typography({
  className,
  variant = "p",
  render,
  ...props
}: useRender.ComponentProps<"p"> & VariantProps<typeof typographyVariants>) {
  return useRender({
    defaultTagName: DEFAULT_TAG[variant ?? "p"],
    props: mergeProps<"p">(
      {
        className: cn(typographyVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "typography",
      variant,
    },
  })
}

type VariantProp = Omit<
  useRender.ComponentProps<"p"> & VariantProps<typeof typographyVariants>,
  "variant"
>

const H1 = (props: VariantProp) => <Typography variant="h1" {...props} />
const H2 = (props: VariantProp) => <Typography variant="h2" {...props} />
const H3 = (props: VariantProp) => <Typography variant="h3" {...props} />
const H4 = (props: VariantProp) => <Typography variant="h4" {...props} />
const P = (props: VariantProp) => <Typography variant="p" {...props} />
const Lead = (props: VariantProp) => <Typography variant="lead" {...props} />
const Muted = (props: VariantProp) => <Typography variant="muted" {...props} />
const Eyebrow = (props: VariantProp) => (
  <Typography variant="eyebrow" {...props} />
)

export {
  Typography,
  typographyVariants,
  type TypographyVariant,
  H1,
  H2,
  H3,
  H4,
  P,
  Lead,
  Muted,
  Eyebrow,
}
