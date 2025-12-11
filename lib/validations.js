import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
    category: z.string().min(1, 'Kategori seçiniz'),
    cc: z.string().min(1, 'CC değeri seçiniz'),
    minStock: z.coerce.number().min(0, 'Minimum stok 0 veya büyük olmalıdır'),
    maxStock: z.coerce.number().min(0, 'Varsa maksimum stok değeri giriniz').optional(),
});


export const stockTransactionSchema = z.object({
    productId: z.string().min(1, 'Ürün seçiniz'),
    type: z.enum(['PURCHASE', 'SALE']),
    quantity: z.coerce.number().min(1, 'Adet en az 1 olmalıdır'),
    unitPrice: z.coerce.number().min(0, 'Birim fiyat 0 veya büyük olmalıdır'),
});


