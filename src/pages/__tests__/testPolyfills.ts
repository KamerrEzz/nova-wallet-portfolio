/// <reference types="node" />
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'

/**
 * jsdom lacks several web globals that msw/node and the mock JWT utils need.
 * Imported for side effects BEFORE any msw module in test files.
 */
const globals = {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  TransformStream,
  WritableStream,
} as const

for (const [key, value] of Object.entries(globals)) {
  if (typeof (globalThis as Record<string, unknown>)[key] === 'undefined') {
    Object.assign(globalThis, { [key]: value })
  }
}

/**
 * The whatwg-fetch polyfill keeps relative URLs as-is, but MSW's handler
 * matching needs an absolute URL. Absolutize same-origin paths when a
 * `Request` is constructed (RTK Query wraps every call in one).
 */
const OriginalRequest = globalThis.Request

class AbsoluteRequest extends OriginalRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith('/')) {
      input = `http://localhost${input}`
    }
    super(input, init)
  }
}

globalThis.Request = AbsoluteRequest

/**
 * The whatwg-fetch `Response` stores the body internally (`_bodyInit`) and
 * has no public `body` getter, but @mswjs/interceptors reads
 * `response.body` to forward mocked responses. Bridge the two so mocked
 * response bodies survive.
 */
const responsePrototype = globalThis.Response.prototype as Response & {
  _bodyInit?: BodyInit | null
}
if (!('body' in responsePrototype)) {
  Object.defineProperty(responsePrototype, 'body', {
    get(this: { _bodyInit?: BodyInit | null }) {
      return this._bodyInit ?? null
    },
    configurable: true,
  })
}
