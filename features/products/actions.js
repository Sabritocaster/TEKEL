'use server'

import { prisma } from '@/lib/prisma.js';
import { productSchema } from '@/lib/validations.js';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/auditLogger.js';


 //  ÜRÜNLERİ LİSTELEME

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

  // ÜRÜN OLUŞTURMA

export async function createProductAction(data) {
    try {
        const validated = productSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: 'Geçersiz veri formatı.' };
        }

        const { name, category, cc } = validated.data;

        const existingProduct = await prisma.product.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                category,
                ccValue: cc,
            },
        });

        if (existingProduct) {
            return {
                success: false,
                error: 'Bu isim, kategori ve CC değerine sahip bir ürün zaten var.',
            };
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                ccValue: cc,
                currentStock: 0,
                averageCost: 0,
            },
        });

        // LOG Ürün Oluşturma 
        await logAction({
            action: 'PRODUCT_CREATE',
            targetId: product.id,
            targetType: 'Product',
            oldValue: null,
            newValue: product,
            message: `Yeni ürün oluşturuldu: ${product.name} (${product.category}, ${product.ccValue}cc)`
        });

        revalidatePath('/products');
        return { success: true, data: JSON.parse(JSON.stringify(product)) };

    } catch (error) {
        console.error('createProductAction Error:', error);
        return { success: false, error: error.message || 'Ürün oluşturulurken bir hata oluştu.' };
    }
}

   // ÜRÜN GÜNCELLEME

export async function updateProductAction(data) {
    try {
        const validated = productSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: 'Geçersiz veri formatı.' };
        }

        const oldProduct = await prisma.product.findUnique({
            where: { id: data.id },
        });

        if (!oldProduct) {
            return { success: false, error: 'Ürün bulunamadı.' };
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

        // LOG Ürün Güncelleme 

        await logAction({
            action: 'PRODUCT_UPDATE',
            targetId: product.id,
            targetType: 'Product',
            oldValue: oldProduct,
            newValue: product,
            message: `Ürün güncellendi: ${oldProduct.name} → ${product.name}`
        });

        revalidatePath('/products');
        return { success: true, data: JSON.parse(JSON.stringify(product)) };

    } catch (error) {
        console.error('updateProductAction Error:', error);
        return { success: false, error: 'Ürün güncellenirken bir hata oluştu.' };
    }
}

//   ÜRÜN SİLME
 
export async function deleteProductAction(id) {
    try {
        const movements = await prisma.stockTransaction.count({
            where: { productId: id }
        });

        if (movements > 0) {
            return {
                success: false,
                error: 'Bu ürüne ait stok hareketleri var. Önce hareketleri silmelisiniz.'
            };
        }

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return { success: false, error: 'Ürün bulunamadı.' };
        }

        await prisma.product.delete({
            where: { id },
        });

        // LOG Ürün Silme 
        await logAction({
            action: 'PRODUCT_DELETE',
            targetId: id,
            targetType: 'Product',
            oldValue: product,
            newValue: null,
            message: `Ürün silindi: ${product.name}`
        });

        revalidatePath('/products');
        return { success: true, data: { id } };

    } catch (error) {
        console.error('deleteProductAction Error:', error);
        return { success: false, error: 'Ürün silinirken bir hata oluştu.' };
    }
}
