import { PriceTrendChart, ProfitAnalysisChart } from '@/components/analysis/Charts';

export default function AnalysisPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analiz & Raporlar</h2>
                    <p className="text-muted-foreground">
                        Finansal durumunuzu ve stok performansınızı detaylı inceleyin.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ProfitAnalysisChart />
                <PriceTrendChart />
            </div>

            <div className="grid gap-6">
                {/* Placeholder for more detailed tables or reports */}
            </div>
        </div>
    );
}
