<script setup lang="ts">
import { PRIORITIES, type Priority, type Todo, type UpdateTodoInput } from '#shared/types/todo'
import { useTodos } from '~/composables/useTodos'

interface Props {
  todo: Todo
}
const props = defineProps<Props>()

const { t } = useI18n()
const { toggle, update, remove } = useTodos()
const { format } = useDateLabel()
const log = useLogger('TodoItem')

const isEditing = ref(false)
const isBusy = ref(false)

interface EditState {
  title: string
  description: string
  category: string
  tags: string[]
  priority: Priority
  dueDate: string
}

const edit = reactive<EditState>({
  title: props.todo.title,
  description: props.todo.description,
  category: props.todo.category,
  tags: [...props.todo.tags],
  priority: props.todo.priority,
  dueDate: props.todo.dueDate ?? '',
})

const dueLabel = computed(() => format(props.todo.dueDate))

function enterEdit() {
  edit.title = props.todo.title
  edit.description = props.todo.description
  edit.category = props.todo.category
  edit.tags = [...props.todo.tags]
  edit.priority = props.todo.priority
  edit.dueDate = props.todo.dueDate ?? ''
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function save() {
  if (edit.title.trim().length === 0) return
  isBusy.value = true
  const input: UpdateTodoInput = {
    title: edit.title,
    description: edit.description,
    category: edit.category,
    tags: edit.tags,
    priority: edit.priority,
    dueDate: edit.dueDate || null,
  }
  const updated = await update(props.todo.id, input)
  isBusy.value = false
  if (updated) {
    log.debug({ id: updated.id }, 'todo updated')
    isEditing.value = false
  }
}

async function onToggle() {
  isBusy.value = true
  await toggle(props.todo.id)
  isBusy.value = false
}

async function onDelete() {
  if (!confirm(t('item.deleteConfirm'))) return
  isBusy.value = true
  const ok = await remove(props.todo.id)
  if (!ok) isBusy.value = false
}
</script>

<template>
  <li
    class="item"
    :class="{
      'item--done': todo.status === 'done',
      'item--editing': isEditing,
      'item--high': todo.priority === 'high' && todo.status === 'todo',
    }"
  >
    <!-- 보기 모드 -->
    <template v-if="!isEditing">
      <button
        type="button"
        class="item__check"
        :class="{ 'item__check--done': todo.status === 'done' }"
        :aria-label="t('item.toggle')"
        :aria-pressed="todo.status === 'done'"
        :disabled="isBusy"
        @click="onToggle"
      >
        <svg
          v-if="todo.status === 'done'"
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 8 7 12 13 4" />
        </svg>
      </button>

      <div class="item__body">
        <div class="item__head">
          <h3 class="item__title">{{ todo.title }}</h3>
          <PriorityBadge :priority="todo.priority" size="sm" />
        </div>

        <p v-if="todo.description" class="item__description">
          {{ todo.description }}
        </p>

        <div v-if="todo.category || todo.tags.length || dueLabel" class="item__meta">
          <span v-if="todo.category" class="item__category">{{ todo.category }}</span>
          <span
            v-for="tag in todo.tags"
            :key="tag"
            class="item__tag"
          >#{{ tag }}</span>
          <span
            v-if="dueLabel"
            class="item__due"
            :class="{
              'item__due--overdue': dueLabel.isOverdue && todo.status !== 'done',
              'item__due--today': dueLabel.isToday,
            }"
          >
            {{ dueLabel.isOverdue && todo.status !== 'done'
              ? `${dueLabel.text} · ${t('item.overdue')}`
              : dueLabel.text }}
          </span>
        </div>
      </div>

      <div class="item__actions">
        <button
          type="button"
          class="item__action"
          :aria-label="t('item.edit')"
          :title="t('item.edit')"
          :disabled="isBusy"
          @click="enterEdit"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
        <button
          type="button"
          class="item__action item__action--danger"
          :aria-label="t('item.delete')"
          :title="t('item.delete')"
          :disabled="isBusy"
          @click="onDelete"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </template>

    <!-- 수정 모드 -->
    <form v-else class="edit" @submit.prevent="save">
      <input
        v-model="edit.title"
        type="text"
        class="edit__title"
        :aria-label="t('form.fields.title')"
        :disabled="isBusy"
      >
      <textarea
        v-model="edit.description"
        rows="2"
        class="edit__textarea"
        :placeholder="t('form.fields.descriptionPlaceholder')"
        :disabled="isBusy"
      />
      <div class="edit__row">
        <input
          v-model="edit.category"
          type="text"
          class="edit__input"
          :placeholder="t('form.fields.categoryPlaceholder')"
          :disabled="isBusy"
        >
        <select
          v-model="edit.priority"
          class="edit__input"
          :disabled="isBusy"
        >
          <option v-for="p in PRIORITIES" :key="p" :value="p">
            {{ t(`priority.${p}`) }}
          </option>
        </select>
        <input
          v-model="edit.dueDate"
          type="date"
          class="edit__input"
          :disabled="isBusy"
        >
      </div>
      <TagInput
        v-model="edit.tags"
        :placeholder="t('form.fields.tagsPlaceholder')"
        :disabled="isBusy"
      />
      <div class="edit__actions">
        <button
          type="button"
          class="edit__btn edit__btn--ghost"
          :disabled="isBusy"
          @click="cancelEdit"
        >
          {{ t('item.cancel') }}
        </button>
        <button
          type="submit"
          class="edit__btn edit__btn--primary"
          :disabled="isBusy"
        >
          {{ t('item.save') }}
        </button>
      </div>
    </form>
  </li>
