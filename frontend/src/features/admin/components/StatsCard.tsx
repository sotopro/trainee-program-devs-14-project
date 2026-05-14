import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatsCardProps = {
  title: string;
  value?: number;
  icon: ReactNode;
  isLoading: boolean;
};

export function StatsCard({ title, value, icon, isLoading }: StatsCardProps) {
  return (
    <Card className="min-h-36">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-4">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-28" />
        ) : (
          <p className="text-3xl font-bold text-foreground">{Intl.NumberFormat('es-PE').format(value ?? 0)}</p>
        )}
      </CardContent>
    </Card>
  );
}
