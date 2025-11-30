import {
    validateFileType,
    validateFileSize,
    validateFileNotEmpty,
    truncateContext,
    normalizeText,
    extractTextFromBuffer,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    MAX_CONTEXT_LENGTH,
} from '../validators';

describe('validators', () => {
    describe('validateFileType', () => {
        it('should accept PDF files', () => {
            expect(validateFileType('application/pdf')).toBe(true);
        });

        it('should accept DOCX files', () => {
            expect(validateFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
        });

        it('should accept TXT files', () => {
            expect(validateFileType('text/plain')).toBe(true);
        });

        it('should reject EXE files', () => {
            expect(validateFileType('application/x-msdownload')).toBe(false);
        });

        it('should reject unknown file types', () => {
            expect(validateFileType('application/octet-stream')).toBe(false);
        });

        it('should reject empty string', () => {
            expect(validateFileType('')).toBe(false);
        });
    });

    describe('validateFileSize', () => {
        it('should accept files under 10MB', () => {
            expect(validateFileSize(5 * 1024 * 1024)).toBe(true);
        });

        it('should accept files exactly 10MB', () => {
            expect(validateFileSize(10 * 1024 * 1024)).toBe(true);
        });

        it('should reject files over 10MB', () => {
            expect(validateFileSize(11 * 1024 * 1024)).toBe(false);
        });

        it('should reject files with size 0', () => {
            expect(validateFileSize(0)).toBe(false);
        });

        it('should reject negative file sizes', () => {
            expect(validateFileSize(-1)).toBe(false);
        });

        it('should accept small files (1KB)', () => {
            expect(validateFileSize(1024)).toBe(true);
        });
    });

    describe('validateFileNotEmpty', () => {
        it('should accept text with at least 10 characters', () => {
            expect(validateFileNotEmpty('This is valid text')).toBe(true);
        });

        it('should reject text with less than 10 characters', () => {
            expect(validateFileNotEmpty('Short')).toBe(false);
        });

        it('should reject empty string', () => {
            expect(validateFileNotEmpty('')).toBe(false);
        });

        it('should reject whitespace-only string', () => {
            expect(validateFileNotEmpty('   ')).toBe(false);
        });

        it('should trim whitespace before validation', () => {
            expect(validateFileNotEmpty('  Valid text  ')).toBe(true);
        });

        it('should accept exactly 10 characters', () => {
            expect(validateFileNotEmpty('1234567890')).toBe(true);
        });
    });

    describe('truncateContext', () => {
        it('should not truncate text shorter than maxLength', () => {
            const text = 'Short text';
            expect(truncateContext(text, 100)).toBe(text);
        });

        it('should truncate text longer than maxLength', () => {
            const text = 'a'.repeat(30000);
            const result = truncateContext(text);
            expect(result.length).toBe(MAX_CONTEXT_LENGTH);
        });

        it('should use default MAX_CONTEXT_LENGTH when not specified', () => {
            const text = 'a'.repeat(30000);
            const result = truncateContext(text);
            expect(result.length).toBe(20000);
        });

        it('should allow custom maxLength', () => {
            const text = 'a'.repeat(1000);
            const result = truncateContext(text, 500);
            expect(result.length).toBe(500);
        });

        it('should return empty string for empty input', () => {
            expect(truncateContext('')).toBe('');
        });

        it('should preserve exact length when text equals maxLength', () => {
            const text = 'a'.repeat(20000);
            expect(truncateContext(text).length).toBe(20000);
        });
    });

    describe('normalizeText', () => {
        it('should replace multiple spaces with single space', () => {
            expect(normalizeText('Hello    world')).toBe('Hello world');
        });

        it('should replace tabs with single space', () => {
            expect(normalizeText('Hello\t\tworld')).toBe('Hello world');
        });

        it('should replace newlines with single space', () => {
            expect(normalizeText('Hello\n\nworld')).toBe('Hello world');
        });

        it('should trim leading and trailing whitespace', () => {
            expect(normalizeText('  Hello world  ')).toBe('Hello world');
        });

        it('should handle mixed whitespace', () => {
            expect(normalizeText('  Hello \n\t world  ')).toBe('Hello world');
        });

        it('should return empty string for whitespace-only input', () => {
            expect(normalizeText('   \n\t   ')).toBe('');
        });

        it('should not modify already normalized text', () => {
            const text = 'Hello world';
            expect(normalizeText(text)).toBe(text);
        });
    });

    describe('extractTextFromBuffer', () => {
        it('should extract text from UTF-8 buffer', () => {
            const buffer = Buffer.from('Hello world', 'utf-8');
            expect(extractTextFromBuffer(buffer)).toBe('Hello world');
        });

        it('should handle empty buffer', () => {
            const buffer = Buffer.from('', 'utf-8');
            expect(extractTextFromBuffer(buffer)).toBe('');
        });

        it('should handle special characters', () => {
            const text = 'Hola ñoño, ¿cómo estás?';
            const buffer = Buffer.from(text, 'utf-8');
            expect(extractTextFromBuffer(buffer)).toBe(text);
        });

        it('should handle emojis', () => {
            const text = 'Hello 👋 World 🌍';
            const buffer = Buffer.from(text, 'utf-8');
            expect(extractTextFromBuffer(buffer)).toBe(text);
        });

        it('should handle multiline text', () => {
            const text = 'Line 1\nLine 2\nLine 3';
            const buffer = Buffer.from(text, 'utf-8');
            expect(extractTextFromBuffer(buffer)).toBe(text);
        });
    });

    describe('constants', () => {
        it('should have correct allowed file types', () => {
            expect(ALLOWED_FILE_TYPES).toEqual({
                'application/pdf': '.pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                'text/plain': '.txt',
            });
        });

        it('should have MAX_FILE_SIZE of 10MB', () => {
            expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
        });

        it('should have MAX_CONTEXT_LENGTH of 20000', () => {
            expect(MAX_CONTEXT_LENGTH).toBe(20000);
        });
    });
});

