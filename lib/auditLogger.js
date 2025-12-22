'use server';

import { prisma } from '@/lib/prisma.js';

/**
 * Logs actions to the database for audit purposes.
 * Uygulamadaki işlemleri
 * denetim amacıyla veritabanındaki action_logs tablosuna kaydeder.
 *
 * @param {Object} params
 * @param {string} params.action - ActionType enum değeri 
 * @param {string|null} params.targetId - İşlemin yapıldığı kaydın ID’si
 * @param {string|null} params.targetType - Product veya StockTransaction gibi kayıt tipi
 * @param {any} params.oldValue - Güncellenen kaydın eski değeri
 * @param {any} params.newValue - Güncellenen kaydın yeni değeri
 * @param {string|null} params.message - Kullanıcıya yönelik açıklama
 */
export async function logAction({
  action,
  targetId = null,
  targetType = null,
  oldValue = null,
  newValue = null,
  message = null,
}) {
  try {
    await prisma.actionLog.create({
      data: {
        action,
        targetId,
        targetType,
        oldValue,
        newValue,
        message,
      },
    });
  } catch (error) {
    console.error('ActionLog error:', error);
  }
}
