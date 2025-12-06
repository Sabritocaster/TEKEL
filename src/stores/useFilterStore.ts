import { create } from 'zustand';
import { Period } from '@/lib/types';

interface FilterState {
    search: string;
    category: string | null;
    period: Period;
    setSearch: (search: string) => void;
    setCategory: (category: string | null) => void;
    setPeriod: (period: Period) => void;
    reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    search: '',
    category: null,
    period: '1M',
    setSearch: (search) => set({ search }),
    setCategory: (category) => set({ category }),
    setPeriod: (period) => set({ period }),
    reset: () => set({ search: '', category: null, period: '1M' }),
}));
