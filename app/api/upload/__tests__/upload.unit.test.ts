import { validateFileType, validateFileSize, validateFileNotEmpty, normalizeText } from '../../../utils/validators';

describe('Upload Route Unit Tests', () => {
    describe('File Type Validation', () => {
        it('should allow PDF files', () => {
            expect(validateFileType('application/pdf')).toBe(true);
        });

        it('should allow DOCX files', () => {
            expect(validateFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
        });

        it('should allow TXT files', () => {
            expect(validateFileType('text/plain')).toBe(true);
        });

        it('should reject unsupported file types', () => {
            const unsupportedTypes = [
                'application/x-msdownload', // .exe
                'application/zip',
                'image/png',
                'video/mp4',
                'audio/mp3',
            ];

            unsupportedTypes.forEach(type => {
                expect(validateFileType(type)).toBe(false);
            });
        });
    });

    describe('File Size Validation', () => {
        const MB = 1024 * 1024;

        it('should allow files up to 10MB', () => {
            expect(validateFileSize(10 * MB)).toBe(true);
        });

        it('should allow small files (1KB)', () => {
            expect(validateFileSize(1024)).toBe(true);
        });

        it('should reject files over 10MB', () => {
            expect(validateFileSize(11 * MB)).toBe(false);
            expect(validateFileSize(20 * MB)).toBe(false);
            expect(validateFileSize(100 * MB)).toBe(false);
        });

        it('should reject empty files (0 bytes)', () => {
            expect(validateFileSize(0)).toBe(false);
        });

        it('should reject negative file sizes', () => {
            expect(validateFileSize(-1)).toBe(false);
            expect(validateFileSize(-1000)).toBe(false);
        });

        it('should allow file at exact boundary (10MB)', () => {
            expect(validateFileSize(10 * MB)).toBe(true);
        });

        it('should reject file just over boundary', () => {
            expect(validateFileSize(10 * MB + 1)).toBe(false);
        });
    });

    describe('Text Extraction from Buffer', () => {
        it('should extract plain text from TXT buffer', () => {
            const text = 'This is test content';
            const buffer = Buffer.from(text, 'utf-8');
            const extracted = buffer.toString('utf-8');
            
            expect(extracted).toBe(text);
        });

        it('should handle empty buffer', () => {
            const buffer = Buffer.from('', 'utf-8');
            const extracted = buffer.toString('utf-8');
            
            expect(extracted).toBe('');
        });

        it('should preserve special characters', () => {
            const text = 'Special chars: áéíóú ñ ¿?¡!';
            const buffer = Buffer.from(text, 'utf-8');
            const extracted = buffer.toString('utf-8');
            
            expect(extracted).toBe(text);
        });

        it('should handle multiline text', () => {
            const text = 'Line 1\nLine 2\nLine 3';
            const buffer = Buffer.from(text, 'utf-8');
            const extracted = buffer.toString('utf-8');
            
            expect(extracted).toBe(text);
        });

        it('should handle large text content', () => {
            const text = 'A'.repeat(5000);
            const buffer = Buffer.from(text, 'utf-8');
            const extracted = buffer.toString('utf-8');
            
            expect(extracted.length).toBe(5000);
            expect(extracted).toBe(text);
        });
    });

    describe('Empty File Handling', () => {
        it('should reject empty text', () => {
            expect(validateFileNotEmpty('')).toBe(false);
        });

        it('should reject whitespace-only text', () => {
            expect(validateFileNotEmpty('   ')).toBe(false);
            expect(validateFileNotEmpty('\n\n\n')).toBe(false);
            expect(validateFileNotEmpty('\t\t\t')).toBe(false);
        });

        it('should reject text with less than 10 characters', () => {
            expect(validateFileNotEmpty('Short')).toBe(false);
            expect(validateFileNotEmpty('12345')).toBe(false);
            expect(validateFileNotEmpty('123456789')).toBe(false);
        });

        it('should accept text with at least 10 characters', () => {
            expect(validateFileNotEmpty('1234567890')).toBe(true);
            expect(validateFileNotEmpty('This is valid content')).toBe(true);
        });

        it('should trim whitespace before checking length', () => {
            expect(validateFileNotEmpty('  Valid text  ')).toBe(true);
            expect(validateFileNotEmpty('  Short  ')).toBe(false);
        });
    });

    describe('Text Normalization', () => {
        it('should replace multiple spaces with single space', () => {
            const text = 'Hello    world    test';
            expect(normalizeText(text)).toBe('Hello world test');
        });

        it('should replace tabs with single space', () => {
            const text = 'Hello\t\tworld';
            expect(normalizeText(text)).toBe('Hello world');
        });

        it('should replace newlines with single space', () => {
            const text = 'Hello\n\n\nworld';
            expect(normalizeText(text)).toBe('Hello world');
        });

        it('should trim leading and trailing whitespace', () => {
            const text = '   Hello world   ';
            expect(normalizeText(text)).toBe('Hello world');
        });

        it('should handle mixed whitespace characters', () => {
            const text = '  Hello \n\t\t world  \n  test  ';
            expect(normalizeText(text)).toBe('Hello world test');
        });

        it('should return empty string for whitespace-only input', () => {
            expect(normalizeText('   \n\t   ')).toBe('');
        });

        it('should not modify already normalized text', () => {
            const text = 'Hello world test';
            expect(normalizeText(text)).toBe(text);
        });
    });

    describe('Unsupported Type Error Messages', () => {
        it('should identify unsupported file extensions', () => {
            const unsupportedExtensions = [
                { type: 'application/x-msdownload', ext: '.exe' },
                { type: 'application/zip', ext: '.zip' },
                { type: 'image/jpeg', ext: '.jpg' },
                { type: 'video/mp4', ext: '.mp4' },
            ];

            unsupportedExtensions.forEach(({ type, ext }) => {
                expect(validateFileType(type)).toBe(false);
            });
        });
    });
});

