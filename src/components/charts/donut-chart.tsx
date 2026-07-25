import { cn } from "@/lib/utils";

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 88;
const STROKE = 30;

function arcPath(startAngle: number, endAngle: number) {
  const start = {
    x: CENTER + RADIUS * Math.cos(startAngle),
    y: CENTER + RADIUS * Math.sin(startAngle),
  };
  const end = {
    x: CENTER + RADIUS * Math.cos(endAngle),
    y: CENTER + RADIUS * Math.sin(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M${start.x.toFixed(2)},${start.y.toFixed(2)} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)},${end.y.toFixed(2)}`;
}

export function DonutChart({
  percent,
  label,
  className,
}: {
  /** share of the primary (dark) segment, 0–100 */
  percent: number;
  label: string;
  className?: string;
}) {
  const gap = 0.06; // radians of breathing room between segments
  const start = -Math.PI / 2;
  const split = start + (Math.PI * 2 * percent) / 100;
  const end = start + Math.PI * 2;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${percent}% ${label}`}
      className={cn("mx-auto w-full max-w-56", className)}
    >
      <path
        d={arcPath(start + gap, split - gap)}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        className="stroke-chart-3"
      />
      <path
        d={arcPath(split + gap, end - gap)}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        className="stroke-chart-2"
      />
      <text
        x={CENTER}
        y={CENTER - 2}
        textAnchor="middle"
        className="fill-foreground text-3xl font-bold"
      >
        {percent}%
      </text>
      <text
        x={CENTER}
        y={CENTER + 20}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        {label}
      </text>
    </svg>
  );
}
