<script setup lang="ts">
import { PRIORITIES, type Priority } from '#shared/types/todo'

interface Props {
  modelValue: Priority
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })

defineEmits<{
  'update:modelValue': [value: Priority]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="prio" role="radiogroup" :aria-label="t('form.fields.priority')">
    <button
      v-for="p in PRIORITIES"
      :key="p"
      type="button"
      role="radio"
      :aria-checked="modelValue === p"
      :aria-label="t(`priority.${p}`)"
      :title="t(`priority.${p}`)"
      class="prio__btn"
      :class="[`prio__btn--${p}`, { 'prio__btn--active': modelValue === p }]"
      :disabled="disabled"
      @click="$emit('update:modelValue', p)"
    >
      <span class="prio__dot" aria-hidden="true" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.prio {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 36px;
  padding: 0 $space-2;
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  background: var(--color-surface);

  &__btn {
    @include flex-center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    background: transparent;
    border-radius: 50%;
    transition:
      background-color $duration-fast $ease-out;

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }

    &--active {
      background: var(--color-surface-alt);
      .prio__dot {
        transform: scale(1.5);
      }
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: transform $duration-base $ease-out;
  }

  &__btn--low    .prio__dot { background: var(--color-priority-low); }
  &__btn--medium .prio__dot { background: var(--color-priority-medium); }
  &__btn--high   .prio__dot { background: var(--color-priority-high); }
}
</style>
