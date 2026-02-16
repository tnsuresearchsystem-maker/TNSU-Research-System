import { GoogleGenAI } from "@google/genai";
import { ProjectMaster, PublicationOutput } from "../types";

export const generateResponse = async (
  prompt: string, 
  projects: ProjectMaster[], 
  publications: PublicationOutput[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Error: API Key is missing. Please check your environment variables.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare context data
  const dataContext = `
    CURRENT DATABASE STATE:
    
    PROJECTS (Total: ${projects.length}):
    ${JSON.stringify(projects.map(p => ({
      id: p.project_id,
      year: p.funding_fiscal_year,
      name: p.project_name,
      status: p.status,
      budget: p.budget_amount,
      researcher: p.head_researcher
    })), null, 2)}

    PUBLICATIONS (Total: ${publications.length}):
    ${JSON.stringify(publications.map(pub => ({
      id: pub.output_id,
      projectId: pub.ref_project_id,
      reportingYear: pub.output_reporting_year,
      title: pub.article_title,
      type: pub.publication_type
    })), null, 2)}
  `;

  const systemInstruction = `
    You are an expert Data Analyst and Research Consultant for the Thailand National Sports University (TNSU).
    Your goal is to assist administrators in understanding their research performance, specifically focusing on "Longitudinal Data Analysis".
    
    You have access to the current database state provided above.
    
    Key Concepts:
    1. Funding Fiscal Year: When the project received money.
    2. Output Reporting Year: When the publication was released.
    3. Lag Time: It is normal for a project funded in 2566 to have outputs in 2568. This is a success indicator, not an error.
    
    When answering:
    - Be precise with numbers.
    - If asked about "Success Rate", calculate the percentage of projects in a specific cohort (Funding Year) that have at least one linked publication.
    - If asked about "Performance", summarize total outputs by reporting year.
    - Use the provided JSON data to perform your calculations.
    - Use Thai Fiscal Years (e.g., 2566, 2567) in your text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt + "\n\n" + dataContext,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }, // High budget for complex analytical reasoning
      },
    });

    return response.text || "I processed the data but could not generate a text response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while analyzing the data. Please try again.";
  }
};
