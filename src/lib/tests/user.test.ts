import { USER } from '../sdk.ts'
import './test_helper.ts'
import { deleteSession } from './test_helper.ts'

test('User features', async () => {
  // Generate random string for email & username
  const randStr = Math.random().toString(36).substring(7)
  const email = `${randStr}@gmail.com`

  // Register
  // > Registration should fail when missing fields
  await expect(USER.register('', email, 'test1231')).rejects.toThrow()
  await expect(USER.register(randStr, '', 'test1231')).rejects.toThrow()
  await expect(USER.register(randStr, email, '')).rejects.toThrow()
  // > Invalid email format
  await expect(USER.register(randStr, 'invalidemail', 'test1231')).rejects.toThrow()
  // > Registration should succeed when all fields are filled
  await expect(USER.register(randStr, email, 'test1231')).resolves.not.toThrow()
  // > Registration should fail when the email is already taken
  await expect(USER.register(randStr, email, 'test1231')).rejects.toThrow()

  // Login
  // > Logging in with a wrong password should throw an error
  await expect(USER.login(email, 'wrongpassword')).rejects.toThrow()
  // > Logging in with the correct password should succeed
  await expect(USER.login(email, 'test1231')).resolves.not.toThrow()
  // > Logging in with uppercase email should succeed
  await expect(USER.login(email.toUpperCase(), 'test1231')).resolves.not.toThrow()

  // Test get user self
  const user = await USER.get()
  expect(user.email).toBe(email)
  expect(user.name).toBe(randStr)
  expect(window.location.assign).toHaveBeenCalledWith('/home')

  // Test updating user
  const newName = 'New Name'
  expect((await USER.update({ name: newName })).name).toBe(newName)

  const newEmail = 'a' + email
  expect((await USER.update({ email: newEmail })).email).toBe(newEmail)

  await USER.update({ password: 'password123' })
  await USER.login(newEmail, 'password123')

  // Test logout
  await USER.logout()
  expect(localStorage.getItem('token')).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith('/')

  // getUserSelf and updateUser should throw an error after logout
  await expect(USER.get()).rejects.toThrow()
  await expect(USER.update({ name: 'a' })).rejects.toThrow()

  await deleteSession()
})