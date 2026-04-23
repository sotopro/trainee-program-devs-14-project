import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />;
}