import { PHONE_RE } from '../features/quote/phone'

describe('PHONE_RE', () => {
  it.each([
    '+54 9 11 0000-0000', // the form's own placeholder (13 digits, 18 characters)
    '261 555-0000',
    '2615550142',
    '+5492615550142',
  ])('accepts %s', (phone) => {
    expect(PHONE_RE.test(phone)).toBe(true)
  })

  it.each([
    '1234567',              // 7 digits
    '+54 9 11 0000-0000-123', // 16 digits
    '261-ABC-0000',
    '++54 261 555 0000',
    '',
  ])('rejects %s', (phone) => {
    expect(PHONE_RE.test(phone)).toBe(false)
  })
})
