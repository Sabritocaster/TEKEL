import { create } from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    isLoading: false,

    setProducts: (products) => set({ products }),

    addProduct: (product) =>
        set((state) => ({
            products: [...state.products, product],
        })),

    updateProduct: (id, updates) =>
        set((state) => ({
            products: state.products.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            ),
        })),
}));
