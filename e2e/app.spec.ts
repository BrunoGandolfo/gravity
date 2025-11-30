import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('E2E Tests - Gravity ChatDoc AI', () => {
    test('TEST 1: página carga correctamente', async ({ page }) => {
        await page.goto('/');
        
        // Verificar que aparece la zona de upload
        await expect(page.getByTestId('upload-dropzone')).toBeVisible();
        await expect(page.getByTestId('select-file-button')).toBeVisible();
    });

    test('TEST 2: subir archivo TXT muestra chat', async ({ page }) => {
        await page.goto('/');
        
        // Subir archivo
        const fileInput = page.getByTestId('file-input');
        const filePath = path.join(__dirname, 'fixtures', 'sample.txt');
        await fileInput.setInputFiles(filePath);
        
        // Verificar que aparece la interfaz de chat
        await expect(page.getByTestId('chat-interface')).toBeVisible({ timeout: 10000 });
        
        // Verificar que aparece el nombre del archivo
        await expect(page.getByTestId('chat-filename')).toContainText('sample.txt');
    });

    test('TEST 3: enviar mensaje recibe respuesta', async ({ page }) => {
        await page.goto('/');
        
        // Subir archivo
        const fileInput = page.getByTestId('file-input');
        const filePath = path.join(__dirname, 'fixtures', 'sample.txt');
        await fileInput.setInputFiles(filePath);
        
        // Esperar chat
        await expect(page.getByTestId('chat-interface')).toBeVisible({ timeout: 10000 });
        
        // Escribir mensaje
        const input = page.getByTestId('chat-input');
        await input.fill('Hola');
        
        // Enviar
        const sendButton = page.getByTestId('send-button');
        await sendButton.click();
        
        // Verificar que aparece el mensaje del usuario
        await expect(page.getByTestId('message-user-1')).toBeVisible({ timeout: 5000 });
        
        // Verificar que aparece respuesta del asistente (puede tardar)
        await expect(page.getByTestId('message-assistant-1')).toBeVisible({ timeout: 15000 });
    });

    test('TEST 4: botón reset vuelve a upload', async ({ page }) => {
        await page.goto('/');
        
        // Subir archivo
        const fileInput = page.getByTestId('file-input');
        const filePath = path.join(__dirname, 'fixtures', 'sample.txt');
        await fileInput.setInputFiles(filePath);
        
        // Esperar chat
        await expect(page.getByTestId('chat-interface')).toBeVisible({ timeout: 10000 });
        
        // Click en reset
        const resetButton = page.getByTestId('reset-button');
        await resetButton.click();
        
        // Verificar que vuelve la zona de upload
        await expect(page.getByTestId('upload-dropzone')).toBeVisible({ timeout: 5000 });
    });

    test('TEST 5: maneja error de archivo inválido', async ({ page }) => {
        await page.goto('/');
        
        // Crear un archivo inválido (.exe simulado con tipo incorrecto)
        const fileInput = page.getByTestId('file-input');
        
        // Crear buffer para un archivo falso
        const buffer = Buffer.from('fake exe content');
        const file = new File([buffer], 'test.exe', { type: 'application/x-msdownload' });
        
        // Intentar subir (esto será rechazado por validación en el cliente)
        await fileInput.setInputFiles({
            name: 'test.exe',
            mimeType: 'application/x-msdownload',
            buffer: buffer
        });
        
        // Verificar mensaje de error
        await expect(page.getByTestId('upload-error')).toBeVisible({ timeout: 5000 });
    });
});
