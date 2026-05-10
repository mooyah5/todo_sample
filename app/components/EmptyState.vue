<script setup lang="ts">
interface Props {
  message: string
}
defineProps<Props>()
</script>

<template>
  <div class="empty">
    <div class="empty__icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="14" y="14" width="36" height="40" rx="4" />
        <path d="M22 26h20M22 34h14M22 42h10" />
        <circle cx="48" cy="14" r="6" fill="currentColor" stroke="none" opacity="0.15" />
      </svg>
    </div>
    <p class="empty__message">{{ message }}</p>
  </div>
</template>

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  padding: $space-7 $space-4;
  text-align: center;

  &__icon {
    color: var(--color-text-subtle);
  }

  &__message {
    margin: 0;
    color: var(--color-text-muted);
    font-size: $font-size-sm;
    line-height: $line-height-normal;
    max-width: 280px;
  }
}
</style>
