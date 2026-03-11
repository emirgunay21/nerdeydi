export function parseDate(dateString) {
  if (!dateString) return null
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export function formatDate(dateString) {
  const parsed = parseDate(dateString)
  if (!parsed) return dateString

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export function isUpcoming(dateString) {
  const parsed = parseDate(dateString)
  if (!parsed) return false

  const now = new Date()
  const diff = parsed.getTime() - now.getTime()
  const threeDays = 3 * 24 * 60 * 60 * 1000

  return diff > 0 && diff <= threeDays
}

export function isOverdue(dateString) {
  const parsed = parseDate(dateString)
  if (!parsed) return false
  return parsed.getTime() < Date.now()
}