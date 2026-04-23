import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className="ui-button" {...props}>
      {children}
    </button>
  );
}