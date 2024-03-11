import 'whatwg-fetch'

import { USER } from '../sdk.ts'

const PASSWORD = 'password123'

// Mock window.location.assign
// window.location.assign = jest.fn()
Object.defineProperty(window, 'location', {
  value: {
    assign: jest.fn(),
  },
})


export async function createSession() {
  const randStr = Math.random().toString(36).substring(7)
  const email = `${randStr}@gmail.com`
  await USER.register(randStr, email, PASSWORD)
  await USER.login(email, PASSWORD)
}

export async function deleteSession() {
  await USER.logout()
}