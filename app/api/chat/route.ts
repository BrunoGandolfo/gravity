import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { messages, context } = await req.json();

        if (!messages || !context) {
            return new Response(
                JSON.stringify({ error: "Faltan mensajes o contexto" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const systemPrompt = `
      Eres un asistente de IA experto y pedagógico. Tu objetivo es ayudar al usuario a entender el documento proporcionado.
      
      Instrucciones:
      1. Basa tus respuestas ÚNICAMENTE en el contexto proporcionado del documento.
      2. Sé amable, paciente y claro. Usa un tono profesional pero cercano.
      3. Si la pregunta es confusa, pide aclaraciones amablemente.
      4. Si la respuesta no está en el documento, dilo honestamente.
      5. Usa formato Markdown para estructurar tus respuestas (listas, negritas, etc.).
      
      Contexto del documento:
      ${context.substring(0, 20000)}
    `;

        const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.7,
            stream: true,
        });

        // Create a ReadableStream for streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error en chat API:", error);
        return new Response(
            JSON.stringify({ error: "Error interno: " + (error instanceof Error ? error.message : "desconocido") }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
