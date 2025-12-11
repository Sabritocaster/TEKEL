import { PriceTrendChart, ProfitAnalysisChart } from '@/features/reports/components/Charts.jsx';

export default function AnalysisPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analiz & Raporlar</h2>
                <p className="text-muted-foreground">
                    Finansal durumunuzu ve stok performansınızı detaylı inceleyin.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ProfitAnalysisChart />
                <PriceTrendChart />
            </div>

            <div className="grid gap-6">
                {/* İleride yeni rapor bileşenleri buraya eklenecek */}
            </div>
        </div>
    );
}
