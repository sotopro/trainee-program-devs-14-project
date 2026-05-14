import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DialogProps = {
  open: boolean;
  children: ReactNode;
};

function Dialog({ open, children }: DialogProps) {
  if (!open) {
    return null;
  }

  return children;
}

function DialogContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6" role="presentation">
      <div
        className={cn(
          'grid w-full max-w-md gap-4 rounded-lg border border-border bg-background p-5 text-foreground shadow-xl',
          className,
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      />
    </div>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-2', className)} {...props} />;
}

function DialogTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
}

function DialogDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap justify-end gap-2', className)} {...props} />;
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle };
