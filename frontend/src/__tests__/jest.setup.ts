// jsdom's test environment does not expose Node's TextEncoder/TextDecoder globals,
// which react-router-dom (via its dependency chain) requires at import time.
import { TextEncoder, TextDecoder } from 'node:util'

if (typeof globalThis.TextEncoder === 'undefined') {
  // @ts-expect-error -- Node's TextDecoder type is close enough for jsdom's needs
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error -- Node's TextDecoder type is close enough for jsdom's needs
  globalThis.TextDecoder = TextDecoder
}
