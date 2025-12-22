import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { StockChart } from '@/features/dashboard/components/StockChart';
import { DashboardRangeFilters } from '@/features/dashboard/components/DashboardRangeFilters';
import { BadgeTurkishLira, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDashboardStatsAction } from '@/features/dashboard/actions.js';
import { MovementHistory } from '@/features/stock-movements/components/MovementHistory.jsx';
import { AllMovementsDialog } from '@/features/stock-movements/components/AllMovementsDialog.jsx';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const rangeKey = searchParams?.range || '6m';

  const result = await getDashboardStatsAction(rangeKey);
  const stats = result?.data || {};

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>
        <DashboardRangeFilters defaultRange="6m" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Stok Değeri"
          value={formatCurrency(stats.totalStockValue)}
          icon={BadgeTurkishLira}
          description="Seçili aralıktaki net stok değeri"
        />
        <StatsCard
          title="Toplam Ürün"
          value={stats.totalProducts || 0}
          icon={Package}
          description="Seçili aralıkta işlem gören ürün"
        />
        <StatsCard
          title="Tahmini Kar"
          value={formatCurrency(stats.rangeProfit)}
          icon={TrendingUp}
          description="Seçili aralıktaki satışlardan"
        />
        <StatsCard
          title="Kritik Stok"
          value={stats.criticalStock || 0}
          icon={AlertTriangle}
          description="Seçili aralıkta min. stok altına düşenler"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <StockChart
          data={stats.stockChart}
          title={`Stok Değeri Analizi (${stats.rangeLabel || 'Son 6 Ay'})`}
        />

        <div className="col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Son Hareketler</h3>
            <AllMovementsDialog />
          </div>
          <MovementHistory />
        </div>
      </div>
    </div>
  );
}
