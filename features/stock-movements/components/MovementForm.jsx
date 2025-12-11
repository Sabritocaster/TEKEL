'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { stockTransactionSchema } from '@/lib/validations.js';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createStockTransactionAction, updateStockTransactionAction } from '@/features/stock-movements/actions';
import { getProductsAction } from '@/features/products/actions.js';
import { Plus } from 'lucide-react';

export function MovementDialog({ transactionToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;
    const isEditMode = !!transactionToEdit;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : null}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Hareketi Düzenle' : 'Yeni Stok Hareketi'}</DialogTitle>
                </DialogHeader>
                <MovementForm
                    defaultValues={transactionToEdit}
                    onSuccess={() => setOpen && setOpen(false)}
                    mode={isEditMode ? 'EDIT' : 'CREATE'}
                />
            </DialogContent>
        </Dialog>
    );
}

export function MovementForm({ defaultValues, onSuccess, mode = 'CREATE' }) {
    const queryClient = useQueryClient();

    const { data: productsData } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const result = await getProductsAction();
            return result.success ? result.data : [];
        },
    });

    const products = productsData || [];

    const form = useForm({
        resolver: zodResolver(stockTransactionSchema),
        defaultValues: {
            productId: defaultValues?.productId || '',
            type: defaultValues?.type || 'PURCHASE',
            quantity: defaultValues?.quantity || 1,
            unitPrice: defaultValues?.unitPrice || 0,
        },
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                productId: defaultValues.productId,
                type: defaultValues.type,
                quantity: defaultValues.quantity,
                unitPrice: defaultValues.unitPrice,
            });
        }
    }, [defaultValues, form]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (mode === 'EDIT' && defaultValues?.id) {
                return updateStockTransactionAction({ ...data, id: defaultValues.id });
            }
            return createStockTransactionAction(data);
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success(mode === 'EDIT' ? 'Hareket güncellendi' : 'Hareket kaydedildi');
                queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

                if (mode === 'CREATE') {
                    form.reset({
                        type: 'PURCHASE',
                        quantity: 1,
                        unitPrice: 0,
                        productId: '',
                    });
                }

                onSuccess && onSuccess();
            } else {
                toast.error(result.error);
            }
        },
        onError: (error) => {
            console.error('Mutation Error:', error);
            toast.error(`Hata: ${error.message}`);
        },
    });

    const onSubmit = (data) => {
        const plainData = {
            productId: String(data.productId ?? ''),
            type: String(data.type ?? 'PURCHASE'),
            quantity: Number(data.quantity ?? 0),
            unitPrice: Number(data.unitPrice ?? 0),
        };

        const serialized = JSON.parse(JSON.stringify(plainData));
        mutation.mutate(serialized);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ürün</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ürün seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} {p.ccValue} (Stok: {p.currentStock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İşlem Türü</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PURCHASE">Stok Giriş (Alış)</SelectItem>
                                    <SelectItem value="SALE">Stok Çıkış (Satış)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adet</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birim Fiyat (₺)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Kaydediliyor...' : (mode === 'EDIT' ? 'Güncelle' : 'İşlemi Kaydet')}
                </Button>
            </form>
        </Form>
    );
}
