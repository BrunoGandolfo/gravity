import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ChatDoc AI | Tu Asistente de Documentos",
    description: "Sube documentos y chatea con ellos usando inteligencia artificial.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
