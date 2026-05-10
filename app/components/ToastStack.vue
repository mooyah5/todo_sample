<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toasts" role="region" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="ul" class="toasts__list">
        <li
          v-for="toast in toasts"
          :key="toast.id"
          class="toasts__item"
          :class="`toasts__item--${toast.kind}`"
          role="status"
        >
          <span class="toasts__icon" aria-hidden="true">
            <svg
              v-if="toast.kind === 'success'"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="5 12 10 17 19 7" />
            </svg>
            <svg
              v-else-if="toast.kind === 'error'"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          <span class="toasts__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toasts__dismiss"
            aria-label="dismiss"
            @click="dismiss(toast.id)"
          >×</button>
        </li>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.toasts {
  position: fixed;
  top: $space-4;
  right: $space-4;
  z-index: $z-toast;
  pointer-events: none;
  max-width: calc(100vw - #{$space-7});

  @include from-tablet {
    top: $space-5;
    right: $space-5;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $space-2;
    align-items: flex-end;
  }

  &__item {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: $space-2;
    min-width: 240px;
    max-width: 360px;
    padding: $space-3 $space-4;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    box-shadow: var(--shadow-lg);
    color: var(--color-text);
    font-size: $font-size-sm;
    line-height: $line-height-normal;

    &--success { border-left: 3px solid var(--color-success); }
    &--error   { border-left: 3px solid var(--color-danger); }
    &--info    { border-left: 3px solid var(--color-info); }
  }

  &__icon {
    flex-shrink: 0;
    margin-top: 1px;

    .toasts__item--success & { color: var(--color-success); }
    .toasts__item--error & { color: var(--color-danger); }
    .toasts__item--info & { color: var(--color-info); }
  }

  &__message {
    flex: 1;
    word-break: keep-all;
  }

  &__dismiss {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    background: transparent;
    border: 0;
    color: var(--color-text-subtle);
    font-size: 16px;
    line-height: 1;
    border-radius: 50%;
    transition: background-color $duration-fast $ease-out, color $duration-fast $ease-out;

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform $duration-base $ease-out,
    opacity $duration-base $ease-out;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-move {
  transition: transform $duration-base $ease-out;
}
</style>
