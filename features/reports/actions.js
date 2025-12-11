'use server';

import { prisma } from '@/lib/prisma.js';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

/** 
 aylık gelir maliyet kar analizi 
  son 6 ay
 */
export async function getProfitAnalysisDataAction() {
  try {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({
        key: d.toLocaleString('tr-TR', { month: 'short' }),
        start: startOfMonth(d),
        end: endOfMonth(d),
      });
    }

    const result = [];

    for (const m of months) {
      const sales = await prisma.stockTransaction.findMany({
        where: { type: 'SALE', date: { gte: m.start, lte: m.end } },
      });

      let revenue = 0;
      let cost = 0;

      for (const s of sales) {
        revenue += s.totalPrice;
        const snapshotCost = s.snapshotCost ?? 0;
        cost += snapshotCost * s.quantity;
      }

      const profit = revenue - cost;

      result.push({
        name: m.key,
        revenue,
        cost,
        profit,
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error('getProfitAnalysisDataAction Error:', error);
    return { success: false, error: 'Analiz verileri alınamadı.' };
  }
}

/** 
 ortalama alış  satış fiyatı 
 son 6 ay
 */
export async function getPriceTrendDataAction() {
  try {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({
        key: d.toLocaleString('tr-TR', { month: 'short' }),
        start: startOfMonth(d),
        end: endOfMonth(d),
      });
    }

    const result = [];

    for (const m of months) {
      const purchases = await prisma.stockTransaction.findMany({
        where: { type: 'PURCHASE', date: { gte: m.start, lte: m.end } },
      });

      const sales = await prisma.stockTransaction.findMany({
        where: { type: 'SALE', date: { gte: m.start, lte: m.end } },
      });

      const avgPurchase =
        purchases.length > 0
          ? purchases.reduce((sum, p) => sum + p.unitPrice, 0) / purchases.length
          : 0;

      const avgSell =
        sales.length > 0
          ? sales.reduce((sum, s) => sum + s.unitPrice, 0) / sales.length
          : 0;

      result.push({
        name: m.key,
        avgPurchase: Math.round(avgPurchase || 0),
        avgSell: Math.round(avgSell || 0),
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error('getPriceTrendDataAction Error:', error);
    return { success: false, error: 'Fiyat trend verileri alınamadı.' };
  }
}
