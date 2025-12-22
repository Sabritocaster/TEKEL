'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RANGE_PRESETS } from '@/features/dashboard/rangePresets';

export function ChartRangeFilters({ defaultRange = '6m' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = searchParams.get('range') || defaultRange;

  const onSelect = (key) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (key === 'all') sp.delete('range');
    else sp.set('range', key);

    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {RANGE_PRESETS.map((p) => (
        <Button
          key={p.key}
          type="button"
          size="sm"
          variant={active === p.key ? 'default' : 'outline'}
          onClick={() => onSelect(p.key)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
