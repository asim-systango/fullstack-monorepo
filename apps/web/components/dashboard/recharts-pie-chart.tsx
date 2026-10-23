'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartSegment {
  id?: string;
  label: string;
  value: number;
  color?: string;
  subtext?: string;
}

export interface RechartsPieChartProps {
  title: string;
  subtitle?: string;
  data: ChartSegment[];
  totalLabel?: string;
  emptyMessage?: string;
  icon?: ReactNode;
  className?: string;
  filterSlot?: ReactNode;
}

const DEFAULT_PALETTE = [
  '#4747A1', // Primary Brand Indigo
  '#7978E9', // Secondary Iris Purple
  '#7DA0FA', // Accent Soft Blue
  '#38BDF8', // Sky Blue
  '#34D399', // Emerald Green
  '#F87171', // Coral Red
  '#FBBF24', // Amber
  '#A78BFA', // Light Violet
  '#F472B6', // Pink
  '#2DD4BF', // Teal
  '#FB923C', // Orange
];

interface CustomTooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    color: string;
    fill?: string;
    percentage: number;
    subtext?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
}

function CustomPieTooltip({ active, payload }: Readonly<CustomTooltipProps>) {
  if (active && payload && payload.length > 0 && payload[0]) {
    const item = payload[0];
    const data = item.payload;
    const badgeColor = data.fill || data.color || '#4747A1';

    return (
      <div className="rounded-xl border border-[#7DA0FA]/40 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg backdrop-blur-xs text-xs space-y-1 z-50">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <span
            className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: badgeColor }}
          />
          <span className="truncate max-w-[200px]">{data.name}</span>
        </div>
        {data.subtext && (
          <div className="text-[10px] font-mono text-slate-500">{data.subtext}</div>
        )}
        <div className="flex items-center justify-between gap-4 font-mono pt-1">
          <span className="text-slate-500">Count:</span>
          <span className="font-extrabold text-[#4747A1] dark:text-[#7DA0FA]">
            {data.value.toLocaleString()} units
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 font-mono">
          <span className="text-slate-500">Share:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function RechartsPieChart({
  title,
  subtitle,
  data,
  totalLabel = 'Total',
  emptyMessage = 'No data available',
  icon,
  className = '',
  filterSlot,
}: Readonly<RechartsPieChartProps>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalValue = useMemo(() => {
    return data.reduce((acc, item) => acc + (Math.max(0, item.value) || 0), 0);
  }, [data]);

  const preparedData = useMemo(() => {
    return data
      .filter((item) => item.value > 0)
      .map((item, idx) => {
        const color = item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
        return {
          id: item.id || `seg-${idx}`,
          name: item.label,
          subtext: item.subtext,
          value: Math.max(0, item.value),
          fill: color,
          color,
          percentage: totalValue > 0 ? (Math.max(0, item.value) / totalValue) * 100 : 0,
        };
      });
  }, [data, totalValue]);

  return (
    <div
      className={`rounded-2xl border-2 border-[#7DA0FA]/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4747A1] via-[#7978E9] to-[#7DA0FA]" />

      {/* Card Header */}
      <div className="p-5 pb-3 border-b border-[#7DA0FA]/20 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <h3 className="font-extrabold text-base sm:text-lg text-[#4747A1] dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {filterSlot && <div>{filterSlot}</div>}
      </div>

      {/* Card Body with Recharts Pie Chart & Non-Overlapping Structured Legend */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[300px]">
        {!mounted || totalValue === 0 || preparedData.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 w-full flex-1">
            <div className="h-16 w-16 rounded-full border-4 border-dashed border-[#7DA0FA]/40 flex items-center justify-center text-slate-400 text-xl font-bold">
              0
            </div>
            <p className="text-xs text-slate-500 font-semibold">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {/* Center Pie Graphic */}
            <div className="w-full h-44 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={preparedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={68}
                    innerRadius={0}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clean Structured Legend with Truncation & Percentage Columns */}
            <div className="pt-2 border-t border-[#7DA0FA]/15 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {preparedData.map((entry) => (
                <div
                  key={entry.id || entry.name}
                  className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg hover:bg-[#7DA0FA]/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-bold text-slate-800 dark:text-slate-200 block truncate"
                        title={entry.name}
                      >
                        {entry.name}
                      </span>
                      {entry.subtext && (
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {entry.subtext}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="font-extrabold text-[#4747A1] dark:text-[#7DA0FA]">
                      {entry.value.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-semibold w-11 text-right">
                      {entry.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Summary */}
      <div className="px-5 py-2.5 bg-[#7DA0FA]/5 border-t border-[#7DA0FA]/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold">
          Showing {preparedData.length} {preparedData.length === 1 ? 'slice' : 'slices'}
        </span>
        <span className="font-extrabold text-[#4747A1] dark:text-[#7DA0FA]">
          {totalValue.toLocaleString()} {totalLabel.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
