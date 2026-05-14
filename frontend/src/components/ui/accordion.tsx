import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type AccordionContextValue = {
  openValues: string[];
  toggleValue: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

type AccordionProps = Omit<ComponentProps<'div'>, 'defaultValue'> & {
  type?: 'multiple';
  defaultValue?: string[];
};

function Accordion({ className, defaultValue = [], ...props }: AccordionProps) {
  const [openValues, setOpenValues] = useState(defaultValue);
  const value = useMemo(
    () => ({
      openValues,
      toggleValue: (nextValue: string) => {
        setOpenValues((current) =>
          current.includes(nextValue)
            ? current.filter((item) => item !== nextValue)
            : [...current, nextValue],
        );
      },
    }),
    [openValues],
  );

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn('grid gap-3', className)} {...props} />
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = ComponentProps<'div'> & {
  value: string;
};

function AccordionItem({ className, value, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn('rounded-lg border border-border bg-background', className)} {...props} />
    </AccordionItemContext.Provider>
  );
}

function useAccordionItem() {
  const accordion = useContext(AccordionContext);
  const itemValue = useContext(AccordionItemContext);

  if (!accordion || !itemValue) {
    throw new Error('Accordion components must be used inside AccordionItem');
  }

  return {
    ...accordion,
    itemValue,
    isOpen: accordion.openValues.includes(itemValue),
  };
}

function AccordionTrigger({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const { itemValue, isOpen, toggleValue } = useAccordionItem();

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-foreground',
        className,
      )}
      aria-expanded={isOpen}
      onClick={() => toggleValue(itemValue)}
      {...props}
    >
      {children}
      <span aria-hidden="true" className="text-lg">
        {isOpen ? '-' : '+'}
      </span>
    </button>
  );
}

function AccordionContent({ className, ...props }: ComponentProps<'div'>) {
  const { isOpen } = useAccordionItem();

  if (!isOpen) {
    return null;
  }

  return <div className={cn('border-t border-border px-4 py-4', className)} {...props} />;
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
