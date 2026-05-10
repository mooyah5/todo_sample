<script setup lang="ts">
import type { CreateTodoInput, Priority } from '#shared/types/todo'
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { create, isMutating } = useTodos()
const log = useLogger('TodoForm')

interface FormState {
  title: string
  description: string
  category: string
  tags: string[]
  priority: Priority
  dueDate: string
  expanded: boolean
}

const form = reactive<FormState>({
  title: '',
  description: '',
  category: '',
  tags: [],
  priority: 'medium',
  dueDate: '',
  expanded: false,
})

const titleError = ref<string | null>(null)
const titleInputRef = useTemplateRef<HTMLInputElement>('titleInput')

function reset() {
  form.title = ''
  form.description = ''
  form.category = ''
  form.tags = []
  form.priority = 'medium'
  form.dueDate = ''
  form.expanded = false
  titleError.value = null
}

async function submit() {
  if (form.title.trim().length === 0) {
    titleError.value = t('form.validation.titleRequired')
    titleInputRef.value?.focus()
    return
  }
  titleError.value = null

  const payload: CreateTodoInput = {
    title: form.title,
    description: form.description || undefined,
    category: form.category || undefined,
    tags: form.tags.length ? form.tags : undefined,
    priority: form.priority,
    dueDate: form.dueDate || null,
  }

  const created = await create(payload)
  if (created) {
    log.debug({ id: created.id }, 'todo created')
    reset()
    titleInputRef.value?.focus()
  }
}
</script>

<template>
  <section class="form" :aria-label="t('form.title')">
    <form @submit.prevent="submit">
      <div class="form__main">
        <input
          ref="titleInput"
          v-model="form.title"
          type="text"
          class="form__title"
          :class="{ 'form__title--error': titleError }"
          :placeholder="t('form.fields.titlePlaceholder')"
          :aria-label="t('form.fields.title')"
          :aria-invalid="titleError ? 'true' : 'false'"
          :disabled="isMutating"
          @focus="titleError = null"
        >
        <button
          type="button"
          class="form__btn form__btn--ghost"
          :aria-expanded="form.expanded"
          :aria-label="form.expanded ? t('form.collapse') : t('form.expand')"
          @click="form.expanded = !form.expanded"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            :style="{ transform: form.expanded ? 'rotate(180deg)' : '' }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button
          type="submit"
          class="form__btn form__btn--primary"
          :disabled="isMutating"
        >
          {{ isMutating ? t('form.submitting') : t('form.submit') }}
        </button>
      </div>

      <p v-if="titleError" class="form__error" role="alert">
        {{ titleError }}
      </p>

      <Transition name="expand">
        <div v-if="form.expanded" class="form__details">
          <div class="form__row">
            <input
              v-model="form.category"
              type="text"
              class="form__input"
              :placeholder="t('form.fields.categoryPlaceholder')"
              :aria-label="t('form.fields.category')"
              :disabled="isMutating"
            >
            <PrioritySelector
              v-model="form.priority"
              :disabled="isMutating"
            />
            <input
              v-model="form.dueDate"
              type="date"
              class="form__input"
              :disabled="isMutating"
              :aria-label="t('form.fields.dueDate')"
            >
          </div>

          <div class="form__group">
            <span class="form__hint">{{ t('form.fields.tagsHint') }}</span>
            <TagInput
              v-model="form.tags"
              :placeholder="t('form.fields.tagsPlaceholder')"
              :disabled="isMutating"
            />
          </div>

          <textarea
            v-model="form.description"
            rows="3"
            class="form__textarea"
            :placeholder="t('form.fields.descriptionPlaceholder')"
            :aria-label="t('form.fields.description')"
            :disabled="isMutating"
          />
        </div>
      </Transition>
    </form>
  </section>
</template>

<style lang="scss" scoped>
.form {
  &__main {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__title {
    flex: 1;
    min-width: 0;
    height: 38px;
    padding: 0 $space-3;
    border: 0;
    border-bottom: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text);
    font-size: $font-size-base;
    outline: none;
    transition: border-color $duration-base $ease-out;

    &::placeholder { color: var(--color-text-subtle); }
    &:focus { border-bottom-color: var(--color-text); }
    &--error { border-bottom-color: var(--color-danger); }
  }

  &__btn {
    @include flex-center;
    height: 32px;
    padding: 0 $space-3;
    border: 0;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    transition: background-color $duration-base $ease-out, color $duration-base $ease-out;

    &--ghost {
      background: transparent;
      color: var(--color-text-subtle);
      width: 32px;
      padding: 0;
      svg { transition: transform $duration-base $ease-out; }

      &:hover { background: var(--color-surface-hover); color: var(--color-text); }
    }

    &--primary {
      background: var(--color-accent);
      color: var(--color-text-on-accent);

      &:hover:not(:disabled) { background: var(--color-accent-hover); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }

  &__error {
    margin: $space-2 0 0;
    color: var(--color-danger);
    font-size: $font-size-xs;
  }

  &__details {
    margin-top: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-3;
    overflow: hidden;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-2;

    @include from-tablet {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__hint {
    font-size: $font-size-xs;
    color: var(--color-text-subtle);
    padding-left: $space-1;
  }

  &__input,
  &__textarea {
    height: 36px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-sm;
    background: transparent;
    color: var(--color-text);
    font-size: $font-size-sm;
    outline: none;
    transition: border-color $duration-base $ease-out;

    &:focus { border-color: var(--color-border-strong); }
  }

  &__textarea {
    height: auto;
    padding: $space-2 $space-3;
    resize: vertical;
    line-height: $line-height-normal;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height $duration-slow $ease-in-out,
    opacity $duration-base $ease-out,
    margin-top $duration-base $ease-out;
  max-height: 600px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}
</style>
