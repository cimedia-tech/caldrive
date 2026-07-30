import { format, formatDistanceToNow, isSameDay as isSameDayFns, isToday as isTodayFns, startOfWeek, addDays, endOfMonth } from 'date-fns'

export function formatEventTime(start: string | Date, end: string | Date): string {
  const startTime = format(new Date(start), 'h:mm a')
  const endTime = format(new Date(end), 'h:mm a')
  return `${startTime} - ${endTime}`
}

export function formatDate(date: string | Date, formatStr: string = 'MMMM d, yyyy'): string {
  return format(new Date(date), formatStr)
}

export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function getMonthDates(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = endOfMonth(firstDay)
  
  const startDate = startOfWeek(firstDay, { weekStartsOn: 0 })
  const endDate = addDays(startOfWeek(lastDay, { weekStartsOn: 0 }), 6)
  
  const dates: Date[][] = []
  let current = startDate
  let week: Date[] = []
  
  while (current <= endDate) {
    week.push(current)
    if (week.length === 7) {
      dates.push(week)
      week = []
    }
    current = addDays(current, 1)
  }
  
  return dates
}

export function isToday(date: Date): boolean {
  return isTodayFns(date)
}

export function isSameDay(a: Date, b: Date): boolean {
  return isSameDayFns(a, b)
}

export function getRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function toISOString(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z'
}
