'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data
const MOCK_MOVEMENTS = [
    { id: '1', productName: 'Yeni Rakı 70cl', type: 'IN', quantity: 10, price: 500, date: '2023-10-26 14:30' },
    { id: '2', productName: 'Efes Pilsen 50cl', type: 'OUT', quantity: 5, price: 45, date: '2023-10-26 15:45' },
    { id: '3', productName: 'Jack Daniels 70cl', type: 'OUT', quantity: 1, price: 950, date: '2023-10-26 16:20' },
];

export function MovementHistory() {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Ürün</TableHead>
                        <TableHead>İşlem</TableHead>
                        <TableHead className="text-right">Adet</TableHead>
                        <TableHead className="text-right">Birim Fiyat</TableHead>
                        <TableHead className="text-right">Toplam</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_MOVEMENTS.map((movement) => (
                        <TableRow key={movement.id}>
                            <TableCell className="text-muted-foreground">{movement.date}</TableCell>
                            <TableCell className="font-medium">{movement.productName}</TableCell>
                            <TableCell>
                                <Badge variant={movement.type === 'IN' ? 'default' : 'destructive'}>
                                    {movement.type === 'IN' ? 'Giriş' : 'Çıkış'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{movement.quantity}</TableCell>
                            <TableCell className="text-right">₺{movement.price}</TableCell>
                            <TableCell className="text-right font-bold">
                                ₺{movement.quantity * movement.price}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