</template>

<style lang="scss" scoped>
.item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: $space-3;
  padding: $space-4;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-sm);
  transition:
    transform $duration-fast $ease-out,
    box-shadow $duration-base $ease-out,
    border-color $duration-base $ease-out;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-strong);
  }

  &--done {
    background: var(--color-surface-alt);
    .item__title { color: var(--color-text-muted); text-decoration: line-through; }
    .item__description { opacity: 0.7; }
  }

  &--high::before {
    content: '';
    position: absolute;
    left: 0;
    top: $space-4;
    bottom: $space-4;
    width: 3px;
    background: var(--color-priority-high);
    border-radius: $radius-pill;
  }

  &--editing {
    flex-direction: column;
    align-items: stretch;
    border-color: var(--color-accent);
  }

  // --- check ---
  &__check {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    border: 2px solid var(--color-border-strong);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-text-on-accent);
    @include flex-center;
    transition:
      background-color $duration-base $ease-out,
      border-color $duration-base $ease-out;

    &:hover {
      border-color: var(--color-accent);
    }
    &--done {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
  }

  // --- body ---
  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--color-text);
    line-height: $line-height-tight;
    word-break: break-word;
  }

  &__description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: $font-size-sm;
    line-height: $line-height-normal;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-2;
    font-size: $font-size-xs;
  }

  &__category {
    padding: 2px $space-2;
    background: var(--color-accent-soft);
    color: var(--color-accent);
    border-radius: $radius-sm;
    font-weight: $font-weight-medium;
  }

  &__tag {
    color: var(--color-text-subtle);
    font-weight: $font-weight-medium;
  }

  &__due {
    margin-left: auto;
    color: var(--color-text-muted);

    &--today {
      color: var(--color-info);
      font-weight: $font-weight-semibold;
    }
    &--overdue {
      color: var(--color-danger);
      font-weight: $font-weight-semibold;
    }
  }

  // --- actions ---
  &__actions {
    display: flex;
    gap: $space-1;
    flex-shrink: 0;
    opacity: 0.5;
    transition: opacity $duration-base $ease-out;
  }
  &:hover &__actions,
  &:focus-within &__actions {
    opacity: 1;
  }

  &__action {
    @include flex-center;
    width: 32px;
    height: 32px;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    border-radius: $radius-sm;
    transition:
      background-color $duration-base $ease-out,
      color $duration-base $ease-out;

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    &--danger:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-danger) 12%, transparent);
      color: var(--color-danger);
    }
    &:disabled { opacity: 0.5; }
  }
}

// --- edit form ---
.edit {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  width: 100%;

  &__title {
    height: 40px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface-alt);
    color: var(--color-text);
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    outline: none;

    &:focus { border-color: var(--color-accent); }
  }

  &__textarea {
    padding: $space-2 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface-alt);
    color: var(--color-text);
    font-size: $font-size-sm;
    line-height: $line-height-normal;
    resize: vertical;
    outline: none;

    &:focus { border-color: var(--color-accent); }
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-2;

    @include from-tablet {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__input {
    height: 36px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface-alt);
    color: var(--color-text);
    font-size: $font-size-sm;
    outline: none;
    &:focus { border-color: var(--color-accent); }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-2;
  }

  &__btn {
    height: 36px;
    padding: 0 $space-4;
    border: 0;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    transition: background-color $duration-base $ease-out;

    &--ghost {
      background: transparent;
      color: var(--color-text-muted);
      &:hover:not(:disabled) {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
    }
    &--primary {
      background: var(--color-accent);
      color: var(--color-text-on-accent);
      &:hover:not(:disabled) { background: var(--color-accent-hover); }
    }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
}
</style>
