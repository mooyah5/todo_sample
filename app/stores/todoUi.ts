import { defineStore } from 'pinia'
import type { TodoFilter } from '#shared/types/todo'

// =============================================================================
// UI-only Pinia store — 클라이언트 사이드 화면 상태(필터/카테고리/검색)만 보관.
// 서버 상태(todo 목록 자체)는 TanStack Query 가 책임.
// =============================================================================

interface TodoUiState {
  filter: TodoFilter
  selectedCategory: string | null  // null = 전체
  searchQuery: string
}

export const useTodoUiStore = defineStore('todoUi', {
  state: (): TodoUiState => ({
    filter: 'all',
    selectedCategory: null,
    searchQuery: '',
  }),
  actions: {
    setFilter(filter: TodoFilter) {
      this.filter = filter
    },
    setCategory(category: string | null) {
      this.selectedCategory = category
    },
    setSearch(query: string) {
      this.searchQuery = query
    },
  },
})
