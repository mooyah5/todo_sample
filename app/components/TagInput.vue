<script setup lang="ts">
interface Props {
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const draft = ref('')

function commit() {
  const value = draft.value.trim()
  if (!value) return
  if (props.modelValue.includes(value)) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, value])
  draft.value = ''
}

function remove(tag: string) {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commit()
  }
  else if (e.key === 'Backspace' && draft.value === '' && props.modelValue.length > 0) {
    const last = props.modelValue[props.modelValue.length - 1]
    if (last) remove(last)
  }
}
</script>

<template>
  <div class="tag-input" :class="{ 'tag-input--disabled': disabled }">
    <TransitionGroup name="tag" tag="ul" class="tag-input__list">
      <li v-for="tag in modelValue" :key="tag" class="tag-input__chip">
        <span class="tag-input__chip-label">#{{ tag }}</span>
        <button
          type="button"
          class="tag-input__chip-remove"
          :disabled="disabled"
          :aria-label="`Remove ${tag}`"
          @click="remove(tag)"
        >×</button>
      </li>
    </TransitionGroup>
    <input
      v-model="draft"
      type="text"
      class="tag-input__field"
      :placeholder="placeholder"
      :disabled="disabled"
      @keydown="onKeydown"
      @blur="commit"
    >
  </div>
</template>

<style lang="scss" scoped>
.tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-3;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-surface);
  transition: border-color $duration-base $ease-out;

  &:focus-within {
    border-color: var(--color-accent);
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &__list {
    display: contents;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    padding: 2px $space-2;
    background: var(--color-accent-soft);
    color: var(--color-accent);
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: $radius-pill;
  }

  &__chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: transparent;
    border: 0;
    color: inherit;
    font-size: 14px;
    line-height: 1;
    border-radius: 50%;
    transition: background-color $duration-fast $ease-out;

    &:hover {
      background: color-mix(in srgb, currentColor 20%, transparent);
    }
  }

  &__field {
    flex: 1;
    min-width: 120px;
    border: 0;
    background: transparent;
    padding: $space-1 0;
    font-size: $font-size-sm;
    outline: none;

    &::placeholder {
      color: var(--color-text-subtle);
    }
  }
}

.tag-enter-active,
.tag-leave-active {
  transition:
    opacity $duration-fast $ease-out,
    transform $duration-fast $ease-out;
}
.tag-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
