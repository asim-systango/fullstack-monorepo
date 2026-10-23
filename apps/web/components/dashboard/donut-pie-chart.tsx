'use client';

import { useState, useMemo, type ReactNode } from 'react';

export interface ChartSegment {
  id?: string;
  label: string;
  value: number;
  color?: string;
  subtext?: string;
}

export interface DonutPieChartProps {
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

export function DonutPieChart({
  title,
  subtitle,
  data,
  totalLabel = 'Total',
  emptyMessage = 'No data available',
  icon,
  className = '',
  filterSlot,
}: Readonly<DonutPieChartProps>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = useMemo(() => {
    return data.reduce((acc, item) => acc + (Math.max(0, item.value) || 0), 0);
  }, [data]);

  const preparedData = useMemo(() => {
    return data.map((item, idx) => ({
      ...item,
      color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      percentage: totalValue > 0 ? (Math.max(0, item.value) / totalValue) * 100 : 0,
    }));
  }, [data, totalValue]);

  // Circle parameters for SVG Donut
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327

  // Calculate cumulative offsets
  const segmentsWithOffsets = useMemo(() => {
    let accumulatedAngle = 0;
    return preparedData.map((seg) => {
      const strokeLength = (seg.percentage / 100) * circumference;
      const strokeOffset = -accumulatedAngle;
      accumulatedAngle += strokeLength;
      return {
        ...seg,
        strokeLength,
        strokeOffset,
      };
    });
  }, [preparedData, circumference]);

  const activeSegment = hoveredIndex !== null ? preparedData[hoveredIndex] : null;

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

      {/* Card Body with Donut Chart and Legend */}
      <div className="p-5 flex-1 flex flex-col sm:flex-row items-center justify-around gap-6">
        {totalValue === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 w-full">
            <div className="h-16 w-16 rounded-full border-4 border-dashed border-[#7DA0FA]/40 flex items-center justify-center text-slate-400 text-xl font-bold">
              0
            </div>
            <p className="text-xs text-slate-500 font-semibold">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* SVG Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90"
              >
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="15"
                  className="text-slate-100 dark:text-slate-800"
                />

                {/* Slices */}
                {segmentsWithOffsets.map((seg, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <circle
                      key={seg.label + idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? 18 : 15}
                      strokeDasharray={`${Math.max(0, seg.strokeLength - 1.5)} ${circumference}`}
                      strokeDashoffset={seg.strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                        filter: isHovered
                          ? 'drop-shadow(0px 2px 6px rgba(71,71,161,0.35))'
                          : 'none',
                      }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeSegment ? activeSegment.label : totalLabel}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#4747A1] dark:text-white tracking-tight">
                  {activeSegment
                    ? activeSegment.value.toLocaleString()
                    : totalValue.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#7978E9]">
                  {activeSegment
                    ? `${activeSegment.percentage.toFixed(1)}%`
                    : 'Total Units'}
                </span>
              </div>
            </div>

            {/* Side Legend */}
            <div className="flex-1 w-full max-h-56 overflow-y-auto space-y-2 pr-1">
              {preparedData.map((seg, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <button
                    type="button"
                    key={seg.label + idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all border ${
                      isHovered
                        ? 'bg-[#7DA0FA]/15 border-[#7DA0FA]/60 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-[#7DA0FA]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {seg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-[#4747A1] dark:text-white font-mono">
                        {seg.value.toLocaleString()}
                      </span>
                      <span className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded">
                        {seg.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Card Footer Summary */}
      <div className="px-5 py-2.5 bg-[#7DA0FA]/5 border-t border-[#7DA0FA]/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold">
          Showing {preparedData.length}{' '}
          {preparedData.length === 1 ? 'category' : 'segments'}
        </span>
        <span className="font-extrabold text-[#4747A1] dark:text-[#7DA0FA]">
          {totalValue.toLocaleString()} {totalLabel.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
