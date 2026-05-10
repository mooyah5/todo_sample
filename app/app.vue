<script setup lang="ts">
const { theme } = useTheme()
const { locale, t } = useI18n()

useHead({
  htmlAttrs: {
    'data-theme': theme,
    lang: locale,
  },
  titleTemplate: (chunk) => (chunk ? `${chunk} · ${t('app.title')}` : t('app.title')),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
  <ToastStack />
</template>
