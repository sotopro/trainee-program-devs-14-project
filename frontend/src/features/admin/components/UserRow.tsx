import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import type { AssignmentUser } from '../types/course-assignment.types';

type UserRowProps = {
  user: AssignmentUser;
  isSelected: boolean;
  isCourseSelected: boolean;
  onAssign: (userId: string) => void;
  onToggleSelection: (user: AssignmentUser) => void;
  onUnassign: (userId: string) => void;
};

function UserRowComponent({
  user,
  isSelected,
  isCourseSelected,
  onAssign,
  onToggleSelection,
  onUnassign,
}: UserRowProps) {
  const isAssigned = Boolean(user.assignedAt);

  return (
    <TableRow>
      <TableCell>
        <input
          className="size-5 accent-[var(--accent)]"
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(user)}
          aria-label={`Seleccionar ${user.name}`}
        />
      </TableCell>
      <TableCell>
        <p className="font-semibold text-foreground">{user.name}</p>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <span
          className={
            isAssigned
              ? 'rounded-lg bg-primary/10 px-2 py-1 text-sm font-semibold text-primary'
              : 'rounded-lg border border-border px-2 py-1 text-sm font-semibold text-muted-foreground'
          }
        >
          {isAssigned ? 'Asignado' : 'No asignado'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {user.assignedAt ? new Date(user.assignedAt).toLocaleDateString('es-PE') : '-'}
      </TableCell>
      <TableCell className="text-right">
        {isAssigned ? (
          <Button type="button" variant="outline" size="sm" disabled={!isCourseSelected} onClick={() => onUnassign(user.id)}>
            Desasignar
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled={!isCourseSelected} onClick={() => onAssign(user.id)}>
            Asignar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export const UserRow = memo(UserRowComponent);
