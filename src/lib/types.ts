export interface Product {
    id: string;
    name: string;
    cc: string; // e.g., "35cl", "50cl", "70cl", "100cl"
    category: string; // e.g., "Rakı", "Viski", "Votka"
    minStock?: number;
    maxStock?: number;
    currentStock: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface StockMovement {
    id: string;
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    unitPrice: number;
    date: Date;
}

export type Period = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
