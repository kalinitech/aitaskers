import { create } from 'zustand'

export type ViewType = 'home' | 'browse' | 'profile' | 'dashboard' | 'admin'

export interface FilterState {
  platforms: string[]
  skills: string[]
  countries: string[]
  verification: string
  search: string
}

export interface UserState {
  id: string
  email: string
  role: string
  profileId: string | null
}

interface StoreState {
  currentView: ViewType
  selectedProfileId: string | null
  filters: FilterState
  user: UserState | null
  isLoginOpen: boolean
  setView: (view: ViewType) => void
  setSelectedProfileId: (id: string | null) => void
  setFilters: (filters: Partial<FilterState>) => void
  clearFilters: () => void
  setUser: (user: UserState | null) => void
  setIsLoginOpen: (open: boolean) => void
  logout: () => void
}

const defaultFilters: FilterState = {
  platforms: [],
  skills: [],
  countries: [],
  verification: 'all',
  search: '',
}

export const useStore = create<StoreState>((set) => ({
  currentView: 'home',
  selectedProfileId: null,
  filters: { ...defaultFilters },
  user: null,
  isLoginOpen: false,
  setView: (view) => set({ currentView: view }),
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { ...defaultFilters } }),
  setUser: (user) => set({ user }),
  setIsLoginOpen: (open) => set({ isLoginOpen: open }),
  logout: () => set({ user: null, currentView: 'home' }),
}))
