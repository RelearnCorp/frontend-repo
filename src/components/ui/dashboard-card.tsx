import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps
  extends Omit<React.ComponentProps<typeof Card>, "title"> {
  title: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardCard({
  title,
  action,
  description,
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card className={cn("rounded-2xl px-2 py-6", className)} {...props}>
      <CardHeader className="px-6">
        <CardTitle className="font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="px-6">{children}</CardContent>
    </Card>
  );
}
