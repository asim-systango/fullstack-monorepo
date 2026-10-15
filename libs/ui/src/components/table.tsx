import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { cn } from '../cn';

export type TableProps = Readonly<TableHTMLAttributes<HTMLTableElement>>;

export function Table({ className, ...rest }: TableProps) {
  return (
    <div className="w-full overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
      <table
        className={cn('w-full border-collapse text-left text-sm', className)}
        {...rest}
      />
    </div>
  );
}

export type TableHeadProps = Readonly<HTMLAttributes<HTMLTableSectionElement>>;

export function TableHead({ className, ...rest }: TableHeadProps) {
  return (
    <thead
      className={cn(
        'border-b border-border bg-muted/50 text-muted-foreground',
        className,
      )}
      {...rest}
    />
  );
}

export type TableBodyProps = Readonly<HTMLAttributes<HTMLTableSectionElement>>;

export function TableBody({ className, ...rest }: TableBodyProps) {
  return <tbody className={cn('divide-y divide-border/60', className)} {...rest} />;
}

export type TableRowProps = Readonly<HTMLAttributes<HTMLTableRowElement>>;

export function TableRow({ className, ...rest }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted',
        className,
      )}
      {...rest}
    />
  );
}

export type TableHeaderCellProps = Readonly<ThHTMLAttributes<HTMLTableCellElement>>;

export function TableHeaderCell({ className, ...rest }: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        'px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground align-middle',
        className,
      )}
      {...rest}
    />
  );
}

export type TableCellProps = Readonly<TdHTMLAttributes<HTMLTableCellElement>>;

export function TableCell({ className, ...rest }: TableCellProps) {
  return (
    <td
      className={cn('px-4 py-3.5 text-sm text-foreground align-middle', className)}
      {...rest}
    />
  );
}
