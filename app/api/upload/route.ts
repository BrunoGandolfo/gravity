import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    if (file.type === "application/pdf") {
      try {
        const pdfParse = require("pdf-parse-fork");
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (e) {
        console.error("Error parsing PDF:", e);
        return NextResponse.json({ 
          error: "Error al leer PDF. Intenta con un archivo TXT o DOCX." 
        }, { status: 500 });
      }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.default.extractRawText({ buffer });
        text = result.value;
      } catch (e) {
        console.error("Error parsing DOCX:", e);
        return NextResponse.json({ 
          error: "Error al leer DOCX. Intenta con un archivo TXT." 
        }, { status: 500 });
      }
    } else if (file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa PDF, DOCX o TXT." },
        { status: 400 }
      );
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "El documento parece estar vacío." },
        { status: 400 }
      );
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error en upload API:", error);
    return NextResponse.json(
      { error: "Error interno: " + (error instanceof Error ? error.message : "desconocido") },
      { status: 500 }
    );
  }
}
