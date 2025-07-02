import { http, HttpResponse } from 'msw'
import { mockAPIResponses, mockHTMLResponses, mockStorageData } from './data'

// Base URL for the KMA schedule API
const BASE_URL = 'https://actvn-schedule.cors-ngosangns.workers.dev'

export const handlers = [
  // Login endpoint - GET (to get form data)
  http.get(`${BASE_URL}/login`, () => {
    return HttpResponse.text(mockHTMLResponses.loginPage)
  }),

  // Login endpoint - POST (to authenticate)
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const formData = await request.formData()
    const username = formData.get('txtUserName') as string
    const password = formData.get('txtPassword') as string

    // Simulate authentication logic
    if (username === 'student001' && password) {
      return HttpResponse.text(mockStorageData.signInToken)
    } else {
      return HttpResponse.text('Authentication failed', { status: 401 })
    }
  }),

  // Subject/Calendar endpoint
  http.post(`${BASE_URL}/subject`, async ({ request }) => {
    const headers = request.headers
    const cookie = headers.get('x-cors-headers')
    
    if (!cookie || !cookie.includes('SignIn=')) {
      return HttpResponse.text('Unauthorized', { status: 401 })
    }

    return HttpResponse.text(mockHTMLResponses.calendarPage)
  }),

  // Mock other external APIs if needed
  http.get('https://api.example.com/semesters', () => {
    return HttpResponse.json(mockAPIResponses.semestersSuccess)
  }),

  // Mock Google Calendar export
  http.post('https://calendar.google.com/calendar/render', () => {
    return HttpResponse.text('Calendar exported successfully')
  }),

  // Catch-all handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { error: `Unhandled ${request.method} request to ${request.url}` },
      { status: 404 }
    )
  }),
]

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Network error
  http.get(`${BASE_URL}/login`, () => {
    return HttpResponse.error()
  }),

  // Server error
  http.post(`${BASE_URL}/login`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Timeout simulation
  http.post(`${BASE_URL}/subject`, async () => {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return HttpResponse.json(mockAPIResponses.calendarSuccess)
  }),
]

// Success handlers for testing success scenarios
export const successHandlers = [
  http.get(`${BASE_URL}/login`, () => {
    return HttpResponse.text(mockHTMLResponses.loginPage)
  }),

  http.post(`${BASE_URL}/login`, () => {
    return HttpResponse.text(mockStorageData.signInToken)
  }),

  http.post(`${BASE_URL}/subject`, () => {
    return HttpResponse.text(mockHTMLResponses.calendarPage)
  }),
]
