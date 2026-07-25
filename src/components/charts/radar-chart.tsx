import { cn } from "@/lib/utils";

export type RadarAxis = {
  label: string;
  /** 0–1 */
  value: number;
  /** 0–1 */
  baseline: number;
};

const WIDTH = 560;
const HEIGHT = 400;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2 + 6;
const RADIUS = 140;

function polygonPoints(values: number[]) {
  return values
    .map((value, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const x = CENTER_X + Math.cos(angle) * RADIUS * value;
      const y = CENTER_Y + Math.sin(angle) * RADIUS * value;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function RadarChart({
  axes,
  className,
}: {
  axes: RadarAxis[];
  className?: string;
}) {
  const labelPos = axes.map((_, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const anchor: "start" | "middle" | "end" =
      Math.abs(Math.cos(angle)) < 0.3
        ? "middle"
        : Math.cos(angle) > 0
          ? "start"
          : "end";
    return {
      x: CENTER_X + Math.cos(angle) * (RADIUS + 26),
      y: CENTER_Y + Math.sin(angle) * (RADIUS + 26),
      anchor,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Learning twin radar chart comparing the student against the class average across ${axes
        .map((a) => a.label)
        .join(", ")}.`}
      className={cn("mx-auto w-full max-w-md", className)}
    >
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RADIUS}
        fill="none"
        className="stroke-border"
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RADIUS * 0.55}
        fill="none"
        className="stroke-muted"
      />
      {axes.map((axis, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        return (
          <line
            key={axis.label}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={CENTER_X + Math.cos(angle) * RADIUS}
            y2={CENTER_Y + Math.sin(angle) * RADIUS}
            className="stroke-border"
          />
        );
      })}

      <polygon
        points={polygonPoints(axes.map((a) => a.baseline))}
        className="fill-muted-foreground/15 stroke-muted-foreground"
        strokeWidth={1.5}
      />
      <polygon
        points={polygonPoints(axes.map((a) => a.value))}
        className="fill-chart-1/20 stroke-chart-1"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {axes.map((axis, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const x = CENTER_X + Math.cos(angle) * RADIUS * axis.value;
        const y = CENTER_Y + Math.sin(angle) * RADIUS * axis.value;
        return (
          <circle
            key={axis.label}
            cx={x}
            cy={y}
            r={3.5}
            className="fill-chart-1 stroke-background"
            strokeWidth={1.5}
          >
            <title>{`${axis.label}: ${Math.round(axis.value * 100)} (class avg ${Math.round(axis.baseline * 100)})`}</title>
          </circle>
        );
      })}

      {axes.map((axis, i) => (
        <text
          key={axis.label}
          x={labelPos[i].x}
          y={labelPos[i].y + 4}
          textAnchor={labelPos[i].anchor}
          className="fill-muted-foreground text-[13px]"
        >
          {axis.label}
        </text>
      ))}
    </svg>
  );
}
