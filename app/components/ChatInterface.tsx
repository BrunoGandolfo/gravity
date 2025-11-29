"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
interface ChatInterfaceProps {
    documentText: string;
    fileName: string;
    onReset: () => void;
}
interface Message {
    role: "user" | "assistant";
    content: string;
}
export default function ChatInterface({ documentText, fileName, onReset }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: `¡Hola! 👋 He leído **${fileName}** y estoy listo para ayudarte a comprenderlo mejor. ¿Qué te gustaría saber?` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);
        setStreamingContent("");
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    context: documentText
                }),
            });
            if (!response.ok) throw new Error("Error en la respuesta");
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // Add characters one by one with delay for smoother streaming
                    for (const char of chunk) {
                        fullContent += char;
                        setStreamingContent(fullContent);
                        await new Promise(resolve => setTimeout(resolve, 20));
                    }
                }
                setMessages(prev => [...prev, { role: "assistant", content: fullContent }]);
                setStreamingContent("");
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías intentarlo de nuevo?" }]);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="w-full max-w-6xl mx-auto h-[85vh] flex flex-col rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#ec4899]">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-base truncate max-w-[200px] md:max-w-md">
                            {fileName}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Agente Activo
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#14b8a6]" />
                                Modo Pedagógico
                            </span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white group"
                    title="Subir otro documento"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 animate-in slide-in-from-bottom duration-300 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
              ${msg.role === "user"
                                ? "bg-gradient-to-br from-[#6366f1] to-[#ec4899]"
                                : "bg-gradient-to-br from-[#ec4899] to-[#14b8a6]"
                            }
            `}>
                            {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        {/* Message Bubble */}
                        <div className={`
              max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed shadow-lg
              ${msg.role === "user"
                                ? "bg-gradient-to-br from-[#6366f1] to-[#ec4899] text-white rounded-tr-lg"
                                : "bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 rounded-tl-lg"
                            }
            `}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                        code: ({ children }) => <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                                        pre: ({ children }) => <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-xs">{children}</pre>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Streaming Message */}
                {streamingContent && (
                    <div className="flex gap-4 animate-in slide-in-from-bottom duration-300">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#14b8a6] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-[75%] rounded-3xl rounded-tl-lg p-5 text-sm leading-relaxed shadow-lg bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                        code: ({ children }) => <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                                    }}
                                >
                                    {streamingContent}
                                </ReactMarkdown>
                            </div>
                            <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-1"></span>
                        </div>
                    </div>
                )}
                {/* Loading Indicator */}
                {isLoading && !streamingContent && (
                    <div className="flex gap-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#14b8a6] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl rounded-tl-lg p-5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-gradient-to-r from-transparent to-white/5 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta sobre el documento..."
                        className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-br from-[#6366f1] to-[#ec4899] text-white rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-3 text-center">
                    El asistente puede cometer errores. Verifica la información importante.
                </p>
            </div>
        </div>
    );
}
