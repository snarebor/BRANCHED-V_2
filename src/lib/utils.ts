import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
export function formatPrice(price: number | string | { toString(): string } | null | undefined, currency = 'RUB') {
  if (price === null || price === undefined || price === ('' as unknown)) {
    return 'Price on request';
  }

  const value =
    typeof price === 'number'
      ? price
      : parseFloat(price.toString());

  if (Number.isNaN(value)) {
    return 'Price on request';
  }

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value)} ₽`;
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];

  let value = seconds;
  let unit = 'second';
  for (const [amount, name] of units) {
    if (value < amount) {
      unit = name;
      break;
    }
    value = Math.floor(value / amount);
    unit = name;
  }

  if (value <= 1 && unit === 'second') return 'just now';
  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
}

export function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing',
  jobs: 'Jobs',
  marketplace: 'Marketplace',
  services: 'Services',
  vehicles: 'Vehicles',
  community: 'Community',
};
