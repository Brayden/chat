import type { ClassValue } from 'clsx/types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
