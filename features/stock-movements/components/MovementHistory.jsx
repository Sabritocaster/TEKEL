'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStockMovementsAction, deleteStockTransactionAction } from '@/features/stock-movements/actions';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { MovementDialog } from './MovementForm';
import { toast } from 'sonner';

export function MovementHistory() {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rangeKey = searchParams.get('range') || '6m';

  const { data: movements, isLoading } = useQuery({
    queryKey: ['stock-movements', rangeKey],
    queryFn: async () => {
      const result = await getStockMovementsAction(50, rangeKey);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStockTransactionAction(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Stok hareketi silindi ve stok güncellendi.');
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
        queryClient.invalidateQueries({ queryKey: ['all-stock-movements'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        router.refresh();
        setDeletingId(null);
      } else toast.error(result.error);
    },
    onError: (error) => toast.error(`Hata: ${error.message}`),
  });

  if (isLoading) return <div className="p-4 text-center text-muted-foreground">Hareketler yükleniyor...</div>;

  if (!movements || movements.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-md border text-muted-foreground bg-card">
        Seçili aralıkta stok hareketi yok.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-3 lg:hidden">
          {movements.map((movement) => (
            <div key={movement.id} className="rounded-md border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(movement.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                  <p className="font-medium">{movement.product?.name || 'Silinmiş Ürün'}</p>
                  <Badge
                    variant={movement.type === 'PURCHASE' ? 'default' : 'destructive'}
                    className={movement.type === 'PURCHASE' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {movement.type === 'PURCHASE' ? 'Alış (Giriş)' : 'Satış (Çıkış)'}
                  </Badge>
                </div>

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
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Adet</p>
                  <p className="font-semibold">{movement.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Birim Fiyat</p>
                  <p className="font-semibold">₺{movement.unitPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Toplam</p>
                  <p className="font-semibold">₺{movement.totalPrice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-md border bg-card lg:block">
          <Table>
            <TableHeader>
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
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(movement.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.product?.name || 'Silinmiş Ürün'}
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
                  <TableCell className="text-right font-bold">₺{movement.totalPrice}</TableCell>

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
            </TableBody>
          </Table>
        </div>
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
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Evet, Sil ve Düzelt'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
