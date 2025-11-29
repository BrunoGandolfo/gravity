'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, FileText, CheckCircle } from 'lucide-react';
import { transcribeAudio, generateReport } from '../actions';
import ReactMarkdown from 'react-markdown';

export default function AudioUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error'>('idle');
    const [report, setReport] = useState<string>('');
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError('');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const processAudio = async () => {
        if (!file) return;

        try {
            setStatus('transcribing');
            const formData = new FormData();
            formData.append('file', file);

            const { text } = await transcribeAudio(formData);

            setStatus('generating');
            const { report } = await generateReport(text);

            if (report) {
                setReport(report);
                setStatus('completed');
            } else {
                throw new Error('Failed to generate report');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setError('Algo salió mal. Por favor intenta de nuevo.');
        }
    };

    const reset = () => {
        setFile(null);
        setReport('');
        setStatus('idle');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">

            {/* Upload Area */}
            {status === 'idle' && (
                <div
                    className={`card p-12 text-center border-dashed border-2 border-gray-700 hover:border-blue-500/50 transition-colors group cursor-pointer bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur-sm ${file ? 'border-blue-500 bg-blue-500/5' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="audio/*"
                        onChange={handleFileChange}
                    />

                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        {file ? (
                            <FileAudio className="w-10 h-10 text-blue-500" />
                        ) : (
                            <UploadCloud className="w-10 h-10 text-blue-500" />
                        )}
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                        {file ? file.name : 'Subir Archivo de Audio'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {file ? 'Click para cambiar archivo' : 'Arrastra y suelta o click para buscar (MP3, WAV, M4A)'}
                    </p>

                    {file && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                processAudio();
                            }}
                            className="btn btn-primary w-full max-w-xs mx-auto"
                        >
                            Generar Informe
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {(status === 'transcribing' || status === 'generating') && (
                <div className="card p-12 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                        {status === 'transcribing' ? 'Transcribiendo Audio...' : 'Generando Informe Profesional...'}
                    </h3>
                    <p className="text-gray-400">
                        Esto puede tomar unos momentos dependiendo del tamaño del archivo.
                    </p>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="card p-8 text-center border-red-500/50 bg-red-500/5 animate-fade-in">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={reset} className="btn btn-secondary">
                        Intentar de nuevo
                    </button>
                </div>
            )}

            {/* Result State */}
            {status === 'completed' && report && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Informe Generado</h2>
                        </div>
                        <button onClick={reset} className="btn btn-secondary text-sm">
                            Procesar otro archivo
                        </button>
                    </div>

                    <div className="card p-8 md:p-12 bg-white text-gray-900 prose prose-lg max-w-none">
                        <ReactMarkdown>{report}</ReactMarkdown>
                    </div>
                </div>
            )}

        </div>
    );
}
