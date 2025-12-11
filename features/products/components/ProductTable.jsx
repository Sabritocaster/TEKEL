'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductsAction, deleteProductAction } from '@/features/products/actions.js';
import { ProductDialog } from './AddProductDialog';
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProductTable() {
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const queryClient = useQueryClient();

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const result = await getProductsAction();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteProductAction(id),
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Ürün silindi.');
                queryClient.invalidateQueries({ queryKey: ['products'] });
                setDeletingId(null);
            } else {
                toast.error(result.error);
            }
        },
        onError: (error) => {
            toast.error(`Hata: ${error.message}`);
        }
    });

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Ürünler yükleniyor...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Hata: {error.message}</div>;
    }

    if (!products || products.length === 0) {
        return (
            <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed text-muted-foreground bg-muted/5">
                Henüz ürün eklenmemiş.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ürün Adı</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>CC</TableHead>
                            <TableHead className="text-right">Stok Adedi</TableHead>
                            <TableHead className="text-right">Durum</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.ccValue}</TableCell>
                                <TableCell className="text-right text-lg font-bold">{product.currentStock}</TableCell>
                                <TableCell className="text-right">
                                    {product.currentStock <= (product.minStock || 5) ? (
                                        <Badge variant="destructive">Kritik</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Normal</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Menü</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Düzenle
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeletingId(product.id)} className="text-red-600 focus:text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Sil
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ProductDialog
                open={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                productToEdit={editingProduct}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu ürünü silmek istediğinize emin misiniz? Eğer bu ürüne ait geçmiş stok hareketleri varsa silinemez.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Evet, Sil'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
