<script setup lang="ts">
const { t } = useI18n()
const { isMobile, isTablet } = useDeviceLayout()

const deviceLabel = computed(() => {
  if (isMobile) return t('header.device.mobile')
  if (isTablet) return t('header.device.tablet')
  return t('header.device.desktop')
})
</script>

<template>
  <header class="header">
    <div class="header__brand">
      <h1 class="header__title">{{ t('app.title') }}</h1>
      <p class="header__subtitle">{{ t('app.subtitle') }}</p>
    </div>
    <div class="header__controls">
      <span class="header__device" aria-hidden="true">{{ deviceLabel }}</span>
      <LangToggle />
      <ThemeToggle />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: $space-4;
  padding-block: $space-5 $space-5;

  @include from-tablet {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding-block: $space-7 $space-6;
  }

  &__title {
    margin: 0;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  &__subtitle {
    margin: $space-1 0 0;
    color: var(--color-text-muted);
    font-size: $font-size-sm;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__device {
    font-size: $font-size-xs;
    color: var(--color-text-subtle);
    padding: $space-1 $space-3;
    border-radius: $radius-pill;
    background: var(--color-surface-alt);
    letter-spacing: 0.02em;
  }
}
</style>
