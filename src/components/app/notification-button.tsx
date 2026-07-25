import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Notifications"
      disabled
      title="Notifications are coming soon"
      className="relative text-muted-foreground"
    >
      <Bell className="size-5" />
    </Button>
  );
}
