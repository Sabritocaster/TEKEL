'use server';

import { prisma } from '@/lib/prisma.js';
import { stockTransactionSchema } from '@/lib/validations.js';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/auditLogger.js';

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
      const totalCurrentValue = currentStock * averageCost;
      const newPurchaseValue = quantity * unitPrice;
      const totalQuantity = currentStock + quantity;

      currentStock = totalQuantity;

      if (totalQuantity > 0) {
        averageCost = (totalCurrentValue + newPurchaseValue) / totalQuantity;
      } else {
        averageCost = 0;
      }

      averageCost = Math.round(averageCost * 100) / 100;

      if (movement.snapshotCost !== null) {
        await tx.stockTransaction.update({
          where: { id },
          data: { snapshotCost: null },
        });
      }
    } else if (type === 'SALE') {
      if (currentStock < quantity) {
        throw new Error(
          `Geçmiş veriler tutarsız: Ürün ${productId} için stok eksiye düşüyor.`
        );
      }

      const snapshotCost = averageCost;

      await tx.stockTransaction.update({
        where: { id },
        data: { snapshotCost },
      });

      currentStock -= quantity;
    }
  }

  await tx.product.update({
    where: { id: productId },
    data: {
      currentStock,
      averageCost,
    },
  });
}

// YENİ STOK HAREKETİ EKLEME                         

export async function createStockTransactionAction(rawData) {
  try {
    const validated = stockTransactionSchema.safeParse(rawData);

    if (!validated.success) {
      return { success: false, error: 'Geçersiz veri formatı.' };
    }

    const { productId, type, quantity, unitPrice } = validated.data;

    const createdTx = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Ürün bulunamadı.');
      }

      const newTx = await tx.stockTransaction.create({
        data: {
          productId,
          type,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          date: new Date(),
        },
      });

      await recalculateProductState(tx, productId);

      // LOG
      await logAction({
        action: type === 'PURCHASE' ? 'STOCK_PURCHASE' : 'STOCK_SALE',
        targetId: newTx.id,
        targetType: 'StockTransaction',
        oldValue: null,
        newValue: newTx,
        message:
          type === 'PURCHASE'
            ? `Stok girişi: Ürün=${product.name}, Adet=${quantity}, Fiyat=${unitPrice}`
            : `Stok çıkışı: Ürün=${product.name}, Adet=${quantity}, Fiyat=${unitPrice}`,
      });

      return newTx;
    });

    revalidatePath('/stock-movements');
    revalidatePath('/products');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true, data: JSON.parse(JSON.stringify(createdTx)) };
  } catch (error) {
    console.error('createStockTransactionAction Error:', error);
    return {
      success: false,
      error: error.message || 'İşlem sırasında bir hata oluştu.',
    };
  }
}

//  STOK LİSTELEME                                   

export async function getStockMovementsAction(limit = 50, rangeKey = '6m') {
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

// STOK HAREKETİ SİLME
export async function deleteStockTransactionAction(id) {
  try {
    if (!id) return { success: false, error: 'İşlem kimliği (id) eksik.' };

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.stockTransaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new Error('İşlem bulunamadı.');
      }

      const product = await tx.product.findUnique({
        where: { id: transaction.productId },
      });

      if (!product) {
        throw new Error('Ürün bulunamadı.');
      }

      await tx.stockTransaction.delete({ where: { id } });

      await recalculateProductState(tx, product.id);

      await logAction({
        action: 'STOCK_UPDATE',
        targetId: transaction.id,
        targetType: 'StockTransaction',
        oldValue: transaction,
        newValue: null,
        message: `Stok hareketi silindi: Ürün=${product.name}, Adet=${transaction.quantity}`,
      });
    });

    revalidatePath('/stock-movements');
    revalidatePath('/products');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('deleteStockTransactionAction Error:', error);
    return {
      success: false,
      error: error.message || 'Silme işlemi sırasında hata oluştu.',
    };
  }
}

//  STOK HAREKETİ GÜNCELLEME   

export async function updateStockTransactionAction(rawData) {
  try {
    const validated = stockTransactionSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: "Geçersiz veri." };
    }

    const { id } = rawData;
    if (!id) return { success: false, error: "İşlem kimliği (id) eksik." };

    await prisma.$transaction(async (tx) => {
      const oldTx = await tx.stockTransaction.findUnique({ where: { id } });
      if (!oldTx) throw new Error("İşlem bulunamadı.");

      const { productId, type, quantity, unitPrice } = validated.data;

      const updatedTx = await tx.stockTransaction.update({
        where: { id },
        data: {
          productId,
          type,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      });

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      let msg = `Stok hareketi güncellendi: Ürün=${product.name}, `;

      if (oldTx.quantity !== updatedTx.quantity) {
        msg += `Adet: ${oldTx.quantity} → ${updatedTx.quantity}`;
      } else if (oldTx.unitPrice !== updatedTx.unitPrice) {
        msg += `Fiyat: ${oldTx.unitPrice} → ${updatedTx.unitPrice}`;
      } else {
        msg += "Değişiklik tespit edilmedi";
      }

      await logAction({
        action: "STOCK_UPDATE",
        targetId: updatedTx.id,
        targetType: "StockTransaction",
        oldValue: oldTx,
        newValue: updatedTx,
        message: msg,
      });

      if (oldTx.productId !== productId) {
    await recalculateProductState(tx, oldTx.productId);  
    await recalculateProductState(tx, productId); 
    } else {
    await recalculateProductState(tx, productId);
    }

    });

    revalidatePath("/stock-movements");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error("updateStockTransactionAction Error:", error);
    return {
      success: false,
      error: error.message || "Güncelleme hatası.",
    };
  }
}
