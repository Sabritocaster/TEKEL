'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStockMovementsAction, deleteStockTransactionAction } from '@/features/stock-movements/actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog.jsx';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Loader2, Maximize2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { MovementDialog } from './MovementForm';
import { toast } from 'sonner';

export function AllMovementsDialog() {
    const [open, setOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const queryClient = useQueryClient();

    const { data: movements, isLoading } = useQuery({
        queryKey: ['all-stock-movements'],
        queryFn: async () => {
            const result = await getStockMovementsAction(500);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: open,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteStockTransactionAction(id),
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Stok hareketi silindi ve stok güncellendi.');
                queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
                queryClient.invalidateQueries({ queryKey: ['all-stock-movements'] });
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                setDeletingId(null);
            } else {
                toast.error(result.error);
            }
        },
        onError: (error) => {
            toast.error(`Hata: ${error.message}`);
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Tümünü Gör
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-[95vw] h-[85vh] xl:w-[50vw] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Tüm Stok Hareketleri (Son 500)</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-full border rounded-md overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead>İşlem</TableHead>
                                        <TableHead className="text-right">Adet</TableHead>
                                        <TableHead className="text-right">Birim Fiyat</TableHead>
                                        <TableHead className="text-right">Toplam</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {movements?.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(movement.date), 'dd MMM yyyy HH:mm', { locale: tr })}
                                            </TableCell>

                                            <TableCell className="font-medium">
                                                {movement.product?.name || 'Silinmiş Ürün'}
                                                <span className="text-muted-foreground ml-1 text-xs">
                                                    {movement.product?.ccValue}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={movement.type === 'PURCHASE' ? 'default' : 'destructive'}
                                                    className={movement.type === 'PURCHASE' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                >
                                                    {movement.type === 'PURCHASE' ? 'Alış (Giriş)' : 'Satış (Çıkış)'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right">{movement.quantity}</TableCell>
                                            <TableCell className="text-right">₺{movement.unitPrice}</TableCell>

                                            <TableCell className="text-right font-bold">
                                                ₺{movement.totalPrice}
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

                                                        <DropdownMenuItem onClick={() => setEditingTransaction(movement)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Düzenle
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingId(movement.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {!movements?.length && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Kayıt bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <MovementDialog
                    open={!!editingTransaction}
                    onOpenChange={(open) => !open && setEditingTransaction(null)}
                    transactionToEdit={editingTransaction}
                />

                <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hareketi Sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu stok hareketini silmek istediğinize emin misiniz? <br />
                                <b>Dikkat:</b> Bu işlem geri alındığında ürünün stok adedi ve ortalama maliyeti otomatik olarak düzeltilecektir.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Evet, Sil ve Düzelt'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
