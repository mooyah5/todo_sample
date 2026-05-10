<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <header class="header">
    <h1 class="header__title">{{ t('app.title') }}</h1>
    <div class="header__controls">
      <LangToggle />
      <ThemeToggle />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding-block: $space-6 $space-7;

  &__title {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $space-1;
  }
}
</style>
