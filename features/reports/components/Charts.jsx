'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfitAnalysisDataAction, getPriceTrendDataAction } from '@/features/reports/actions';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from 'recharts';


// PROFIT ANALYSIS CHART
export function ProfitAnalysisChart() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['profit-analysis'],
        queryFn: async () => {
            const res = await getProfitAnalysisDataAction();
            if (!res.success) throw new Error(res.error);
            return res.data;
        }
    });

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Gelir / Gider / Kâr Analizi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    
                    {isLoading && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Yükleniyor...
                        </div>
                    )}

                    {isError && (
                        <div className="flex items-center justify-center h-full text-red-500">
                            Veri alınamadı.
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(v) => `₺${v}`} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" name="Satış Geliri" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" name="Maliyet" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="Net Kâr" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


// PRICE TREND CHART

export function PriceTrendChart() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['price-trend'],
        queryFn: async () => {
            const res = await getPriceTrendDataAction();
            if (!res.success) throw new Error(res.error);
            return res.data;
        }
    });

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Ortalama Alış / Satış Fiyat Trendi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">

                    {isLoading && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Yükleniyor...
                        </div>
                    )}

                    {isError && (
                        <div className="flex items-center justify-center h-full text-red-500">
                            Veri alınamadı.
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(v) => `₺${v}`} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avgPurchase" name="Ort. Alış" stroke="var(--chart-3)" strokeWidth={2} dot />
                                <Line type="monotone" dataKey="avgSell" name="Ort. Satış" stroke="var(--chart-4)" strokeWidth={2} dot />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
