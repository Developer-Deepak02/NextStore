import { create } from "zustand";

interface AdminStore {
	isCollapsed: boolean;
	toggleCollapsed: () => void;
	setCollapsed: (value: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
	isCollapsed: false,
	toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
	setCollapsed: (value) => set({ isCollapsed: value }),
}));
  