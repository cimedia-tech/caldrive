import { format, formatDistanceToNow, isSameDay as isSameDayFns, isToday as isTodayFns, startOfWeek, addDays, endOfMonth } from 'date-fns'

export function formatEventTime(start: string | Date, end: string | Date): string {
  const startTime = format(new Date(start), 'h:mm a')
  const endTime = format(new Date(end), 'h:mm a')
  return `${startTime} - ${endTime}`
}

export function formatDate(date: string | Date, formatStr: string = 'MMMM d, yyyy'): string {
  return format(new Date(date), formatStr)
}

export type WeekStartsOn = 0 | 1 // 0 = Sunday, 1 = Monday

export function getWeekDates(date: Date, weekStartsOn: WeekStartsOn = 1): Date[] {
  const start = startOfWeek(date, { weekStartsOn })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/**
 * Day-of-week header labels that match the grid produced by
 * getMonthDates/getWeekDates for the same weekStartsOn value.
 * Deriving headers and dates from the same source prevents the
 * off-by-one column shift that occurs when headers are hardcoded.
 */
export function getDayHeaders(weekStartsOn: WeekStartsOn = 1): string[] {
  const sundayFirst = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return weekStartsOn === 0 ? sundayFirst : [...sundayFirst.slice(1), sundayFirst[0]]
}

export function getMonthDates(year: number, month: number, weekStartsOn: WeekStartsOn = 1): Date[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = endOfMonth(firstDay)
  
  const startDate = startOfWeek(firstDay, { weekStartsOn })
  const endDate = addDays(startOfWeek(lastDay, { weekStartsOn }), 6)
  
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
