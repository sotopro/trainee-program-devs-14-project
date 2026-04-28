import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface PageShellProps {
  
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export const PageShell = ({ 
  title, 
  actions, 
  children, 
  contentClassName 
}: PageShellProps) => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      
      {(title || actions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {typeof title === 'string' ? (
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={cn("flex-1", contentClassName)}>
        {children}
      </div>
    </div>
  );
};