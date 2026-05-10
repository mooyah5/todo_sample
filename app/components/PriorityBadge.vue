<script setup lang="ts">
import type { Priority } from '#shared/types/todo'

interface Props {
  priority: Priority
  size?: 'sm' | 'md'
}
const props = withDefaults(defineProps<Props>(), { size: 'md' })

const { t } = useI18n()
const label = computed(() => t(`priority.${props.priority}`))
</script>

<template>
  <span
    class="badge"
    :class="[`badge--${priority}`, `badge--${size}`]"
    :title="label"
  >
    <span class="badge__dot" aria-hidden="true" />
    <span class="badge__text">{{ label }}</span>
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-1 $space-3;
  border-radius: $radius-pill;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  line-height: 1;

  &--sm {
    padding: 2px $space-2;
    font-size: 0.6875rem;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--low  .badge__dot { background: var(--color-priority-low); }
  &--medium .badge__dot { background: var(--color-priority-medium); }
  &--high .badge__dot { background: var(--color-priority-high); }

  &--high {
    color: var(--color-priority-high);
    background: color-mix(in srgb, var(--color-priority-high) 12%, transparent);
  }
}
</style>
