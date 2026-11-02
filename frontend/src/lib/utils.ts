import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function initials(username: string) {
  return username
    .replace(/_/g, ' ')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
export function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}
