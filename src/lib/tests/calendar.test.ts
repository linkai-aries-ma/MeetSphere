import { createSession, deleteSession } from './test_helper.ts'
import { EX_CALENDARS } from '../examples.ts'

test('Calendar features', async () => {
  await createSession()

  // Getting

  // Test get calendars
  const calendars = EX_CALENDARS
  console.log(calendars[1])

  //Add calendar
  //const a = await expect(addCalendar(calendars[1]))
  //console.log(a)
  //await expect(addCalendar(calendars[0])).rejects.toThrow()
  //expect(() => addCalendar(calendars[0])).not.toThrow()

  // const calendars1 = await getCalendar()
  //expect(calendars1.length).toBe(2)
  // console.log(calendars1)

  await deleteSession()
})