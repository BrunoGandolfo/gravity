'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        throw new Error('No file provided');
    }

    try {
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
        });

        return { text: transcription.text };
    } catch (error) {
        console.error('Transcription error:', error);
        throw new Error('Failed to transcribe audio');
    }
}

export async function generateReport(transcriptionText: string) {
    if (!transcriptionText) {
        throw new Error('No transcription text provided');
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Eres un asistente ejecutivo profesional. Tu tarea es transformar la siguiente transcripción de audio en un informe profesional, detallado y bien estructurado.
          
          Sigue este formato:
          # Resumen Ejecutivo
          [Breve descripción de los puntos principales]

          # Detalles Clave
          [Lista con viñetas de información importante]

          # Elementos de Acción
          [Lista de tareas o próximos pasos identificados]

          # Transcripción Completa (Limpia)
          [Una versión legible de la transcripción]
          
          Mantén un tono profesional, conciso y objetivo. El idioma del informe debe ser ESPAÑOL.`
                },
                {
                    role: 'user',
                    content: transcriptionText,
                },
            ],
            model: 'gpt-4o', // Or gpt-3.5-turbo if 4o is not available
        });

        return { report: completion.choices[0].message.content };
    } catch (error) {
        console.error('Report generation error:', error);
        throw new Error('Failed to generate report');
    }
}
