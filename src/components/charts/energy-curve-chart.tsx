"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const WIDTH = 640;
const HEIGHT = 340;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 44 };

const MAX_V = 10;
const MAX_E = 100;

const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

const xScale = (v: number) => MARGIN.left + (v / MAX_V) * plotWidth;
const yScale = (e: number) => MARGIN.top + (1 - e / MAX_E) * plotHeight;

/** KE = 1/2 * m * v^2 with m = 2kg → E = v^2 */
const energy = (v: number) => v * v;

const curvePath = (() => {
  const steps = 60;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const v = (i / steps) * MAX_V;
    return `${i === 0 ? "M" : "L"}${xScale(v).toFixed(1)},${yScale(energy(v)).toFixed(1)}`;
  }).join("");
})();

const areaPath = `${curvePath}L${xScale(MAX_V)},${yScale(0)}L${xScale(0)},${yScale(0)}Z`;

export function EnergyCurveChart({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverV, setHoverV] = useState<number | null>(null);

  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const v = Math.round(((x - MARGIN.left) / plotWidth) * MAX_V);
    setHoverV(v >= 0 && v <= MAX_V ? v : null);
  };

  const yTicks = [0, 20, 40, 60, 80, 100];
  const xTicks = [0, 2, 4, 6, 8, 10];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Kinetic energy versus velocity. Energy grows with the square of velocity, reaching 100 joules at 10 meters per second."
      className={cn("w-full", className)}
      onPointerMove={compact ? undefined : handleMove}
      onPointerLeave={compact ? undefined : () => setHoverV(null)}
    >
      {/* grid */}
      {yTicks.map((e) => (
        <line
          key={`y-${e}`}
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={yScale(e)}
          y2={yScale(e)}
          className="stroke-muted"
        />
      ))}
      {xTicks.map((v) => (
        <line
          key={`x-${v}`}
          x1={xScale(v)}
          x2={xScale(v)}
          y1={MARGIN.top}
          y2={HEIGHT - MARGIN.bottom}
          className="stroke-muted"
        />
      ))}

      {/* axis labels */}
      {!compact &&
        yTicks.map((e) => (
          <text
            key={`yl-${e}`}
            x={MARGIN.left - 8}
            y={yScale(e) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            {e}
          </text>
        ))}
      {!compact &&
        xTicks.map((v) => (
          <text
            key={`xl-${v}`}
            x={xScale(v)}
            y={HEIGHT - MARGIN.bottom + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {v}
          </text>
        ))}

      <path d={areaPath} className="fill-chart-1/10" />
      <path
        d={curvePath}
        fill="none"
        strokeWidth={2.5}
        className="stroke-chart-1"
        strokeLinecap="round"
      />

      {/* data markers at integer velocities */}
      {Array.from({ length: MAX_V }, (_, i) => i + 1).map((v) => (
        <circle
          key={v}
          cx={xScale(v)}
          cy={yScale(energy(v))}
          r={3}
          className="fill-chart-1 stroke-background"
          strokeWidth={1.5}
        />
      ))}

      {/* hover crosshair + tooltip */}
      {hoverV !== null && (
        <g pointerEvents="none">
          <line
            x1={xScale(hoverV)}
            x2={xScale(hoverV)}
            y1={MARGIN.top}
            y2={HEIGHT - MARGIN.bottom}
            className="stroke-muted-foreground/50"
            strokeDasharray="3 3"
          />
          <circle
            cx={xScale(hoverV)}
            cy={yScale(energy(hoverV))}
            r={5}
            className="fill-chart-1 stroke-background"
            strokeWidth={2}
          />
          <g
            transform={`translate(${Math.min(xScale(hoverV) + 10, WIDTH - 128)}, ${Math.max(yScale(energy(hoverV)) - 44, MARGIN.top)})`}
          >
            <rect
              width={118}
              height={38}
              rx={8}
              className="fill-foreground/90"
            />
            <text x={10} y={16} className="fill-background/70 text-[10px]">
              v = {hoverV} m/s
            </text>
            <text x={10} y={30} className="fill-background text-[11px] font-semibold">
              KE = {energy(hoverV)} J
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
