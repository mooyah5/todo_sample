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
    <span class="lang-toggle__code">{{ locale.toUpperCase() }}</span>
  </button>
</template>

<style lang="scss" scoped>
.lang-toggle {
  @include flex-center;
  height: 40px;
  padding: 0 $space-3;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
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

  &__code {
    font-family: $font-family-mono;
  }
}
</style>
