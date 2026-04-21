import { GoogleGenAI, Type } from "@google/genai";
import { KPIStats, OperatorStats } from "../types";

/**
 * Service to interact with Gemini AI for warehouse data analysis.
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askGemini(question: string, context: { kpis: KPIStats; operators: OperatorStats[] }) {
  const systemInstruction = `
    Eres un consultor senior de logística y SAP EWM especializado en los almacenes de Palex Medical,
    gestionados por ILS Servicios Logísticos. Tienes acceso a los datos reales del almacén.

    Los datos disponibles son: ${JSON.stringify(context.kpis)}
    Datos de operarios resumidos: ${JSON.stringify(context.operators.map(o => ({ id: o.id, prod: o.productividad_pct, wts: o.wts_totales, zigzags: o.zigzags })))}

    Responde SIEMPRE con datos concretos del contexto proporcionado. Nunca inventes datos.
    Si preguntan por un operario, busca sus datos en el JSON y responde con sus KPIs reales.
    Sé conciso, profesional y orientado a la mejora operativa.
    Usa el contexto de un almacén de material médico de diálisis y hospitalario.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "No se pudo obtener una respuesta de la IA.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con Gemini. Por favor, verifica tu conexión y API Key.";
  }
}

export async function generateAutoAnalysis(kpis: KPIStats, operators: OperatorStats[]) {
  const prompt = `
    Analiza estos datos del almacén de Palex Medical y genera un análisis de problemas y mejoras.
    
    KPIs: ${JSON.stringify(kpis)}
    Operarios: ${JSON.stringify(operators.map(o => ({ id: o.id, prod: o.productividad_pct, gap: o.gap_medio_seg, zigzags: o.zigzag_pct })))}
    
    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "problemas": [{"titulo": "...", "descripcion": "...", "severidad": "alta|media"}],
      "mejoras": [{"titulo": "...", "descripcion": "...", "impacto": "..."}]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  descripcion: { type: Type.STRING },
                  severidad: { type: Type.STRING }
                }
              }
            },
            mejoras: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  descripcion: { type: Type.STRING },
                  impacto: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Auto Analysis Error:", error);
    return { problemas: [], mejoras: [] };
  }
}
