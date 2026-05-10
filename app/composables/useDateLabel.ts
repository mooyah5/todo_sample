// =============================================================================
// useDateLabel — 마감일을 사용자 친화적 라벨로 ('오늘', '내일', '지났음', 또는 포맷된 날짜)
// 로케일은 i18n 의 현재 locale 을 따라감
// =============================================================================

interface DateLabelResult {
  text: string
  isOverdue: boolean
  isToday: boolean
  isTomorrow: boolean
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function useDateLabel() {
  const { t, locale } = useI18n()

  function format(dueDate: string | null): DateLabelResult | null {
    if (!dueDate) return null

    const due = startOfDay(new Date(dueDate))
    if (Number.isNaN(due.getTime())) return null

    const today = startOfDay(new Date())
    const tomorrow = startOfDay(new Date(today.getTime() + 24 * 60 * 60 * 1000))

    const isToday = due.getTime() === today.getTime()
    const isTomorrow = due.getTime() === tomorrow.getTime()
    const isOverdue = due.getTime() < today.getTime()

    let text: string
    if (isToday) text = t('item.today')
    else if (isTomorrow) text = t('item.tomorrow')
    else {
      const formatted = new Intl.DateTimeFormat(locale.value, {
        month: 'short',
        day: 'numeric',
      }).format(due)
      text = t('item.due', { date: formatted })
    }

    return { text, isOverdue, isToday, isTomorrow }
  }

  return { format }
}
