import { create } from 'zustand';

export const useUIStore = create((set) => ({
    isSidebarOpen: true,

    toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    closeSidebar: () => set({ isSidebarOpen: false }),

    openSidebar: () => set({ isSidebarOpen: true }),
}));
