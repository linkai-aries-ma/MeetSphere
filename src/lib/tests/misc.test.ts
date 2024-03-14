import { CALENDAR, CONTACT, USER } from '../sdk.ts'
import { TEST_CAL } from './calendar.test.ts'
import './test_helper.ts'

test('Unauthorized access', async () => {
  await expect(USER.get()).rejects.toThrow()
  await expect(USER.update({ name: 'a' })).rejects.toThrow()

  await expect(CONTACT.list()).rejects.toThrow()
  await expect(CONTACT.add({ name: 'Test', email: 'test@gmail.com' })).rejects.toThrow()
  await expect(CONTACT.delete(1)).rejects.toThrow()
  await expect(CONTACT.update({ id: 1, name: 'Test', email: 'test@gmail.com' })).rejects.toThrow()

  await expect(CALENDAR.list()).rejects.toThrow()
  await expect(CALENDAR.add(TEST_CAL)).rejects.toThrow()
  await expect(CALENDAR.delete(1)).rejects.toThrow()
})