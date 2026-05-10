<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()

interface LocaleOption {
  code: string
  name: string
}

const options = computed<LocaleOption[]>(() =>
  (locales.value as LocaleOption[]).map(({ code, name }) => ({ code, name })),
)

async function handleSwitch() {
  const codes = options.value.map((o) => o.code)
  const idx = codes.indexOf(locale.value)
  const next = codes[(idx + 1) % codes.length]
  if (next) await setLocale(next)
}
</script>

<template>
  <button
    type="button"
    class="lang-toggle"
    :title="t('header.language')"
    :aria-label="t('header.language')"
    @click="handleSwitch"
  >
    {{ locale.toUpperCase() }}
  </button>
</template>

<style lang="scss" scoped>
.lang-toggle {
  @include flex-center;
  height: 32px;
  padding: 0 $space-3;
  border: 0;
  border-radius: $radius-sm;
  background: transparent;
  color: var(--color-text-muted);
  font-family: $font-family-mono;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  letter-spacing: 0.04em;
  transition: background-color $duration-base $ease-out, color $duration-base $ease-out;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
}
</style>
