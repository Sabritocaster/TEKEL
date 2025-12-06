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
import { CATEGORIES, CC_VALUES } from '@/lib/constants';
import { Product } from '@/lib/types';

const productSchema = z.object({
    name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
    category: z.string().min(1, 'Kategori seçiniz'),
    cc: z.string().min(1, 'CC değeri seçiniz'),
    minStock: z.coerce.number().min(0, 'Minimum stok 0 veya büyük olmalıdır'),
    maxStock: z.coerce.number().min(0, 'Varsa maksimum stok değeri giriniz').optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    defaultValues?: Partial<Product>;
    onSubmit: (data: ProductFormValues) => void;
    onCancel: () => void;
}

export function ProductForm({ defaultValues, onSubmit, onCancel }: ProductFormProps) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: defaultValues?.name || '',
            category: defaultValues?.category || '',
            cc: defaultValues?.cc || '',
            minStock: defaultValues?.minStock || 5, // Default min stock
            maxStock: defaultValues?.maxStock || 0,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ürün Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Yeni Rakı" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
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
                        name="cc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CC Değeri</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CC_VALUES.map((cc) => (
                                            <SelectItem key={cc} value={cc}>
                                                {cc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min. Stok</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maxStock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max. Stok (Opsiyonel)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        İptal
                    </Button>
                    <Button type="submit">Kaydet</Button>
                </div>
            </form>
        </Form>
    );
}
