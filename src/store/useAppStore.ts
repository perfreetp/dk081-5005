import { create } from 'zustand';
import type { MachineFilter, UserProfile } from '@/types/machine';

interface AppState {
  user: UserProfile | null;
  filter: MachineFilter;
  setUser: (user: UserProfile) => void;
  setFilter: (filter: MachineFilter) => void;
  resetFilter: () => void;
}

const defaultFilter: MachineFilter = {};

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'u_001',
    name: '王建国',
    avatar: 'https://picsum.photos/id/64/200/200',
    phone: '138****6789',
    role: 'dealer',
    location: '成都市',
    company: '建国工程机械',
    publishedCount: 12,
    dealCount: 28,
    favoriteCount: 5,
    rating: 4.8
  },
  filter: defaultFilter,
  setUser: (user) => set({ user }),
  setFilter: (filter) => set({ filter }),
  resetFilter: () => set({ filter: defaultFilter })
}));
