'use client';

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
import { CATEGORIES, CC_VALUES } from '@/lib/constants.js';
import { productSchema } from '@/lib/validations.js';

export function ProductForm({ defaultValues, onSubmit, onCancel }) {
    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: defaultValues?.name || '',
            category: defaultValues?.category || '',
            cc: defaultValues?.cc || '',
            minStock: defaultValues?.minStock || 5,
            maxStock: defaultValues?.maxStock || 0,
        },
    });

    const handleSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
