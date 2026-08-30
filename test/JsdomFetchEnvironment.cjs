/**
 * jest-environment-jsdom + Node-native fetch globals.
 *
 * jsdom (jest 29) does not provide fetch/Request/Response/Headers or the Web
 * streams/BroadcastChannel APIs, and the `whatwg-fetch` polyfill is not
 * stream-capable, which breaks MSW v2 (response bodies arrive empty).
 * A Jest environment runs in the worker's outer realm, where Node 18+
 * exposes these natively, so we can inject them into the jsdom sandbox —
 * the same approach as the `jest-fixed-jsdom` package.
 *
 * AbortController/AbortSignal are intentionally NOT overridden: DOM code
 * (e.g. framer-motion) needs jsdom's classes. Instead, `Request` is wrapped
 * so a jsdom-realm `signal` is translated into a Node-realm one — undici
 * does cross-realm instanceof checks on RequestInit.signal.
 */
const JsdomEnvironment = require('jest-environment-jsdom').default

const NativeRequest = Request

/** Request that accepts an AbortSignal from any realm and relative URLs. */
class CrossRealmRequest extends NativeRequest {
  /** Set by the environment to the jsdom origin (e.g. "http://localhost"). */
  static origin = 'http://localhost'

  constructor(input, init) {
    if (typeof input === 'string' && input.startsWith('/')) {
      input = `${CrossRealmRequest.origin}${input}`
    }
    if (init?.signal && !(init.signal instanceof AbortSignal)) {
      const jsdomSignal = init.signal
      const controller = new AbortController()
      if (jsdomSignal.aborted) {
        controller.abort()
      } else {
        jsdomSignal.addEventListener('abort', () => controller.abort(), { once: true })
      }
      init = { ...init, signal: controller.signal }
    }
    super(input, init)
  }
}

class JsdomFetchEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup()

    const globals = {
      fetch,
      Headers,
      Request: CrossRealmRequest,
      Response,
      FormData,
      TextEncoder,
      TextDecoder,
      ReadableStream,
      WritableStream,
      TransformStream,
      BroadcastChannel,
    }

    if (typeof Blob !== 'undefined') globals.Blob = Blob
    if (typeof File !== 'undefined') globals.File = File

    if (typeof this.global.location?.origin === 'string') {
      CrossRealmRequest.origin = this.global.location.origin
    }

    for (const [key, value] of Object.entries(globals)) {
      // Always override: undici's fetch does cross-realm instanceof checks on
      // Request/Response/Headers, so the sandbox must share Node's classes.
      if (typeof value !== 'undefined') {
        this.global[key] = value
      }
    }
  }
}

module.exports = JsdomFetchEnvironment
