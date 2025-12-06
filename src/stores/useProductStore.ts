import { create } from 'zustand';
import { Product } from '@/lib/types';

interface ProductState {
    products: Product[];
    isLoading: boolean;
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    setProducts: (products) => set({ products }),
    addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
    updateProduct: (id, updates) =>
        set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
}));
