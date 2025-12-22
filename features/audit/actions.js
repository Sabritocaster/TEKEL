'use server';

import { prisma } from '@/lib/prisma.js';

export async function getActionLogs(limit = 100) {
  try {
    const logs = await prisma.actionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, data: JSON.parse(JSON.stringify(logs)) };
  } catch (error) {
    console.error("getActionLogs Error:", error);
    return { success: false, error: 'Kayıtlar alınamadı.' };
  }
}
