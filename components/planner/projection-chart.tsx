"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import { formatInr, ProjectionPoint } from "@/lib/finance";
import { Milestone } from "@/components/planner/types";

type ProjectionChartProps = {
  data: ProjectionPoint[];
  goalName: string;
  projectedCorpus: number;
  milestones: Milestone[];
};

type TooltipValue = number | string;
type TooltipName = string;

function ProjectionTooltip({ active, payload, label }: TooltipProps<TooltipValue, TooltipName>) {
  if (!active || !payload || payload.length === 0) return null;

  const investmentValue = payload.find((item) => item.dataKey === "investmentGrowth")?.value;
  const inflationValue = payload.find((item) => item.dataKey === "goalInflationCost")?.value;
  const goalTodayValue = payload.find((item) => item.dataKey === "goalCostToday")?.value;

  return (
    <div className="min-w-[220px] rounded-xl border border-[#c2cfdf] bg-white p-3 shadow-sm">
      <p className="mb-2 text-sm font-bold text-[var(--text-900)]">Year {String(label)}</p>
      <p className="text-xs font-semibold text-[#224c87]">
        Investment Value: {typeof investmentValue === "number" ? formatInr(investmentValue) : "-"}
      </p>
      <p className="text-xs font-semibold text-[#da3832]">
        Goal Cost After Inflation: {typeof inflationValue === "number" ? formatInr(inflationValue) : "-"}
      </p>
      <p className="text-xs font-semibold text-[#5c6f85]">
        Goal Cost Today: {typeof goalTodayValue === "number" ? formatInr(goalTodayValue) : "-"}
      </p>
    </div>
  );
}

export function ProjectionChart({ data, goalName, projectedCorpus, milestones }: ProjectionChartProps) {
  const yAxisMax = useMemo(() => {
    const maxValue = data.reduce((max, point) => {
      return Math.max(max, point.investmentGrowth, point.goalInflationCost);
    }, 0);

    return maxValue > 0 ? Math.ceil(maxValue * 1.08) : 100000;
  }, [data]);

  const markerData = useMemo(() => {
    const markerYears = new Map(milestones.map((milestone) => [milestone.year, milestone.label]));

    return data
      .filter((point) => markerYears.has(point.year))
      .map((point) => ({
        year: point.year,
        value: point.investmentGrowth,
        label: markerYears.get(point.year) || "",
      }));
  }, [data, milestones]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-700)]">
            Projection Focus
          </p>
          <h3 className="text-xl font-bold text-[var(--text-900)]">{goalName} Growth Chart</h3>
        </div>
        <div className="rounded-xl bg-[var(--highlight)] px-4 py-2 text-right">
          <p className="text-xs font-semibold text-[var(--primary)]">Projected Corpus</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{formatInr(projectedCorpus)}</p>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
        <span className="inline-flex items-center gap-1 text-[#224c87]">
          <span className="h-2 w-5 rounded bg-[#224c87]" /> Investment growth
        </span>
        <span className="inline-flex items-center gap-1 text-[var(--accent)]">
          <span className="h-2 w-5 rounded bg-[var(--accent)]" /> Goal inflation growth
        </span>
        <span className="inline-flex items-center gap-1 text-[var(--text-700)]">
          <span className="h-2 w-5 rounded bg-[var(--text-700)]" /> Goal cost today
        </span>
      </div>

      <div
        className="h-[300px] w-full rounded-xl border border-[var(--border)] p-2 md:h-[380px]"
        role="img"
        aria-label="Projection chart showing investment growth, goal inflation growth, goal cost today, and milestone markers"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="investmentAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#224c87" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#224c87" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#d9e3f2" strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              interval={0}
              minTickGap={0}
              tick={{ fill: "#314964", fontSize: 11 }}
              tickFormatter={(value: number) => `Y${value}`}
            />
            <YAxis
              width={66}
              domain={[0, yAxisMax]}
              tick={{ fill: "#314964", fontSize: 12 }}
              tickFormatter={(value: number) => `${Math.round(value / 100000)}L`}
            />
            <Tooltip content={<ProjectionTooltip />} />

            <Area
              type="monotone"
              dataKey="investmentGrowth"
              stroke="none"
              fill="url(#investmentAreaGradient)"
              fillOpacity={1}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="investmentGrowth"
              stroke="#224c87"
              strokeWidth={3}
              dot={false}
              name="Investment Growth"
            />
            <Line
              type="monotone"
              dataKey="goalInflationCost"
              stroke="#da3832"
              strokeWidth={2.5}
              dot={false}
              name="Goal Inflation Growth"
            />
            <Line
              type="monotone"
              dataKey="goalCostToday"
              stroke="#5c6f85"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Goal Cost Today"
            />

            {markerData.map((marker) => (
              <ReferenceDot
                key={`milestone-${marker.year}`}
                x={marker.year}
                y={marker.value}
                r={4}
                fill="#132640"
                stroke="#ffffff"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-[var(--text-700)]">
        {markerData.map((marker) => (
          <span key={marker.year} className="rounded-full bg-[var(--surface-soft)] px-2 py-1">
            Year {marker.year}: {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
}
