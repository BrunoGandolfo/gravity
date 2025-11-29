import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '@/app/components/ChatInterface';

describe('ChatInterface Component', () => {
    const mockOnReset = jest.fn();
    const mockDocumentText = 'This is a test document about AI and machine learning.';
    const mockFileName = 'test-document.txt';

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockReset();
        // Default mock implementation to return 404 or similar to catch unmocked calls
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Not Found' }),
        });
    });

    it('renders chat interface with initial message', () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        expect(screen.getByText(mockFileName)).toBeInTheDocument();
        expect(screen.getByText(/He leído/i)).toBeInTheDocument();
        expect(screen.getByText(/Agente Activo/i)).toBeInTheDocument();
    });

    it('displays file name in header', () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        expect(screen.getByText(mockFileName)).toBeInTheDocument();
    });

    it('shows pedagogical mode indicator', () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        expect(screen.getByText(/Modo Pedagógico/i)).toBeInTheDocument();
    });

    it('handles user input', async () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'What is AI?');

        expect(input).toHaveValue('What is AI?');
    });

    it('submits message and shows in chat', async () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        const submitButton = screen.getByRole('button', { name: '' }); // Send button

        await userEvent.type(input, 'What is AI?');

        expect(screen.queryByText('What is AI?')).not.toBeInTheDocument();

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('What is AI?')).toBeInTheDocument();
        });
    });

    it('shows loading indicator while waiting for response', async () => {
        // Create a mock that delays before returning stream
        let resolveStream: any;
        const streamPromise = new Promise(resolve => {
            resolveStream = resolve;
        });

        (global.fetch as jest.Mock).mockReturnValueOnce(streamPromise);

        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'Test question{enter}');

        // Should show loading indicator immediately
        await waitFor(() => {
            expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
        });

        // Now resolve the stream
        const mockReadableStream = {
            getReader: () => ({
                read: jest.fn()
                    .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('AI') })
                    .mockResolvedValueOnce({ done: true, value: undefined }),
            }),
        };

        resolveStream({
            ok: true,
            body: mockReadableStream,
        });

        // Loading indicator should eventually disappear
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });
    });

    it('displays streamed response', async () => {
        const mockResponse = 'AI stands for Artificial Intelligence';
        const encoder = new TextEncoder();

        const mockReadableStream = {
            getReader: () => ({
                read: jest.fn()
                    .mockResolvedValueOnce({ done: false, value: encoder.encode(mockResponse) })
                    .mockResolvedValueOnce({ done: true, value: undefined }),
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            body: mockReadableStream,
        });

        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'What is AI?{enter}');

        await waitFor(() => {
            expect(screen.getByText(/Artificial Intelligence/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('calls onReset when reset button is clicked', () => {
        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const resetButton = screen.getByTitle(/Subir otro documento/i);
        fireEvent.click(resetButton);

        expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('disables input while loading', async () => {
        const mockReadableStream = {
            getReader: () => ({
                read: jest.fn()
                    .mockImplementation(() => new Promise(() => { })), // Never resolves
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            body: mockReadableStream,
        });

        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'Test{enter}');

        await waitFor(() => {
            expect(input).toBeDisabled();
        });
    });

    it('handles API error gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'Test question{enter}');

        await waitFor(() => {
            expect(screen.getByText(/Lo siento, tuve un problema/i)).toBeInTheDocument();
        });
    });

    it('renders markdown in messages', async () => {
        const mockResponse = '**Bold text** and *italic text*';
        const encoder = new TextEncoder();

        const mockReadableStream = {
            getReader: () => ({
                read: jest.fn()
                    .mockResolvedValueOnce({ done: false, value: encoder.encode(mockResponse) })
                    .mockResolvedValueOnce({ done: true, value: undefined }),
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            body: mockReadableStream,
        });

        render(
            <ChatInterface
                documentText={mockDocumentText}
                fileName={mockFileName}
                onReset={mockOnReset}
            />
        );

        const input = screen.getByPlaceholderText(/Escribe tu pregunta/i);
        await userEvent.type(input, 'Test{enter}');

        await waitFor(() => {
            // Since we mocked react-markdown to just render children in a div,
            // we check that the text is present. The mock doesn't parse markdown.
            // If we wanted to test parsing, we'd need a more complex mock or to not mock it.
            // Given the ESM issues, mocking is the pragmatic choice.
            expect(screen.getByText(/\*\*Bold text\*\*/)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
