// File validation utilities

export const ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_CONTEXT_LENGTH = 20000;

export function validateFileType(fileType: string): boolean {
    return fileType in ALLOWED_FILE_TYPES;
}

export function validateFileSize(fileSize: number): boolean {
    return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

export function validateFileNotEmpty(text: string): boolean {
    return text.trim().length >= 10;
}

export function truncateContext(context: string, maxLength: number = MAX_CONTEXT_LENGTH): string {
    if (context.length <= maxLength) {
        return context;
    }
    return context.substring(0, maxLength);
}

export function normalizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

export function extractTextFromBuffer(buffer: Buffer): string {
    return buffer.toString('utf-8');
}

