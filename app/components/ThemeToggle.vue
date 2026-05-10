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
    :class="{ 'theme-toggle--dark': theme === 'dark' }"
    :title="label"
    :aria-label="label"
    @click="toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <svg
        v-if="theme === 'light'"
        key="moon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
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
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
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
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-surface);
  color: var(--color-text);
  transition:
    background-color $duration-base $ease-out,
    border-color $duration-base $ease-out,
    transform $duration-fast $ease-out;

  &:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-border-strong);
  }
  &:active {
    transform: scale(0.96);
  }
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity $duration-base $ease-out,
    transform $duration-base $ease-out;
}
.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-30deg) scale(0.8);
}
.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(30deg) scale(0.8);
}
</style>
