'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Area,
    AreaChart,
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

const profitData = [
    { name: 'Ocak', revenue: 45000, cost: 32000, profit: 13000 },
    { name: 'Şubat', revenue: 52000, cost: 34000, profit: 18000 },
    { name: 'Mart', revenue: 48000, cost: 33000, profit: 15000 },
    { name: 'Nisan', revenue: 61000, cost: 42000, profit: 19000 },
    { name: 'Mayıs', revenue: 55000, cost: 38000, profit: 17000 },
    { name: 'Haziran', revenue: 67000, cost: 45000, profit: 22000 },
];

const priceTrendData = [
    { name: 'H1', avgPurchase: 450, avgSell: 600 },
    { name: 'H2', avgPurchase: 460, avgSell: 620 },
    { name: 'H3', avgPurchase: 455, avgSell: 610 },
    { name: 'H4', avgPurchase: 480, avgSell: 650 },
];

export function ProfitAnalysisChart() {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Gelir/Gider ve Kar Analizi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Satış Geliri" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cost" name="Maliyet" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Net Kar" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export function PriceTrendChart() {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Ortalama Alış/Satış Fiyat Trendi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="avgPurchase" name="Ort. Alış" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="avgSell" name="Ort. Satış" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
