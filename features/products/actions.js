'use server'

import { prisma } from '@/lib/prisma.js';
import { productSchema } from '@/lib/validations.js';
import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: JSON.parse(JSON.stringify(products)) };
    } catch (error) {
        console.error('getProductsAction Error:', error);
        return { success: false, error: 'Ürünler yüklenirken bir hata oluştu.' };
    }
}

export async function createProductAction(data) {
    try {
        const validated = productSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: 'Geçersiz veri formatı.' };
        }

        const { name, category, cc } = validated.data;

        const existingProduct = await prisma.product.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
                category: category,
                ccValue: cc,
            },
        });

        if (existingProduct) {
            return { success: false, error: 'Bu isim, kategori ve CC değerine sahip bir ürün zaten var.' };
        }

        const product = await prisma.product.create({
            data: {
                name: validated.data.name,
                category: validated.data.category,
                ccValue: validated.data.cc,
                currentStock: 0,
                averageCost: 0,
            },
        });

        revalidatePath('/products');
        return { success: true, data: JSON.parse(JSON.stringify(product)) };
    } catch (error) {
        console.error('createProductAction Error:', error);
        return { success: false, error: error.message || 'Ürün oluşturulurken bir hata oluştu.' };
    }
}

export async function updateProductAction(data) {
    try {
        const validated = productSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: 'Geçersiz veri formatı.' };
        }

        const product = await prisma.product.update({
            where: { id: data.id },
            data: {
                name: validated.data.name,
                category: validated.data.category,
                ccValue: validated.data.cc,
                minStock: validated.data.minStock,
                maxStock: validated.data.maxStock,
            },
        });

        revalidatePath('/products');
        return { success: true, data: JSON.parse(JSON.stringify(product)) };
    } catch (error) {
        console.error('updateProductAction Error:', error);
        return { success: false, error: 'Ürün güncellenirken bir hata oluştu.' };
    }
}

export async function deleteProductAction(id) {
    try {
        const movements = await prisma.stockTransaction.count({
            where: { productId: id }
        });

        if (movements > 0) {
            return { success: false, error: 'Bu ürüne ait stok hareketleri var. Önce hareketleri silmelisiniz.' };
        }

        await prisma.product.delete({
            where: { id },
        });

        revalidatePath('/products');
        return { success: true, data: { id } };
    } catch (error) {
        console.error('deleteProductAction Error:', error);
        return { success: false, error: 'Ürün silinirken bir hata oluştu.' };
    }
}
