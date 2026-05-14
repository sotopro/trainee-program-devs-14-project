import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecentActivityItem } from '../types/dashboard.types';

type RecentActivityListProps = {
  items: RecentActivityItem[];
  isLoading: boolean;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('es-PE', {
  numeric: 'auto',
});

const formatRelativeTime = (isoDate: string) => {
  const diffInSeconds = Math.round((new Date(isoDate).getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.345, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ] as const;

  let duration = diffInSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }

  return relativeTimeFormatter.format(0, 'second');
};

const getActivityLabel = (item: RecentActivityItem) => {
  const labels = {
    ENROLLMENT: 'Inscripcion',
    COURSE_PUBLISHED: 'Curso publicado',
    QUIZ_COMPLETED: 'Quiz completado',
  };

  return labels[item.type];
};

export function RecentActivityList({ items, isLoading }: RecentActivityListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <ol className="grid gap-4">
            {items.map((item) => (
              <li key={item.id} className="grid gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <time className="text-sm text-muted-foreground" dateTime={item.createdAt}>
                    {formatRelativeTime(item.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{getActivityLabel(item)}</p>
                <p className="text-sm">{item.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No hay actividad reciente para mostrar.</p>
        )}
      </CardContent>
    </Card>
  );
}
