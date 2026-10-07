import { create } from 'zustand'

interface UiState {
  /** Sidebar trang quản trị đang thu gọn */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
