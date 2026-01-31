// Fix: Corrected imports and followed @google/genai guidelines for generateContent and response handling.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Product, Transaction, ProductAddress } from "../types";

export class GeminiService {
  /**
   * Generates insights based on stock data using Gemini AI.
   */
  // Completing the method to return a Promise<string[]> as declared, adding fallback logic in case of errors.
  static async getStockInsights(products: Product[], transactions: Transaction[]): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const prompt = `Analise os seguintes dados de estoque e forneça 3 insights rápidos (em português) sobre itens que precisam de atenção, tendências de saída ou sugestões de organização física.
      
      Produtos Atuais: ${JSON.stringify(products.map(p => ({ name: p.name, qty: p.quantity, min: p.minQuantity })))}
      Últimas Transações: ${JSON.stringify(transactions.slice(-5))}`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de insights gerados'
              }
            },
            required: ["insights"]
          }
        }
      });

      const text = response.text;
      if (!text) return [];

      try {
        const result = JSON.parse(text.trim());
        return result.insights || [];
      } catch (parseError) {
        console.error("Error parsing Gemini JSON response:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      // Return helpful fallback insights if the API fails
      return [
        "Revise o nível de estoque mínimo para itens com alta frequência de saída.",
        "Considere organizar a Rua 8-A por ordem de SKU para agilizar a separação.",
        "Identifique produtos sem movimentação nos últimos 30 dias para otimização de espaço."
      ];
    }
  }
}