<script setup lang="ts">
import { TODO_FILTERS, type TodoFilter } from '#shared/types/todo'
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const {
  filter,
  selectedCategory,
  categories,
  activeCount,
  doneCount,
  setFilter,
  setCategory,
} = useTodos()

const summary = computed(() =>
  t('filter.summary', { active: activeCount.value, done: doneCount.value }),
)

function onCategoryChange(value: string) {
  setCategory(value === '' ? null : value)
}

const currentCategory = computed<string>(() => selectedCategory.value ?? '')
</script>

<template>
  <section class="filter" :aria-label="t('filter.all')">
    <div class="filter__tabs" role="tablist">
      <button
        v-for="f in TODO_FILTERS"
        :key="f"
        type="button"
        role="tab"
        class="filter__tab"
        :class="{ 'filter__tab--active': filter === f }"
        :aria-selected="filter === f"
        @click="setFilter(f as TodoFilter)"
      >
        {{ t(`filter.${f}`) }}
      </button>
    </div>

    <div class="filter__meta">
      <select
        v-if="categories.length > 0"
        class="filter__select"
        :aria-label="t('filter.category')"
        :value="currentCategory"
        @change="onCategoryChange(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('filter.categoryAll') }}</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <span class="filter__summary">{{ summary }}</span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  flex-wrap: wrap;

  &__tabs {
    display: inline-flex;
    gap: $space-1;
  }

  &__tab {
    height: 28px;
    padding: 0 $space-3;
    border: 0;
    background: transparent;
    color: var(--color-text-subtle);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    border-radius: $radius-sm;
    transition: background-color $duration-base $ease-out, color $duration-base $ease-out;

    &:hover { color: var(--color-text); }
    &--active {
      color: var(--color-text);
      background: var(--color-surface-alt);
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-left: auto;
  }

  &__select {
    height: 28px;
    padding: 0 $space-2;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    font-size: $font-size-sm;
    outline: none;
    border-radius: $radius-sm;
    cursor: pointer;

    &:hover { background: var(--color-surface-hover); color: var(--color-text); }
    &:focus { background: var(--color-surface-alt); }
  }

  &__summary {
    color: var(--color-text-subtle);
    font-size: $font-size-xs;
    font-variant-numeric: tabular-nums;
  }
}
</style>
