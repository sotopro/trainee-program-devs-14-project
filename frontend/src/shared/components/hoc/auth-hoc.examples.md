# Auth HOC examples

```tsx
import { RenderIfRole, withAuth, withRole } from '@/shared/components/hoc';

function ProfileSummary({ title }: { title: string }) {
  return <section>{title}</section>;
}

export const ProtectedProfileSummary = withAuth(ProfileSummary);

function AdminActions() {
  return <button>Administrar</button>;
}

export const AdminOnlyActions = withRole('ADMIN')(AdminActions);

export function CourseToolbar() {
  return (
    <RenderIfRole role="ADMIN" fallback={null}>
      <AdminActions />
    </RenderIfRole>
  );
}
```
