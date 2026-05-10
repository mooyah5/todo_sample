<script setup lang="ts">
interface Props {
  text: string
  query?: string
}
const props = withDefaults(defineProps<Props>(), { query: '' })

interface Part {
  text: string
  match: boolean
}

const parts = computed<Part[]>(() => {
  const q = props.query.trim()
  if (!q || !props.text) return [{ text: props.text, match: false }]

  const lowerText = props.text.toLowerCase()
  const lowerQ = q.toLowerCase()
  const result: Part[] = []
  let i = 0
  while (i <= lowerText.length) {
    const idx = lowerText.indexOf(lowerQ, i)
    if (idx === -1) {
      if (i < props.text.length) result.push({ text: props.text.slice(i), match: false })
      break
    }
    if (idx > i) result.push({ text: props.text.slice(i, idx), match: false })
    result.push({ text: props.text.slice(idx, idx + q.length), match: true })
    i = idx + q.length
  }
  return result
})
</script>

<template>
  <span class="hl"><template
    v-for="(part, i) in parts"
    :key="i"
  ><mark
    v-if="part.match"
    class="hl__mark"
  >{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
</template>

<style lang="scss" scoped>
.hl {
  &__mark {
    background: color-mix(in srgb, var(--color-warning) 30%, transparent);
    color: inherit;
    padding: 0 1px;
    border-radius: 2px;
  }
}
</style>
