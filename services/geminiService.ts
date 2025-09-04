import { GoogleGenAI, Type } from "@google/genai";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import { FoodItem, Contribution, User, AIAnalysis } from '../types';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        consumptionPatterns: {
            type: Type.STRING,
            description: "Análisis de los patrones de consumo basados en el inventario. Mencionar qué categorías son las más abundantes."
        },
        nutritionalBalance: {
            type: Type.STRING,
            description: "Comentario sobre el balance nutricional potencial del inventario actual."
        },
        shoppingSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de 3 a 5 sugerencias de compra para complementar el inventario y mejorar la dieta."
        },
        budgetOptimization: {
            type: Type.STRING,
            description: "Sugerencias para optimizar el presupuesto, como comprar al por mayor o alternativas más económicas."
        },
    },
    required: ["consumptionPatterns", "nutritionalBalance", "shoppingSuggestions", "budgetOptimization"],
};


export const getAnalysisAndSuggestions = async (
    inventory: FoodItem[],
    contributions: Contribution[],
    users: User[]
): Promise<AIAnalysis> => {
    
    try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const inventorySummary = inventory
            .filter(item => item.consumedAt === null)
            .map(item => `- ${item.name}: ${item.quantity} ${item.unit}`)
            .join('\n');

        const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
        const userContributions = users.map(user => {
            const userTotal = contributions
                .filter(c => c.userId === user.id)
                .reduce((sum, c) => sum + c.amount, 0);
            return `${user.name}: $${userTotal.toLocaleString()}`;
        }).join(', ');


        const systemInstruction = `Eres un asistente inteligente y asesor nutricional y financiero para un hogar. Tu objetivo es ayudar a los usuarios a gestionar su inventario de alimentos y gastos compartidos. Analiza los datos proporcionados sobre el inventario y los aportes monetarios para ofrecer un análisis claro, útil, breve, amigable y práctico. La moneda para todos los cálculos y menciones es Pesos. Debes generar siempre una respuesta en el formato JSON especificado.`;

        const contents = `
            Analiza los siguientes datos:

            Inventario Actual:
            ${inventorySummary || 'No hay artículos en el inventario.'}

            Aportes Monetarios Recientes:
            - Total General: $${totalContributions.toLocaleString()}
            - Aportes por usuario: ${userContributions}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as AIAnalysis;

    } catch (error: any) {
        console.error("Error fetching AI analysis:", error);
    if (error.toString().includes("API key not valid") || error.toString().includes("API key is missing")) {
            throw new Error("API_KEY_INVALID (Gemini)");
        }
        throw new Error("No se pudo generar el análisis. Inténtalo de nuevo más tarde.");
    }
};