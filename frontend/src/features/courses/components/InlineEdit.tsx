import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

type InlineEditProps = {
  value: string;
  ariaLabel: string;
  isEditing?: boolean;
  minLength?: number;
  maxLength?: number;
  onEditingChange?: (isEditing: boolean) => void;
  onSave: (value: string) => void | Promise<void>;
};

export function InlineEdit({
  value,
  ariaLabel,
  isEditing: controlledIsEditing,
  minLength = 3,
  maxLength,
  onEditingChange,
  onSave,
}: InlineEditProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = controlledIsEditing ?? localIsEditing;

  const setEditing = (nextIsEditing: boolean) => {
    if (nextIsEditing) {
      setDraft(value);
    }

    setLocalIsEditing(nextIsEditing);
    onEditingChange?.(nextIsEditing);
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const cancel = () => {
    setDraft(value);
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    const nextValue = draft.trim();

    if (nextValue.length < minLength) {
      setError(`Debe tener al menos ${minLength} caracteres.`);
      return;
    }

    if (maxLength && nextValue.length > maxLength) {
      setError(`No puede superar ${maxLength} caracteres.`);
      return;
    }

    setError(null);
    setEditing(false);

    if (nextValue !== value) {
      await onSave(nextValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void save();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <span className="grid gap-1" onClick={(event) => event.stopPropagation()}>
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          aria-invalid={Boolean(error)}
          className="h-9"
        />
        {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
      </span>
    );
  }

  return (
    <span
      className="cursor-text rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setEditing(true);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          setEditing(true);
        }
      }}
    >
      {value}
    </span>
  );
}
