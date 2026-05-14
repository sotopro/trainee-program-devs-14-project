import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const quickActions = [
  {
    label: 'Crear nuevo curso',
    to: '/admin/courses/new',
  },
  {
    label: 'Gestionar cursos',
    to: '/admin/courses',
  },
  {
    label: 'Gestionar usuarios',
    to: '/admin/users',
  },
  {
    label: 'Ver catalogo de cursos',
    to: '/catalog',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones rapidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {quickActions.map((action) => (
          <Button key={action.to} asChild className="min-h-11 w-full justify-start text-primary-foreground">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
