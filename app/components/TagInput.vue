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
        <span>#{{ tag }}</span>
        <button
          type="button"
          class="tag-input__remove"
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
  min-height: 36px;
  padding: $space-1 $space-2;
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  background: var(--color-surface);

  &:focus-within { border-color: var(--color-border-strong); }
  &--disabled { opacity: 0.6; pointer-events: none; }

  &__list {
    display: contents;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px $space-2;
    color: var(--color-text-muted);
    font-size: $font-size-xs;
    border-radius: $radius-sm;
    background: var(--color-surface-alt);
  }

  &__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    background: transparent;
    border: 0;
    color: var(--color-text-subtle);
    font-size: 14px;
    line-height: 1;
    border-radius: 50%;

    &:hover { color: var(--color-text); }
  }

  &__field {
    flex: 1;
    min-width: 100px;
    border: 0;
    background: transparent;
    padding: 0 $space-1;
    font-size: $font-size-sm;
    outline: none;
    color: var(--color-text);

    &::placeholder { color: var(--color-text-subtle); }
  }
}

.tag-enter-active,
.tag-leave-active { transition: opacity $duration-fast $ease-out, transform $duration-fast $ease-out; }
.tag-enter-from,
.tag-leave-to { opacity: 0; transform: scale(0.9); }
</style>
