import type { ReactNode } from 'react';

export interface HeaderStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  tone?: 'primary' | 'success' | 'danger' | 'neutral';
  icon?: string;
}

export function HeaderStatCard({
  label,
  value,
  subtext,
  tone = 'primary',
  icon,
}: Readonly<HeaderStatCardProps>) {
  let containerToneClass = 'bg-[#7DA0FA]/10 border-[#7DA0FA]/40 hover:bg-[#7DA0FA]/15';
  let labelToneClass = 'text-[#4747A1] dark:text-[#7DA0FA]';
  let valueToneClass = 'text-[#4747A1] dark:text-white';
  let subtextToneClass = 'text-slate-600 dark:text-slate-400 font-semibold';

  if (tone === 'success') {
    containerToneClass =
      'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15';
    labelToneClass = 'text-emerald-700 dark:text-emerald-400';
    valueToneClass = 'text-emerald-700 dark:text-emerald-300';
    subtextToneClass = 'text-emerald-600/80 dark:text-emerald-400/80';
  } else if (tone === 'danger') {
    containerToneClass = 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15';
    labelToneClass = 'text-red-700 dark:text-red-400';
    valueToneClass = 'text-red-700 dark:text-red-300';
    subtextToneClass = 'text-red-600/80 dark:text-red-400/80';
  } else if (tone === 'neutral') {
    containerToneClass =
      'bg-slate-100 dark:bg-slate-800/70 border-[#7DA0FA]/30 hover:bg-slate-200/60 dark:hover:bg-slate-800';
    labelToneClass = 'text-slate-600 dark:text-slate-400';
    valueToneClass = 'text-slate-900 dark:text-slate-100';
    subtextToneClass = 'text-slate-500 dark:text-slate-400';
  }

  return (
    <div
      className={`rounded-xl border px-3.5 py-2 text-left shadow-2xs transition-colors ${containerToneClass}`}
    >
      <div
        className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${labelToneClass}`}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={`text-lg sm:text-xl font-black ${valueToneClass}`}>
        {value}{' '}
        {subtext && (
          <span className={`text-xs font-semibold ${subtextToneClass}`}>{subtext}</span>
        )}
      </div>
    </div>
  );
}

export interface DashboardPageHeaderProps {
  badge?: string;
  badgeTone?: 'primary' | 'accent' | 'neutral' | 'success' | 'danger';
  subtag?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  badge,
  subtag,
  title,
  description,
  children,
  actions,
  className = '',
}: Readonly<DashboardPageHeaderProps>) {
  return (
    <div
      className={`w-full border-b border-[#7DA0FA]/30 pb-6 flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="space-y-1.5 max-w-3xl">
        {(badge || subtag) && (
          <div className="flex items-center gap-2 flex-wrap">
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#7DA0FA]/15 border border-[#7DA0FA]/40 px-3 py-0.5 text-xs font-black text-[#4747A1] dark:text-[#7DA0FA] shadow-2xs">
                {badge}
              </span>
            )}
            {subtag && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {subtag}
              </span>
            )}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#4747A1] dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(children || actions) && (
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {children}
          {actions}
        </div>
      )}
    </div>
  );
}
