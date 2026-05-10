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
          width="10"
          height="10"
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
          <PriorityBadge :priority="todo.priority" />
          <span class="item__title">{{ todo.title }}</span>
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
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
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
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
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
        class="edit__field"
        :placeholder="t('form.fields.descriptionPlaceholder')"
        :disabled="isBusy"
      />
      <div class="edit__row">
        <input
          v-model="edit.category"
          type="text"
          class="edit__field"
          :placeholder="t('form.fields.categoryPlaceholder')"
          :disabled="isBusy"
        >
        <select
          v-model="edit.priority"
          class="edit__field"
          :disabled="isBusy"
        >
          <option v-for="p in PRIORITIES" :key="p" :value="p">
            {{ t(`priority.${p}`) }}
          </option>
        </select>
        <input
          v-model="edit.dueDate"
          type="date"
          class="edit__field"
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
  padding: $space-3 $space-2;
  border-bottom: 1px solid var(--color-border);
  transition: background-color $duration-fast $ease-out;

  &:hover {
    background: var(--color-surface-alt);
  }
  &:hover &__actions {
    opacity: 1;
  }

  &--done &__title {
    color: var(--color-text-subtle);
    text-decoration: line-through;
    text-decoration-color: var(--color-text-subtle);
  }
  &--done &__description {
    opacity: 0.5;
  }

  &--editing {
    flex-direction: column;
    align-items: stretch;
    background: var(--color-surface-alt);
  }

  // --- check ---
  &__check {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-top: 3px;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-on-accent);
    @include flex-center;
    transition: all $duration-base $ease-out;

    &:hover { border-color: var(--color-text); }
    &--done {
      background: var(--color-text);
      border-color: var(--color-text);
    }
  }

  // --- body ---
  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: $space-2;
    min-width: 0;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text);
    line-height: $line-height-normal;
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
    color: var(--color-text-subtle);
    margin-top: $space-1;
  }

  &__category {
    color: var(--color-text-muted);

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      margin-right: 6px;
      border-radius: 50%;
      background: var(--color-text-subtle);
      vertical-align: middle;
    }
  }

  &__tag {
    color: var(--color-text-subtle);
  }

  &__due {
    margin-left: auto;
    font-variant-numeric: tabular-nums;

    &--today { color: var(--color-info); }
    &--overdue { color: var(--color-danger); }
  }

  // --- actions ---
  &__actions {
    display: flex;
    gap: 0;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity $duration-fast $ease-out;
  }
  &:focus-within &__actions { opacity: 1; }

  &__action {
    @include flex-center;
    width: 28px;
    height: 28px;
    border: 0;
    background: transparent;
    color: var(--color-text-subtle);
    border-radius: $radius-sm;
    transition: background-color $duration-base $ease-out, color $duration-base $ease-out;

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    &--danger:hover:not(:disabled) {
      color: var(--color-danger);
    }
    &:disabled { opacity: 0.4; }
  }
}

// --- edit form ---
.edit {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  width: 100%;

  &__title {
    height: 36px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-sm;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    outline: none;
    &:focus { border-color: var(--color-border-strong); }
  }

  &__field {
    height: 32px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-sm;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-sm;
    outline: none;

    &:focus { border-color: var(--color-border-strong); }
  }
  textarea.edit__field {
    height: auto;
    padding: $space-2 $space-3;
    resize: vertical;
    line-height: $line-height-normal;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-2;

    @include from-tablet {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-2;
    margin-top: $space-1;
  }

  &__btn {
    height: 32px;
    padding: 0 $space-3;
    border: 0;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
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
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
