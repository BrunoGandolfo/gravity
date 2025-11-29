// Mock modules BEFORE imports
jest.mock('next/server', () => {
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

// Mock pdf-parse-fork - will be controlled per test
let mockPdfParse = jest.fn();
jest.mock('pdf-parse-fork', () => mockPdfParse);

// Mock mammoth - must match the dynamic import structure
// When code does: const mammoth = await import("mammoth")
// It expects: mammoth.default.extractRawText
const mockExtractRawText = jest.fn();
jest.mock('mammoth', () => ({
    __esModule: true,
    default: {
        extractRawText: mockExtractRawText
    }
}));

// Mock OpenAI
let mockOpenAICreate = jest.fn();
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockOpenAICreate
            }
        }
    }));
});

import { POST as uploadHandler } from '../upload/route';
import { POST as chatHandler } from '../chat/route';

describe('API Integration Tests', () => {
    describe('Upload API', () => {
        it('successfully processes TXT file', async () => {
            const formData = new FormData();
            const file = new File(['Test content'], 'test.txt', { type: 'text/plain' });
            // Mock arrayBuffer for JSDOM
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('Test content')
            });
            formData.append('file', file);

            // Create a custom request that mimics what Next.js expects
            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.text).toBe('Test content');
        });

        it('rejects invalid file type', async () => {
            const formData = new FormData();
            const file = new File(['data'], 'test.exe', { type: 'application/x-msdownload' });
            // Mock arrayBuffer for JSDOM
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('data')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('no soportado');
        });

        it('handles empty file', async () => {
            const formData = new FormData();
            const file = new File([''], 'empty.txt', { type: 'text/plain' });
            // Mock arrayBuffer for JSDOM
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('vacío');
        });

        it('handles request without file', async () => {
            const formData = new FormData();
            // No file attached

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('No se proporcionó ningún archivo');
        });

        it('successfully processes PDF file', async () => {
            // Setup mock BEFORE creating the request
            mockPdfParse.mockResolvedValueOnce({ text: 'Extracted PDF text content' });

            const formData = new FormData();
            const file = new File(['PDF content'], 'test.pdf', { type: 'application/pdf' });
            
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('PDF content')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.text).toBe('Extracted PDF text content');
            expect(mockPdfParse).toHaveBeenCalled();
        });

        it('handles PDF parsing error', async () => {
            // Setup mock to throw error
            mockPdfParse.mockRejectedValueOnce(new Error('PDF parsing failed'));

            const formData = new FormData();
            const file = new File(['corrupted'], 'corrupted.pdf', { type: 'application/pdf' });
            
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('corrupted')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Error al leer PDF');
        });

        it('successfully processes DOCX file', async () => {
            // Setup mock BEFORE creating the request
            mockExtractRawText.mockResolvedValueOnce({ 
                value: 'Extracted DOCX text content' 
            });

            const formData = new FormData();
            const file = new File(['DOCX content'], 'test.docx', { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('DOCX content')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.text).toBe('Extracted DOCX text content');
            expect(mockExtractRawText).toHaveBeenCalledWith({ buffer: expect.any(Buffer) });
        });

        it('handles DOCX parsing error', async () => {
            // Setup mock to throw error
            mockExtractRawText.mockRejectedValueOnce(new Error('DOCX parsing failed'));

            const formData = new FormData();
            const file = new File(['corrupted'], 'corrupted.docx', { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('corrupted')
            });
            formData.append('file', file);

            const request = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const response = await uploadHandler(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Error al leer DOCX');
        });
    });

    describe('Chat API', () => {
        beforeEach(() => {
            // Mock OpenAI API with async generator for streaming
            process.env.OPENAI_API_KEY = 'test-key';
            
            // Default mock: successful streaming response
            mockOpenAICreate.mockResolvedValue({
                [Symbol.asyncIterator]: async function* () {
                    yield { choices: [{ delta: { content: 'AI ' } }] };
                    yield { choices: [{ delta: { content: 'response' } }] };
                    yield { choices: [{ delta: { content: '' } }] }; // Empty chunk
                }
            });
        });

        afterEach(() => {
            mockOpenAICreate.mockReset();
        });

        it('returns streaming response', async () => {
            const requestBody = {
                messages: [{ role: 'user', content: 'What is AI?' }],
                context: 'AI is artificial intelligence.',
            };

            const request = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const response = await chatHandler(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toContain('text/plain');
        });

        it('handles missing context', async () => {
            const requestBody = {
                messages: [{ role: 'user', content: 'Test' }],
            };

            const request = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const response = await chatHandler(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('contexto');
        });

        it('handles missing messages', async () => {
            const requestBody = {
                context: 'Some context',
            };

            const request = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const response = await chatHandler(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('mensajes');
        });

        it('handles OpenAI API error', async () => {
            // Setup OpenAI mock to throw error
            mockOpenAICreate.mockRejectedValueOnce(new Error('OpenAI API rate limit exceeded'));

            const requestBody = {
                messages: [{ role: 'user', content: 'Test' }],
                context: 'Test context',
            };

            const request = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const response = await chatHandler(request);
            
            // Should return error response
            expect(response.status).toBe(500);
            
            const data = await response.json();
            expect(data.error).toContain('Error interno');
        });

        it('handles streaming with empty chunks', async () => {
            const requestBody = {
                messages: [{ role: 'user', content: 'Test' }],
                context: 'Test context',
            };

            const request = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const response = await chatHandler(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toContain('text/plain');

            // Read stream and verify it handles empty chunks gracefully
            const reader = response.body?.getReader();
            if (reader) {
                let chunks = 0;
                let hasContent = false;
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks++;
                    if (value && value.length > 0) {
                        hasContent = true;
                    }
                }

                // Should have received chunks and at least some content
                expect(chunks).toBeGreaterThan(0);
            }
        });
    });

    describe('Upload → Chat Integration', () => {
        it('complete flow: upload file and chat', async () => {
            // Step 1: Upload file
            const formData = new FormData();
            const file = new File(['AI is amazing'], 'test.txt', { type: 'text/plain' });
            // Mock arrayBuffer for JSDOM
            Object.defineProperty(file, 'arrayBuffer', {
                value: async () => Buffer.from('AI is amazing')
            });
            formData.append('file', file);

            const uploadRequest = {
                formData: async () => formData,
                headers: new Headers(),
            } as unknown as Request;

            const uploadResponse = await uploadHandler(uploadRequest);
            const uploadData = await uploadResponse.json();

            expect(uploadResponse.status).toBe(200);
            expect(uploadData.text).toBe('AI is amazing');

            // Step 2: Use extracted text in chat
            const chatRequest = new Request('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Summarize this' }],
                    context: uploadData.text,
                }),
            });

            const chatResponse = await chatHandler(chatRequest);
            expect(chatResponse.status).toBe(200);
        });
    });
});
