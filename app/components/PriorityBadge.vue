<script setup lang="ts">
import type { Priority } from '#shared/types/todo'

interface Props {
  priority: Priority
}
defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <span
    class="badge"
    :class="`badge--${priority}`"
    :title="t(`priority.${priority}`)"
    :aria-label="t(`priority.${priority}`)"
  >
    <span class="badge__dot" aria-hidden="true" />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--low    .badge__dot { background: var(--color-priority-low); }
  &--medium .badge__dot { background: var(--color-priority-medium); }
  &--high   .badge__dot { background: var(--color-priority-high); }
}
</style>
