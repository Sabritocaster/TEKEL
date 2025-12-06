'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useProductStore } from '@/stores/useProductStore';
import { toast } from 'sonner';

const movementSchema = z.object({
    productId: z.string().min(1, 'Ürün seçiniz'),
    type: z.enum(['IN', 'OUT']),
    quantity: z.coerce.number().min(1, 'Adet en az 1 olmalıdır'),
    unitPrice: z.coerce.number().min(0, 'Birim fiyat 0 veya büyük olmalıdır'),
});

type MovementFormValues = z.infer<typeof movementSchema>;

export function MovementForm() {
    const { products, updateProduct } = useProductStore();

    const form = useForm<MovementFormValues>({
        resolver: zodResolver(movementSchema) as any,
        defaultValues: {
            type: 'IN',
            quantity: 1,
            unitPrice: 0,
        },
    });

    const onSubmit = (data: MovementFormValues) => {
        const product = products.find((p) => p.id === data.productId);
        if (!product) return;

        // Simulate backend update
        const newStock =
            data.type === 'IN'
                ? product.currentStock + data.quantity
                : product.currentStock - data.quantity;

        if (newStock < 0) {
            toast.error('Stok yetersiz!');
            return;
        }

        updateProduct(product.id, { currentStock: newStock });
        toast.success(`Stok ${data.type === 'IN' ? 'girişi' : 'çıkışı'} başarılı.`);
        form.reset({
            type: 'IN',
            quantity: 1,
            unitPrice: 0,
            productId: '',
        });
    };

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Hızlı Stok İşlemi</h3>
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
                                                {p.name} ({p.currentStock})
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="IN">Stok Giriş (Alış)</SelectItem>
                                        <SelectItem value="OUT">Stok Çıkış (Satış)</SelectItem>
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

                    <Button type="submit" className="w-full">
                        İşlemi Kaydet
                    </Button>
                </form>
            </Form>
        </div>
    );
}
