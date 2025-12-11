import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { StockChart } from '@/features/dashboard/components/StockChart';
import { BadgeTurkishLira, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDashboardStatsAction } from '@/features/dashboard/actions.js';
import { MovementHistory } from '@/features/stock-movements/components/MovementHistory.jsx';
import { AllMovementsDialog } from '@/features/stock-movements/components/AllMovementsDialog.jsx';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const result = await getDashboardStatsAction();
  const stats = result?.data || {};

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Stok Değeri"
          value={formatCurrency(stats.totalStockValue)}
          icon={BadgeTurkishLira}
          description="Mevcut envanter değeri"
        />
        <StatsCard
          title="Toplam Ürün"
          value={stats.totalProducts || 0}
          icon={Package}
          description="Farklı ürün çeşidi"
        />
        <StatsCard
          title="Bu Ay Tahmini Kar"
          value={formatCurrency(stats.monthlyProfit)}
          icon={TrendingUp}
          description="Bu ayki satışlardan"
        />
        <StatsCard
          title="Kritik Stok"
          value={stats.criticalStock || 0}
          icon={AlertTriangle}
          description="Min. stok altındaki ürünler"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <StockChart data={stats.stockChart} />

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
