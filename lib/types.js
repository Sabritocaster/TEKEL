// Bu dosya artık sadece referans amaçlıdır. JavaScript'te interface veya type kullanılmaz.

// Product yapısı:
// {
//   id: string,
//   name: string,
//   cc: string, // "35cl", "50cl" vb.
//   category: string,
//   minStock: number | undefined,
//   maxStock: number | undefined,
//   currentStock: number,
//   createdAt: Date,
//   updatedAt: Date
// }

// StockMovement yapısı:
// {
//   id: string,
//   productId: string,
//   type: 'IN' | 'OUT',
//   quantity: number,
//   unitPrice: number,
//   date: Date
// }

// period değerleri
export const PERIODS = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];
