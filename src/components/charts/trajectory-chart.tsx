import { cn } from "@/lib/utils";

export type TrajectoryPoint = {
  label: string;
  actual: number;
  predicted: number;
};

const WIDTH = 680;
const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 30, left: 36 };
const MAX_Y = 90;

const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

export function TrajectoryChart({
  points,
  className,
}: {
  points: TrajectoryPoint[];
  className?: string;
}) {
  const x = (i: number) =>
    MARGIN.left + (i / (points.length - 1)) * plotWidth;
  const y = (value: number) =>
    MARGIN.top + (1 - value / MAX_Y) * plotHeight;

  const line = (key: "actual" | "predicted") =>
    points
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`,
      )
      .join("");

  const area = `${line("actual")}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const yTicks = [0, 20, 40, 60, 80];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Learning twin trajectory: actual class mastery versus AI-predicted mastery over the last five weeks."
      className={cn("w-full", className)}
    >
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={y(tick)}
            y2={y(tick)}
            className="stroke-muted"
          />
          <text
            x={MARGIN.left - 8}
            y={y(tick) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            {tick}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <text
          key={p.label}
          x={x(i)}
          y={HEIGHT - MARGIN.bottom + 18}
          textAnchor={
            i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
          }
          className="fill-muted-foreground text-[11px]"
        >
          {p.label}
        </text>
      ))}

      <path d={area} className="fill-muted-foreground/10" />
      <path
        d={line("predicted")}
        fill="none"
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
        className="stroke-chart-2"
      />
      <path
        d={line("actual")}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="stroke-chart-3"
      />
      {points.map((p, i) => (
        <circle
          key={p.label}
          cx={x(i)}
          cy={y(p.actual)}
          r={3.5}
          className="fill-chart-3 stroke-background"
          strokeWidth={1.5}
        >
          <title>{`${p.label}: actual ${p.actual}, predicted ${p.predicted}`}</title>
        </circle>
      ))}
    </svg>
  );
}
