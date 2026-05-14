import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Table({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('w-full border-collapse text-left', className)} {...props} />;
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn(className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn(className)} {...props} />;
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('border-b border-border last:border-b-0', className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return <th className={cn('py-3 pr-4 text-sm font-semibold text-muted-foreground', className)} {...props} />;
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('py-4 pr-4', className)} {...props} />;
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
