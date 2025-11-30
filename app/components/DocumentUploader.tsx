"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface DocumentUploaderProps {
    onUploadComplete: (text: string, fileName: string) => void;
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setError(null);
        setUploadProgress(0);

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            setError("Por favor sube un archivo PDF, DOCX o TXT.");
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("El archivo es demasiado grande. Máximo 10MB.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al procesar el documento.");
            }

            const data = await response.json();

            // Small delay for UX
            setTimeout(() => {
                onUploadComplete(data.text, file.name);
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            console.error(err);
            setError(err instanceof Error ? err.message : "Hubo un error al subir el archivo. Inténtalo de nuevo.");
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                data-testid="upload-dropzone"
                className={`
          relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500
          ${isDragging
                        ? "border-primary bg-primary/10 scale-[1.02] shadow-2xl shadow-primary/50"
                        : "border-white/20 bg-white/5 backdrop-blur-xl hover:border-white/40 hover:bg-white/10"
                    }
          ${isUploading ? "pointer-events-none" : ""}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    data-testid="file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    disabled={isUploading}
                />

                <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
                    {/* Icon */}
                    <div className={`
            relative p-6 rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl
            ${isUploading ? "animate-pulse" : "animate-float"}
          `}>
                        {isUploading ? (
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        ) : uploadProgress === 100 ? (
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        ) : (
                            <Upload className="w-12 h-12 text-white" />
                        )}
                        {!isUploading && uploadProgress === 0 && (
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold">
                            {isUploading ? "Procesando tu documento..." : uploadProgress === 100 ? "¡Listo!" : "Sube tu documento"}
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                            {isUploading
                                ? "Extrayendo el contenido y preparando el asistente..."
                                : uploadProgress === 100
                                    ? "Redirigiendo al chat..."
                                    : "Arrastra y suelta tu archivo aquí, o haz clic para seleccionar"
                            }
                        </p>
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                PDF
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                DOCX
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                TXT
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                        <div className="w-full max-w-xs">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{uploadProgress}%</p>
                        </div>
                    )}

                    {/* Button */}
                    {!isUploading && uploadProgress === 0 && (
                        <button
                            data-testid="select-file-button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Seleccionar Archivo
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom duration-300">
                        <div data-testid="upload-error" className="p-4 rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 flex items-start gap-3">
                            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
