'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useProductStore } from '@/stores/useProductStore';
import { Badge } from '@/components/ui/badge';

export function ProductTable() {
    const { products } = useProductStore();

    if (products.length === 0) {
        return (
            <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed text-muted-foreground bg-muted/5">
                Henüz ürün eklenmemiş.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ürün Adı</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>CC</TableHead>
                        <TableHead className="text-right">Stok Adedi</TableHead>
                        <TableHead className="text-right">Durum</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.cc}</TableCell>
                            <TableCell className="text-right text-lg font-bold">{product.currentStock}</TableCell>
                            <TableCell className="text-right">
                                {product.currentStock <= (product.minStock || 5) ? (
                                    <Badge variant="destructive">Kritik</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Normal</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
