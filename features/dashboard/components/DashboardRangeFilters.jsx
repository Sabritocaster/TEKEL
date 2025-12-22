'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RANGE_PRESETS } from '@/features/dashboard/rangePresets';

export function DashboardRangeFilters({ defaultRange = '6m' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('range') || defaultRange;

  const onSelect = (key) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('range', key);

    router.push(sp.toString() ? `/dashboard?${sp}` : '/dashboard');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGE_PRESETS.map((p) => (
        <Button
          key={p.key}
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
