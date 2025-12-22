'use server';

import { prisma } from '@/lib/prisma.js';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subHours,
  format,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { computeRange, getRangeLabel } from '@/features/dashboard/rangePresets';

function buildBuckets(rangeKey, now, start, end) {
  const weekOpts = { weekStartsOn: 1 };

  if (rangeKey === 'today') {
    return [{ key: 'today', label: 'Bugün', start: startOfDay(now), end: endOfDay(now) }];
  }

  if (rangeKey === '7d' || rangeKey === '14d') {
    const buckets = [];
    let cur = startOfDay(start);
    const last = endOfDay(end);

    while (cur <= last) {
      const bStart = startOfDay(cur);
      buckets.push({
        key: bStart.toISOString(),
        label: format(bStart, 'dd MMM', { locale: tr }),
        start: bStart,
        end: endOfDay(cur),
      });
      cur = addDays(cur, 1);
    }
    return buckets;
  }

  if (rangeKey === '1m' || rangeKey === '3m') {
    const buckets = [];
    let cur = startOfWeek(start, weekOpts);
    const last = endOfWeek(end, weekOpts);

    while (cur <= last) {
      const bStart = startOfWeek(cur, weekOpts);
      const bEnd = endOfWeek(cur, weekOpts);
      buckets.push({
        key: bStart.toISOString(),
        label: `${format(bStart, 'dd MMM', { locale: tr })} - ${format(bEnd, 'dd MMM', { locale: tr })}`,
        start: bStart,
        end: bEnd,
      });
      cur = addWeeks(cur, 1);
    }
    return buckets;
  }

  if (rangeKey === '6m' || rangeKey === '1y') {
    const buckets = [];
    let cur = startOfMonth(start);
    const last = endOfMonth(end);

    while (cur <= last) {
      const bStart = startOfMonth(cur);
      buckets.push({
        key: bStart.toISOString(),
        label: format(bStart, 'MMM', { locale: tr }),
        start: bStart,
        end: endOfMonth(cur),
      });
      cur = addMonths(cur, 1);
    }
    return buckets;
  }

  const buckets = [];
  let cur = startOfMonth(start);
  const last = endOfMonth(end);

  while (cur <= last) {
    const bStart = startOfMonth(cur);
    buckets.push({
      key: bStart.toISOString(),
      label: format(bStart, 'MMM yyyy', { locale: tr }),
      start: bStart,
      end: endOfMonth(cur),
    });
    cur = addMonths(cur, 1);
  }
  return buckets;
}

