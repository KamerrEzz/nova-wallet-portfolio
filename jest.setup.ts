// jsdom (jest 29) does not expose these globals; MSW and the mock JWT layer need them.
import { TextDecoder, TextEncoder } from 'util'

if (typeof globalThis.TextEncoder === 'undefined') {
  Object.assign(globalThis, {
    TextEncoder,
    TextDecoder: TextDecoder as unknown as typeof globalThis.TextDecoder,
  })
}

import '@testing-library/jest-dom'
import 'whatwg-fetch'

// BroadcastChannel is missing under jsdom; MSW references it at import time.
import { BroadcastChannel as NodeBroadcastChannel } from 'worker_threads'
// Web streams are missing under jsdom; MSW references them at import time.
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

if (typeof globalThis.BroadcastChannel === 'undefined') {
  Object.assign(globalThis, {
    BroadcastChannel:
      NodeBroadcastChannel as unknown as typeof globalThis.BroadcastChannel,
  })
}

for (const [key, value] of Object.entries({ ReadableStream, TransformStream, WritableStream })) {
  if (typeof (globalThis as Record<string, unknown>)[key] === 'undefined') {
    Object.assign(globalThis, { [key]: value })
  }
}
