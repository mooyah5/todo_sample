<script setup lang="ts">
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { searchQuery, setSearch } = useTodos()

function onInput(e: Event) {
  setSearch((e.target as HTMLInputElement).value)
}

function clear() {
  setSearch('')
}
</script>

<template>
  <div class="search">
    <span class="search__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </span>
    <input
      :value="searchQuery"
      type="search"
      class="search__input"
      :placeholder="t('search.placeholder')"
      :aria-label="t('search.label')"
      @input="onInput"
    >
    <button
      v-if="searchQuery"
      type="button"
      class="search__clear"
      :aria-label="t('search.clear')"
      :title="t('search.clear')"
      @click="clear"
    >×</button>
  </div>
</template>

<style lang="scss" scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 $space-2 0 $space-3;
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  background: var(--color-surface);
  transition: border-color $duration-base $ease-out;

  &:focus-within { border-color: var(--color-border-strong); }

  &__icon {
    color: var(--color-text-subtle);
    margin-right: $space-2;
    @include flex-center;
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--color-text);
    font-size: $font-size-sm;
    outline: none;

    &::placeholder { color: var(--color-text-subtle); }

    // 브라우저 기본 search clear 버튼 숨김 (직접 만든 X 사용)
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
  }

  &__clear {
    @include flex-center;
    width: 22px;
    height: 22px;
    border: 0;
    background: transparent;
    color: var(--color-text-subtle);
    font-size: 16px;
    line-height: 1;
    border-radius: 50%;
    transition: background-color $duration-fast $ease-out, color $duration-fast $ease-out;

    &:hover { background: var(--color-surface-hover); color: var(--color-text); }
  }
}
</style>