export async function getDashboardStatsAction(rangeKey = '6m') {
  try {
    const now = new Date();

    let { start, end } = computeRange(rangeKey, now);
    const rangeLabel = getRangeLabel(rangeKey);

    if (rangeKey === 'all' && !start) {
      const firstTx = await prisma.stockTransaction.findFirst({
        orderBy: { date: 'asc' },
        select: { date: true },
      });
      start = firstTx?.date ? startOfMonth(firstTx.date) : startOfMonth(now);
      end = end ?? endOfDay(now);
    }

    end = end ?? endOfDay(now);
    const dateWhere = start ? { gte: start, lte: end } : { lte: end };

    const products = await prisma.product.findMany({
      select: { id: true, currentStock: true, minStock: true },
    });

    const minMap = new Map(products.map((p) => [p.id, p.minStock ?? 5]));
    const stockNowMap = new Map(products.map((p) => [p.id, p.currentStock ?? 0]));

    const txs = await prisma.stockTransaction.findMany({
      where: { date: dateWhere },
      select: {
        productId: true,
        type: true,
        quantity: true,
        snapshotCost: true,
        totalPrice: true,
        date: true,
        createdAt: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    const totalProducts = new Set(txs.map((t) => t.productId)).size;

    const purchasesAgg = await prisma.stockTransaction.aggregate({
      where: { type: 'PURCHASE', date: dateWhere },
      _sum: { totalPrice: true },
    });
    const purchasedTotal = purchasesAgg._sum.totalPrice || 0;

    let revenueTotal = 0;
    let soldCostTotal = 0;

    for (const t of txs) {
      if (t.type === 'SALE') {
        revenueTotal += t.totalPrice || 0;
        soldCostTotal += (t.snapshotCost || 0) * (t.quantity || 0);
      }
    }

    const totalStockValue = Math.max(purchasedTotal - soldCostTotal, 0);
    const rangeProfit = revenueTotal - soldCostTotal;

    const runningStock = new Map(stockNowMap);
    const minSeen = new Map();
    for (const p of products) minSeen.set(p.id, p.currentStock ?? 0);

    for (const t of txs) {
      const after = runningStock.get(t.productId) ?? 0;
      const qty = t.quantity || 0;
      const before = t.type === 'PURCHASE' ? after - qty : after + qty;

      runningStock.set(t.productId, before);

      const prevMin = minSeen.get(t.productId);
      minSeen.set(t.productId, Math.min(prevMin ?? after, after, before));
    }

    let criticalStock = 0;
    for (const [productId, seenMin] of minSeen.entries()) {
      const min = minMap.get(productId) ?? 5;
      if (seenMin <= min) criticalStock += 1;
    }

    const buckets = buildBuckets(rangeKey, now, start ?? startOfDay(now), end);
    const bucketAgg = new Map(buckets.map((b) => [b.key, { purchases: 0, soldCost: 0 }]));

    const findBucketKey = (d) => {
      const dt = new Date(d);
      for (const b of buckets) if (dt >= b.start && dt <= b.end) return b.key;
      return null;
    };

    for (const t of txs) {
      const key = findBucketKey(t.date);
      if (!key) continue;
      const row = bucketAgg.get(key);
      if (!row) continue;

      if (t.type === 'PURCHASE') row.purchases += t.totalPrice || 0;
      else if (t.type === 'SALE') row.soldCost += (t.snapshotCost || 0) * (t.quantity || 0);
    }

    const stockChart = buckets.map((b) => {
      const agg = bucketAgg.get(b.key) || { purchases: 0, soldCost: 0 };
      return { name: b.label, total: Math.max(agg.purchases - agg.soldCost, 0) };
    });

    const firstDayThisMonth = startOfMonth(now);
    const lastDayThisMonth = endOfMonth(now);

    const salesThisMonth = await prisma.stockTransaction.findMany({
      where: { type: 'SALE', date: { gte: firstDayThisMonth, lte: lastDayThisMonth } },
      select: { snapshotCost: true, quantity: true, totalPrice: true },
    });

    let monthlyProfit = 0;
    for (const sale of salesThisMonth) {
      const cost = (sale.snapshotCost || 0) * (sale.quantity || 0);
      const revenue = sale.totalPrice || 0;
      monthlyProfit += revenue - cost;
    }

    const twentyFourHoursAgo = subHours(now, 24);
    const transactions24h = await prisma.stockTransaction.findMany({
      where: { date: { gte: twentyFourHoursAgo, lte: now } },
      select: { type: true, totalPrice: true, snapshotCost: true, quantity: true },
    });

    let last24Purchase = 0;
    let last24Sales = 0;
    let last24GrossProfit = 0;

    for (const tx of transactions24h) {
      const total = tx.totalPrice || 0;
      if (tx.type === 'PURCHASE') last24Purchase += total;
      else if (tx.type === 'SALE') {
        last24Sales += total;
        last24GrossProfit += total - (tx.snapshotCost || 0) * (tx.quantity || 0);
      }
    }

    const totalTxCount = await prisma.stockTransaction.count();

    return {
      success: true,
      data: {
        totalProducts,
        totalStockValue,
        criticalStock,
        monthlyProfit,
        rangeProfit,
        stockChart,
        rangeLabel,
        last24Purchase,
        last24Sales,
        last24GrossProfit,
        hasTransactions24h: transactions24h.length > 0,
        hasAnyTransactions: totalTxCount > 0,
      },
    };
  } catch (error) {
    console.error('getDashboardStatsAction Error:', error);
    return { success: false, error: 'İstatistikler alınamadı.' };
  }
}
