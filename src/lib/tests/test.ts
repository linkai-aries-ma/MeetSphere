import { EX_CALENDARS } from '../examples.ts'
import {
  addContact,
  deleteContact,
  getCalendar,
  getContacts,
  getUserSelf,
  login,
  logout,
  register,
  updateUser,
  uploadUserPfp
} from '../sdk.ts'
import 'whatwg-fetch'

const PASSWORD = 'password123'

// Mock window.location.assign
// window.location.assign = jest.fn()
Object.defineProperty(window, 'location', {
  value: {
    assign: jest.fn(),
  },
})


async function createSession() {
  const randStr = Math.random().toString(36).substring(7)
  const email = `${randStr}@gmail.com`
  await register(randStr, email, PASSWORD)
  await login(email, PASSWORD)
}


test('User features', async () => {
  // Generate random string for email & username
  const randStr = Math.random().toString(36).substring(7)
  const email = `${randStr}@gmail.com`

  // Register
  // > Registration should fail when missing fields
  await expect(register('', email, 'test1231')).rejects.toThrow()
  await expect(register(randStr, '', 'test1231')).rejects.toThrow()
  await expect(register(randStr, email, '')).rejects.toThrow()
  // > Invalid email format
  await expect(register(randStr, 'invalidemail', 'test1231')).rejects.toThrow()
  // > Registration should succeed when all fields are filled
  await expect(register(randStr, email, 'test1231')).resolves.not.toThrow()
  // > Registration should fail when the email is already taken
  await expect(register(randStr, email, 'test1231')).rejects.toThrow()

  // Login
  // > Logging in with a wrong password should throw an error
  await expect(login(email, 'wrongpassword')).rejects.toThrow()
  // > Logging in with the correct password should succeed
  await expect(login(email, 'test1231')).resolves.not.toThrow()
  // > Logging in with uppercase email should succeed
  await expect(login(email.toUpperCase(), 'test1231')).resolves.not.toThrow()

  // Test get user self
  const user = await getUserSelf()
  expect(user.email).toBe(email)
  expect(user.name).toBe(randStr)
  expect(window.location.assign).toHaveBeenCalledWith('/home')

  // Test updating user
  const newName = 'New Name'
  expect((await updateUser({ name: newName })).name).toBe(newName)

  const newEmail = 'a' + email
  expect((await updateUser({ email: newEmail })).email).toBe(newEmail)

  await updateUser({ password: PASSWORD })
  await login(newEmail, PASSWORD)

  // Test uploading a profile picture
  const file = new File([''], 'public/assets/azalea.jpg', { type: 'image/jpeg' })
  await uploadUserPfp(file)

  expect((await getUserSelf()).profile_image).toBeTruthy()

  // Test logout
  await logout()
  expect(localStorage.getItem('token')).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith('/')

  // getUserSelf and updateUser should throw an error after logout
  await expect(getUserSelf()).rejects.toThrow()
  await expect(updateUser({ name: 'a' })).rejects.toThrow()
})


test('Contact features', async () => {
  await createSession()
  const testEmail = 'test@gmail.com'

  // Test get contacts
  const contacts = await getContacts()
  expect(contacts.length).toBe(0)

  // Invalid input should fail
  await expect(addContact({ name: '', email: testEmail })).rejects.toThrow()
  await expect(addContact({ name: 'Test', email: '' })).rejects.toThrow()
  await expect(addContact({ name: 'Test', email: 'invalidEmail' })).rejects.toThrow()

  // Test adding contact
  await expect(addContact({ name: 'Test', email: testEmail })).resolves.not.toThrow()

  const newContacts = await getContacts()
  expect(newContacts.length).toBe(1)
  expect(newContacts[0].email).toBe(testEmail)
  expect(newContacts[0].name).toBe('Test')

  // Test adding a second contact
  const secondTestEmail = 'test2@mail.com'
  await expect(addContact({ name: 'Test2', email: secondTestEmail })).resolves.not.toThrow()

  const newContacts2 = await getContacts()
  expect(newContacts2.length).toBe(2)
  expect(newContacts2.find(c => c.email === secondTestEmail)).toBeTruthy()

  // Test adding the same contact
  await expect(addContact({ name: 'Test', email: testEmail })).rejects.toThrow()
  await expect(addContact({ name: 'Test', email: testEmail.toUpperCase() })).rejects.toThrow()

  // Delete the contacts
  await expect(deleteContact(newContacts[0].pk)).resolves.not.toThrow()
})

test('Calendar features', async () => {
  // Test get calendars
  await createSession()
  
  const calendars = EX_CALENDARS
  console.log(calendars[1])

  //Add calendar
  //const a = await expect(addCalendar(calendars[1]))
  //console.log(a)
  //await expect(addCalendar(calendars[0])).rejects.toThrow()
  //expect(() => addCalendar(calendars[0])).not.toThrow()

  const calendars1 = await getCalendar()
  //expect(calendars1.length).toBe(2)
  console.log(calendars1)
})