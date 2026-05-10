<script setup lang="ts">
const { t } = useI18n()
const { theme, toggle } = useTheme()

const label = computed(() =>
  theme.value === 'light' ? t('header.themeToDark') : t('header.themeToLight'),
)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :title="label"
    :aria-label="label"
    @click="toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <svg
        v-if="theme === 'light'"
        key="moon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        v-else
        key="sun"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </Transition>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  @include flex-center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: $radius-sm;
  background: transparent;
  color: var(--color-text-muted);
  transition: background-color $duration-base $ease-out, color $duration-base $ease-out;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity $duration-fast $ease-out,
    transform $duration-fast $ease-out;
}
.theme-icon-enter-from { opacity: 0; transform: rotate(-30deg); }
.theme-icon-leave-to   { opacity: 0; transform: rotate(30deg); }
</style>
