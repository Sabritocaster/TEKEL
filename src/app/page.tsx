import { StatsCard } from '@/components/dashboard/StatsCard';
import { StockChart } from '@/components/dashboard/StockChart';
import { BadgeTurkishLira, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Stok Değeri"
          value="₺124,500"
          icon={BadgeTurkishLira}
          trend="up"
          trendValue="+12.5%"
          description="geçen aya göre"
        />
        <StatsCard
          title="Toplam Ürün"
          value="342"
          icon={Package}
          description="Farklı ürün çeşidi"
        />
        <StatsCard
          title="Bu Ay Kar"
          value="₺18,200"
          icon={TrendingUp}
          trend="up"
          trendValue="+4.3%"
          description="geçen aya göre"
        />
        <StatsCard
          title="Kritik Stok"
          value="12"
          icon={AlertTriangle}
          trend="down"
          trendValue="3 ürün"
          description="tükendi"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <StockChart />
        {/* Placeholder for Recent Activity or Top Products */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Son Hareketler</h3>
            <p className="text-sm text-muted-foreground mt-2">Henüz veri yok.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
