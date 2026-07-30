import { google, calendar_v3 } from 'googleapis'

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: 'v3', auth })
}

export async function listCalendars(accessToken: string): Promise<calendar_v3.Schema$CalendarListEntry[] | undefined> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.calendarList.list()
  return res.data.items
}

export async function listEvents(
  accessToken: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string
): Promise<calendar_v3.Schema$Event[] | undefined> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  })
  return res.data.items
}

export async function getEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<calendar_v3.Schema$Event> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.get({
    calendarId,
    eventId,
  })
  return res.data
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  eventData: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.insert({
    calendarId,
    requestBody: eventData,
    supportsAttachments: true,
  })
  return res.data
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  patch: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: patch,
    supportsAttachments: true,
  })
  return res.data
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const calendar = getCalendarClient(accessToken)
  await calendar.events.delete({
    calendarId,
    eventId,
  })
}

export async function searchEvents(
  accessToken: string,
  calendarId: string,
  query: string,
  timeMin?: string,
  timeMax?: string
): Promise<calendar_v3.Schema$Event[] | undefined> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.events.list({
    calendarId,
    q: query,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  })
  return res.data.items
}

export async function getFreeBusy(
  accessToken: string,
  calendars: string[],
  timeMin: string,
  timeMax: string
): Promise<calendar_v3.Schema$FreeBusyResponse> {
  const calendar = getCalendarClient(accessToken)
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: calendars.map(id => ({ id })),
    },
  })
  return res.data
}
