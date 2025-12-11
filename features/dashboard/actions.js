'use server';

import { prisma } from '@/lib/prisma.js';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';


export async function getDashboardStatsAction() {
  try {
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

     // toplam ürün sayısı

    const totalProducts = await prisma.product.count();

    // Kritik Stok Adedi
    //   minStock tanımlı ise ona göre
    //  yoksa varsayılan 5 e göre
    const allProducts = await prisma.product.findMany({
      select: {
        currentStock: true,
        minStock: true,
      },
    });

    const criticalStock = allProducts.filter((p) => {
      const min = p.minStock != null ? p.minStock : 5;
      return p.currentStock <= min;
    }).length;

     // Toplam Stok Değeri 
     //    currentStock * averageCost 

    const productsForValue = await prisma.product.findMany({
      select: { currentStock: true, averageCost: true },
    });

    const totalStockValue = productsForValue.reduce((acc, p) => {
      return acc + p.currentStock * p.averageCost;
    }, 0);

     // Bu Ay Tahmini Kar
     //   Kar = Satış Toplamı - (snapshotCost * quantity)

    const salesThisMonth = await prisma.stockTransaction.findMany({
      where: {
        type: 'SALE',
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    let monthlyProfit = 0;

    salesThisMonth.forEach((sale) => {
      const cost = (sale.snapshotCost || 0) * sale.quantity;
      const revenue = sale.totalPrice; // quantity * unitPrice
      monthlyProfit += revenue - cost;
    });

    /* -------------------------------------------------------
      Stok Değeri Analizi (Son 6 Ay)
     
      Her ayın SONUNDAKİ stok toplam değerini hesaplıyoruz
        stokDeğeri(E) = ( o tarihe kadar yapılan tüm alışlar toplamı )
                        - ( o tarihe kadar satılanların maliyet toplamı )
       Alış maliyeti: PURCHASE.totalPrice
       Satış maliyeti: SALE.snapshotCost * quantity
     ----------------------------------------------------- */
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const key = start.toLocaleString('tr-TR', { month: 'short' }); 
      months.push({ key, start, end });
    }

    const stockChart = [];

    for (const m of months) {
      const purchasesAgg = await prisma.stockTransaction.aggregate({
        where: {
          type: 'PURCHASE',
          date: {
            lte: m.end,
          },
        },
        _sum: {
          totalPrice: true,
        },
      });

      const salesUpToMonth = await prisma.stockTransaction.findMany({
        where: {
          type: 'SALE',
          date: {
            lte: m.end,
          },
        },
        select: {
          quantity: true,
          snapshotCost: true,
        },
      });

      let soldCost = 0;
      salesUpToMonth.forEach((s) => {
        soldCost += (s.snapshotCost || 0) * s.quantity;
      });

      const purchasedCost = purchasesAgg._sum.totalPrice || 0;

      const stockValueAtEnd = purchasedCost - soldCost;

      stockChart.push({
        name: m.key,
        total: stockValueAtEnd < 0 ? 0 : stockValueAtEnd,
      });
    }

    const data = {
      totalProducts,
      totalStockValue,
      criticalStock,
      monthlyProfit,
      stockChart,
    };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(data)),
    };
  } catch (error) {
    console.error('getDashboardStatsAction Error:', error);
    return { success: false, error: 'İstatistikler alınamadı.' };
  }
}
