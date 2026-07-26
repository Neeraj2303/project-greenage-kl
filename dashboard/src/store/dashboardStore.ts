import { create } from 'zustand';
import { PatientProfile } from '../types';

interface DashboardFilters {
  searchQuery: string;
  district: string;
  gender: string;
  group: string;
  riskCategory: string;
}

interface DashboardState {
  cohort: PatientProfile[];
  activePatientId: string | null;
  activeTimepoint: 'BL' | 'M3' | 'M6' | 'M12';
  filters: DashboardFilters;
  darkMode: boolean;
  activeTab: string;
  
  setCohort: (cohort: PatientProfile[]) => void;
  setActivePatientId: (id: string | null) => void;
  setActiveTimepoint: (tp: 'BL' | 'M3' | 'M6' | 'M12') => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  cohort: [],
  activePatientId: null,
  activeTimepoint: 'BL',
  filters: {
    searchQuery: '',
    district: 'All',
    gender: 'All',
    group: 'All',
    riskCategory: 'All',
  },
  darkMode: false,
  activeTab: 'personal-overview',
  
  setCohort: (cohort) => set({ cohort }),
  setActivePatientId: (id) => set({ activePatientId: id }),
  setActiveTimepoint: (tp) => set({ activeTimepoint: tp }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.darkMode;
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { darkMode: nextMode };
  }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  resetFilters: () => set({
    filters: {
      searchQuery: '',
      district: 'All',
      gender: 'All',
      group: 'All',
      riskCategory: 'All',
    }
  }),
}));
export default useDashboardStore;
