import { subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

export const RANGE_PRESETS = [
  { key: 'today', label: 'Bugün' },
  { key: '7d', label: '1 hafta' },
  { key: '14d', label: '2 hafta' },
  { key: '1m', label: '1 ay' },
  { key: '3m', label: '3 ay' },
  { key: '6m', label: '6 ay' },
  { key: '1y', label: '1 yıl' },
  { key: 'all', label: 'Tüm zamanlar' },
];

export function getRangeLabel(rangeKey) {
  return RANGE_PRESETS.find((p) => p.key === rangeKey)?.label ?? 'Tüm zamanlar';
}

export function computeRange(rangeKey, now = new Date()) {
  const end = endOfDay(now);

  switch (rangeKey) {
    case 'today':
      return { start: startOfDay(now), end };
    case '7d':
      return { start: startOfDay(subDays(now, 6)), end };
    case '14d':
      return { start: startOfDay(subDays(now, 13)), end };
    case '1m':
      return { start: startOfDay(subMonths(now, 1)), end };
    case '3m':
      return { start: startOfDay(subMonths(now, 3)), end };
    case '6m':
      return { start: startOfDay(subMonths(now, 6)), end };
    case '1y':
      return { start: startOfDay(subYears(now, 1)), end };
    case 'all':
    default:
      return { start: null, end };
  }
}
