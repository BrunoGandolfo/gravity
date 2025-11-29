"use client";

import { useState } from "react";
import DocumentUploader from "./components/DocumentUploader";
import ChatInterface from "./components/ChatInterface";
import { MessageSquare, Sparkles, Zap, Brain, GraduationCap, ArrowRight, Star } from "lucide-react";

export default function Home() {
    const [documentText, setDocumentText] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleUploadComplete = (text: string, name: string) => {
        setDocumentText(text);
        setFileName(name);
    };

    const handleReset = () => {
        setDocumentText(null);
        setFileName(null);
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-16 animate-in fade-in duration-700">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl">
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                ChatDoc AI
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">Asistente Inteligente de Documentos</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                        <span className="text-sm font-medium text-gray-300">Powered by GPT-4</span>
                    </div>
                </header>

                {/* Main Content */}
                {!documentText ? (
                    <div className="space-y-20 animate-in fade-in duration-1000">
                        {/* Hero Section */}
                        <div className="text-center space-y-8 max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-gray-300 animate-in slide-in-from-top duration-700">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span>Nuevo: Análisis pedagógico mejorado con IA</span>
                            </div>

                            <h2 className="text-6xl lg:text-8xl font-black tracking-tight leading-none">
                                Conversa con tus
                                <br />
                                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700">
                                    Documentos
                                </span>
                            </h2>

                            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                Sube cualquier PDF, DOCX o TXT y obtén respuestas instantáneas.
                                Nuestro asistente pedagógico te ayudará a comprender, analizar y resumir el contenido con precisión.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                                <button className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                                    Comenzar ahora
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300">
                                    Ver ejemplo
                                </button>
                            </div>
                        </div>

                        {/* Upload Section */}
                        <DocumentUploader onUploadComplete={handleUploadComplete} />

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Zap,
                                    title: "Análisis Instantáneo",
                                    desc: "Procesamiento ultrarrápido de documentos con IA de última generación",
                                    gradient: "from-yellow-500 to-orange-500"
                                },
                                {
                                    icon: Brain,
                                    title: "Comprensión Profunda",
                                    desc: "Respuestas contextuales precisas basadas en el contenido completo",
                                    gradient: "from-purple-500 to-pink-500"
                                },
                                {
                                    icon: GraduationCap,
                                    title: "Enfoque Pedagógico",
                                    desc: "Explicaciones claras y didácticas adaptadas a tu nivel de comprensión",
                                    gradient: "from-blue-500 to-cyan-500"
                                },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 animate-in fade-in"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-shadow mb-5`}>
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-16 pt-12 opacity-60">
                            {[
                                { label: "Documentos procesados", value: "10K+" },
                                { label: "Precisión", value: "99%" },
                                { label: "Idiomas", value: "50+" },
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.value}</div>
                                    <div className="text-sm text-gray-500 mt-2">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ChatInterface
                        documentText={documentText}
                        fileName={fileName || "Documento"}
                        onReset={handleReset}
                    />
                )}
            </div>
        </main>
    );
}
