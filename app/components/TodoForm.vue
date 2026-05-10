<script setup lang="ts">
import { PRIORITIES, type CreateTodoInput, type Priority } from '#shared/types/todo'
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
      <div class="form__row form__row--main">
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
          class="form__expand"
          :aria-expanded="form.expanded"
          :aria-label="form.expanded ? '간단히' : '자세히'"
          @click="form.expanded = !form.expanded"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :style="{ transform: form.expanded ? 'rotate(180deg)' : '' }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button
          type="submit"
          class="form__submit"
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
            <label class="form__field">
              <span class="form__label">{{ t('form.fields.description') }}</span>
              <textarea
                v-model="form.description"
                rows="2"
                class="form__textarea"
                :placeholder="t('form.fields.descriptionPlaceholder')"
                :disabled="isMutating"
              />
            </label>
          </div>
          <div class="form__row form__row--grid">
            <label class="form__field">
              <span class="form__label">{{ t('form.fields.category') }}</span>
              <input
                v-model="form.category"
                type="text"
                class="form__input"
                :placeholder="t('form.fields.categoryPlaceholder')"
                :disabled="isMutating"
              >
            </label>
            <label class="form__field">
              <span class="form__label">{{ t('form.fields.priority') }}</span>
              <select
                v-model="form.priority"
                class="form__select"
                :disabled="isMutating"
              >
                <option v-for="p in PRIORITIES" :key="p" :value="p">
                  {{ t(`priority.${p}`) }}
                </option>
              </select>
            </label>
            <label class="form__field">
              <span class="form__label">{{ t('form.fields.dueDate') }}</span>
              <input
                v-model="form.dueDate"
                type="date"
                class="form__input"
                :disabled="isMutating"
              >
            </label>
          </div>
          <div class="form__row">
            <div class="form__field">
              <span class="form__label">{{ t('form.fields.tags') }}</span>
              <TagInput
                v-model="form.tags"
                :placeholder="t('form.fields.tagsPlaceholder')"
                :disabled="isMutating"
              />
            </div>
          </div>
        </div>
      </Transition>
    </form>
  </section>
</template>

<style lang="scss" scoped>
.form {
  @include surface;
  padding: $space-4;

  @include from-tablet {
    padding: $space-5;
  }

  &__row {
    display: flex;
    align-items: stretch;
    gap: $space-2;

    & + & {
      margin-top: $space-3;
    }

    &--main {
      flex-wrap: wrap;
    }

    &--grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: $space-3;

      @include from-tablet {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }

  &__title {
    flex: 1 1 0;
    min-width: 0;
    height: 44px;
    padding: 0 $space-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface-alt);
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: var(--color-text);
    outline: none;
    transition: border-color $duration-base $ease-out, background-color $duration-base $ease-out;

    &::placeholder {
      color: var(--color-text-subtle);
    }
    &:focus {
      border-color: var(--color-accent);
      background: var(--color-surface);
    }
    &--error {
      border-color: var(--color-danger);
    }
  }

  &__expand {
    @include flex-center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    color: var(--color-text-muted);
    transition: background-color $duration-base $ease-out;

    svg {
      transition: transform $duration-base $ease-out;
    }
    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  &__submit {
    height: 44px;
    padding: 0 $space-5;
    border: 0;
    border-radius: $radius-md;
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    font-weight: $font-weight-semibold;
    transition: background-color $duration-base $ease-out, transform $duration-fast $ease-out;

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
    &:active:not(:disabled) {
      transform: scale(0.97);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    margin: $space-2 0 0;
    color: var(--color-danger);
    font-size: $font-size-xs;
  }

  &__details {
    margin-top: $space-3;
    padding-top: $space-3;
    border-top: 1px dashed var(--color-border);
    overflow: hidden;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    flex: 1;
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    font-weight: $font-weight-medium;
  }

  &__input,
  &__select,
  &__textarea {
    height: 40px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-sm;
    outline: none;
    transition: border-color $duration-base $ease-out;

    &:focus {
      border-color: var(--color-accent);
    }
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
    opacity $duration-base $ease-out;
  max-height: 600px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0 !important;
  padding-top: 0 !important;
  border-top-color: transparent !important;
}
</style>
