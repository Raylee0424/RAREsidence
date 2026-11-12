import { Badge } from "@/components/ui/badge";

// One place that turns API enums into readable labels and consistent colours,
// instead of printing raw values like "AVAILABLE" with per-page variants.
type Status =
  | "AVAILABLE"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "PENDING"
  | "SUBMITTED"
  | "PAID"
  | "OVERDUE"
  | "ACCEPTED"
  | "DECLINED";

const STYLES: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  AVAILABLE: { label: "Available", variant: "default", className: "bg-brand-soft text-brand" },
  OCCUPIED: { label: "Occupied", variant: "secondary" },
  MAINTENANCE: { label: "Maintenance", variant: "outline" },
  PENDING: { label: "Pending", variant: "secondary" },
  SUBMITTED: { label: "Awaiting confirmation", variant: "outline" },
  PAID: { label: "Paid", variant: "default", className: "bg-brand-soft text-brand" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  ACCEPTED: { label: "Accepted", variant: "default", className: "bg-brand-soft text-brand" },
  DECLINED: { label: "Declined", variant: "destructive" },
};

export function StatusBadge({ status }: { status: Status }) {
  const style = STYLES[status];
  return (
    <Badge variant={style.variant} className={style.className}>
      {style.label}
    </Badge>
  );
}
