'use server';

import { prisma } from '@/lib/prisma.js';
import { stockTransactionSchema } from '@/lib/validations.js';
import { revalidatePath } from 'next/cache';

/**
  belirli bir ürün için tüm stok hareketlerini baştan hesaplar.
     currentStock
     averageCost (WAC)
     satışlar için snapshotCost
 */
async function recalculateProductState(tx, productId) {
  const movements = await tx.stockTransaction.findMany({
    where: { productId },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  let currentStock = 0;
  let averageCost = 0;

  for (const movement of movements) {
    const { type, quantity, unitPrice, id } = movement;

    if (type === 'PURCHASE') {
      // Eski toplam değer
      const totalCurrentValue = currentStock * averageCost;
      // Yeni alımın toplam maliyeti
      const newPurchaseValue = quantity * unitPrice;
      const totalQuantity = currentStock + quantity;

      currentStock = totalQuantity;

      if (totalQuantity > 0) {
        averageCost = (totalCurrentValue + newPurchaseValue) / totalQuantity;
      } else {
        averageCost = 0;
      }

      // 2 basamağa yuvarla
      averageCost = Math.round(averageCost * 100) / 100;

      // Alış hareketinde snapshotCost olmamalı
      if (movement.snapshotCost !== null) {
        await tx.stockTransaction.update({
          where: { id },
          data: { snapshotCost: null },
        });
      }
    } else if (type === 'SALE') {
      // Satıştan önce yeterli stok var mı
      if (currentStock < quantity) {
        throw new Error(
          `Geçmiş veriler tutarsız: Ürün ${productId} için stok eksiye düşüyor.`
        );
      }

      // Satış anındaki maliyeti snapshot olarak kaydet
      const snapshotCost = averageCost;

      await tx.stockTransaction.update({
        where: { id },
        data: { snapshotCost },
      });

      // Satış sonrası stok düşer
      currentStock -= quantity;
    }
  }

  // Ürünü güncelle
  await tx.product.update({
    where: { id: productId },
    data: {
      currentStock,
      averageCost,
    },
  });
}

 // Yeni stok hareketi (alış satış) ekleme
 
export async function createStockTransactionAction(rawData) {
  try {
    const validated = stockTransactionSchema.safeParse(rawData);

    if (!validated.success) {
      return { success: false, error: 'Geçersiz veri formatı.' };
    }

    const { productId, type, quantity, unitPrice } = validated.data;

    const createdTx = await prisma.$transaction(async (tx) => {
      // Ürünü kontrol et
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Ürün bulunamadı.');
      }

      // Hareketi oluştur
      const newTx = await tx.stockTransaction.create({
        data: {
          productId,
          type,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      });

      // Ürünün stok  maliyetini baştan hesapla
      await recalculateProductState(tx, productId);

      return newTx;
    });

    // SSR sayfalarını invalidate et
    revalidatePath('/stock-movements');
    revalidatePath('/products');
    revalidatePath('/dashboard');

    const sanitized = JSON.parse(JSON.stringify(createdTx));
    return { success: true, data: sanitized };
  } catch (error) {
    console.error('createStockTransactionAction Error:', error);
    return {
      success: false,
      error: error.message || 'İşlem sırasında bir hata oluştu.',
    };
  }
}

  // Stok hareketlerini listeleme
 
export async function getStockMovementsAction(limit = 50) {
  try {
    const movements = await prisma.stockTransaction.findMany({
      include: {
        product: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(movements)),
    };
  } catch (error) {
    console.error('getStockMovementsAction Error:', error);
    return {
      success: false,
      error: 'Hareketler yüklenirken hata oluştu.',
    };
  }
}


 //  Hareket silme ve ürün stok,maliyetini düzeltme
 
export async function deleteStockTransactionAction(id) {
  try {
    await prisma.$transaction(async (tx) => {
      //  Silinecek hareketi al
      const transaction = await tx.stockTransaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new Error('İşlem bulunamadı.');
      }

      const productId = transaction.productId;

      //  Hareketi sil
      await tx.stockTransaction.delete({ where: { id } });

      //  ürün için stok ve maliyeti baştan hesapla
      await recalculateProductState(tx, productId);
    });

    revalidatePath('/stock-movements');
    revalidatePath('/products');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('deleteStockTransactionAction Error:', error);
    return {
      success: false,
      error: error.message || 'Silme hatası.',
    };
  }
}

//  Hareket güncelleme (ürün değiştirme ihtimali dahil)

export async function updateStockTransactionAction(rawData) {
  try {
    const validated = stockTransactionSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: 'Geçersiz veri.' };
    }

    const { id } = rawData; 
    if (!id) {
      return { success: false, error: 'İşlem kimliği (id) eksik.' };
    }

    await prisma.$transaction(async (tx) => {
      // Eski işlemi getir
      const oldTx = await tx.stockTransaction.findUnique({
        where: { id },
      });
      if (!oldTx) throw new Error('İşlem bulunamadı.');

      const oldProductId = oldTx.productId;
      const { productId, type, quantity, unitPrice } = validated.data;

      // İşlemi güncelle
      await tx.stockTransaction.update({
        where: { id },
        data: {
          productId,
          type,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      });

      // ürün değiştiyse iki ürün için de hesapla
      if (productId !== oldProductId) {
        await recalculateProductState(tx, oldProductId);
        await recalculateProductState(tx, productId);
      } else {
        await recalculateProductState(tx, productId);
      }
    });

    revalidatePath('/stock-movements');
    revalidatePath('/products');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('updateStockTransactionAction Error:', error);
    return {
      success: false,
      error: error.message || 'Güncelleme hatası.',
    };
  }
}
