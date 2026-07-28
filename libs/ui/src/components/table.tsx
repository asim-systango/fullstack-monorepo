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
    <div className="ui-table-wrap">
      <table className={cn('ui-table', className)} {...rest} />
    </div>
  );
}

export type TableHeadProps = Readonly<HTMLAttributes<HTMLTableSectionElement>>;

export function TableHead({ className, ...rest }: TableHeadProps) {
  return <thead className={cn('ui-thead', className)} {...rest} />;
}

export type TableBodyProps = Readonly<HTMLAttributes<HTMLTableSectionElement>>;

export function TableBody({ className, ...rest }: TableBodyProps) {
  return <tbody className={cn('ui-tbody', className)} {...rest} />;
}

export type TableRowProps = Readonly<HTMLAttributes<HTMLTableRowElement>>;

export function TableRow({ className, ...rest }: TableRowProps) {
  return <tr className={cn('ui-tr', className)} {...rest} />;
}

export type TableHeaderCellProps = Readonly<ThHTMLAttributes<HTMLTableCellElement>>;

export function TableHeaderCell({ className, ...rest }: TableHeaderCellProps) {
  return <th className={cn('ui-th', className)} {...rest} />;
}

export type TableCellProps = Readonly<TdHTMLAttributes<HTMLTableCellElement>>;

export function TableCell({ className, ...rest }: TableCellProps) {
  return <td className={cn('ui-td', className)} {...rest} />;
}
