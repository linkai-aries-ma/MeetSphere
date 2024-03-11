import { CONTACT, USER, CALENDAR } from '../sdk.ts'
import { createSession, deleteSession } from './test_helper.ts'


test('Contact features', async () => {
  await createSession()
  const testEmail = 'test@gmail.com'

  // Test get contacts
  const contacts = await CONTACT.list()
  expect(contacts.length).toBe(0)

  // Invalid input should fail
  await expect(CONTACT.add({ name: '', email: testEmail })).rejects.toThrow()
  await expect(CONTACT.add({ name: 'Test', email: '' })).rejects.toThrow()
  await expect(CONTACT.add({ name: 'Test', email: 'invalidEmail' })).rejects.toThrow()

  // Test adding contact
  await expect(CONTACT.add({ name: 'Test', email: testEmail })).resolves.not.toThrow()

  const newContacts = await CONTACT.list()
  expect(newContacts.length).toBe(1)
  expect(newContacts[0].email).toBe(testEmail)
  expect(newContacts[0].name).toBe('Test')

  // Test adding a second contact
  const secondTestEmail = 'test2@mail.com'
  await expect(CONTACT.add({ name: 'Test2', email: secondTestEmail })).resolves.not.toThrow()

  const newContacts2 = await CONTACT.list()
  expect(newContacts2.length).toBe(2)
  expect(newContacts2.find(c => c.email === secondTestEmail)).toBeTruthy()

  // Test adding the same contact
  await expect(CONTACT.add({ name: 'Test', email: testEmail })).rejects.toThrow()
  await expect(CONTACT.add({ name: 'Test', email: testEmail.toUpperCase() })).rejects.toThrow()

  // Delete the contacts
  expect(newContacts[0].id).toBeTruthy()
  await expect(CONTACT.delete(newContacts[0].id)).resolves.not.toThrow()

  const newContacts3 = await CONTACT.list()
  expect(newContacts3.length).toBe(1)
  expect(newContacts3[0].email).toBe(secondTestEmail)

  // Edit a contact
  const newName = 'New Name'
  const contact = newContacts3[0]
  contact.name = newName
  await expect(CONTACT.update(contact)).resolves.not.toThrow()

  const newContacts4 = await CONTACT.list()
  expect(newContacts4[0].name).toBe(newName)

  await deleteSession()
})
