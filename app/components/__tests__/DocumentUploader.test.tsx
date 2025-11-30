import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentUploader from '../DocumentUploader';

describe('DocumentUploader Component', () => {
    const mockOnUploadComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders upload interface correctly', () => {
        render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        expect(screen.getByText(/Sube tu documento/i)).toBeInTheDocument();
        expect(screen.getByText(/Seleccionar Archivo/i)).toBeInTheDocument();
    });

    it('shows file type information', () => {
        render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        expect(screen.getByText(/PDF/i)).toBeInTheDocument();
        expect(screen.getByText(/DOCX/i)).toBeInTheDocument();
        expect(screen.getByText(/TXT/i)).toBeInTheDocument();
    });

    it('handles file selection', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ text: 'test content' }),
        });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
        });
    });

    it('shows error for invalid file type', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/Por favor sube un archivo PDF, DOCX o TXT/i)).toBeInTheDocument();
        });
    });

    it('shows error for file too large', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(screen.getByText(/El archivo es demasiado grande/i)).toBeInTheDocument();
        });
    });

    it('shows loading state during upload', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                json: async () => ({ text: 'test' }),
            }), 100))
        );

        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText(/Procesando tu documento/i)).toBeInTheDocument();
    });

    it('calls onUploadComplete with extracted text', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ text: 'extracted text content' }),
        });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledWith('extracted text content', 'test.txt');
        });
    });

    it('handles drag and drop', async () => {
        render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const dropZone = screen.getByText(/Sube tu documento/i).closest('div');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ text: 'test' }),
        });

        fireEvent.dragOver(dropZone!);
        fireEvent.drop(dropZone!, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    it('handles upload error gracefully', async () => {
        const { container } = render(<DocumentUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Upload failed' }),
        });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
        });
    });
});
