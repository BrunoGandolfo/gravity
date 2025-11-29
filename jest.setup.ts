import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill Streams API
const { ReadableStream, WritableStream, TransformStream } = require('web-streams-polyfill/dist/ponyfill');
Object.assign(global, { ReadableStream, WritableStream, TransformStream });

// Polyfill Request/Response for Node environment (if not present)
if (typeof global.Request === 'undefined') {
    const { Request, Response, Headers, FormData } = require('next/dist/server/web/spec-extension/adapters/request-cookies')
    // Or use whatwg-fetch if next's internal one is hard to reach, but let's try a simpler approach first:
    // Actually, simply mocking them might be enough for some tests, but integration tests need real objects.
    require('whatwg-fetch')
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Polyfill Response.json (static method) for JSDOM/Node environments where it's missing
if (!Response.json) {
    // @ts-ignore - Adding static method to Response
    Response.json = function (data: any, init: ResponseInit = {}) {
        const headers = new Headers(init.headers);
        headers.set('Content-Type', 'application/json');
        return new Response(JSON.stringify(data), {
            ...init,
            headers,
        });
    };
}

// Mock NextResponse for App Router
jest.mock('next/server', () => {
    // We need to use a slightly different approach for mocking next/server
    // because it might be used by the code we are testing.
    return {
        __esModule: true,
        NextResponse: {
            json: (body: any, init?: ResponseInit) => {
                const headers = new Headers(init?.headers);
                headers.set('Content-Type', 'application/json');
                return new Response(JSON.stringify(body), {
                    status: init?.status || 200,
                    statusText: init?.statusText || 'OK',
                    headers,
                });
            },
        },
    };
});

// Mock OpenAI
jest.mock('openai', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{ delta: { content: 'Mocked response' } }],
                        [Symbol.asyncIterator]: async function* () {
                            yield { choices: [{ delta: { content: 'Mocked ' } }] };
                            yield { choices: [{ delta: { content: 'response' } }] };
                        },
                    }),
                },
            },
        })),
    };
});
