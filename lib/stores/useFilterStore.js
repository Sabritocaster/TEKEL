import { create } from 'zustand';

export const useFilterStore = create((set) => ({
    search: '',
    category: null,
    period: '1M',

    setSearch: (search) => set({ search }),
    setCategory: (category) => set({ category }),
    setPeriod: (period) => set({ period }),

    reset: () => set({ search: '', category: null, period: '1M' }),
}));
