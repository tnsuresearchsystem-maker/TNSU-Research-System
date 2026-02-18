
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

  // --- DATA AGGREGATION (Cost Optimization) ---
  // Instead of sending raw rows (which consumes huge tokens & cost), we calculate stats on the client.
  
  // 1. Project Stats
  const totalProjects = projects.length;
  const projectsByYear: Record<string, number> = {};
  const projectsByStatus: Record<string, number> = {};
  let totalBudget = 0;
  
  projects.forEach(p => {
    projectsByYear[p.funding_fiscal_year] = (projectsByYear[p.funding_fiscal_year] || 0) + 1;
    projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
    totalBudget += p.budget_amount;
  });

  // 2. Publication Stats
  const totalPubs = publications.length;
  const pubsByYear: Record<string, number> = {};
  const pubsByType: Record<string, number> = {};
  
  publications.forEach(pub => {
    pubsByYear[pub.output_reporting_year] = (pubsByYear[pub.output_reporting_year] || 0) + 1;
    pubsByType[pub.publication_type] = (pubsByType[pub.publication_type] || 0) + 1;
  });

  // 3. Success Rate (Cohort Analysis)
  // Which projects have at least one publication?
  const projectIdsWithPubs = new Set(publications.map(pub => pub.ref_project_id));
  const successCount = projects.filter(p => projectIdsWithPubs.has(p.project_id)).length;
  const globalSuccessRate = totalProjects > 0 ? ((successCount / totalProjects) * 100).toFixed(1) : "0";

  // Prepare Optimized Context (Small Token Size)
  const dataContext = `
    AGGREGATED DATABASE SUMMARY (TNSU Research System):
    
    [PROJECTS OVERVIEW]
    - Total Projects: ${totalProjects}
    - Total Budget: ${totalBudget.toLocaleString()} THB
    - Distribution by Fiscal Year: ${JSON.stringify(projectsByYear)}
    - Status Breakdown: ${JSON.stringify(projectsByStatus)}
    
    [PUBLICATIONS OVERVIEW]
    - Total Publications: ${totalPubs}
    - Distribution by Reporting Year: ${JSON.stringify(pubsByYear)}
    - Types: ${JSON.stringify(pubsByType)}

    [PERFORMANCE METRICS]
    - Global Success Rate (Projects with >0 outputs): ${globalSuccessRate}%
    - Projects with Outputs: ${successCount}
    - Projects without Outputs: ${totalProjects - successCount}
  `;

  const systemInstruction = `
    You are an expert Data Analyst and Research Consultant for the Thailand National Sports University (TNSU).
    Your goal is to assist administrators by interpreting the "AGGREGATED DATABASE SUMMARY" provided above.
    
    Current Date: ${new Date().toLocaleDateString()}
    
    Rules:
    1. RELY ONLY on the provided summary stats. Do not hallucinate individual project names unless the user provides them in the prompt.
    2. If asked about trends, compare the years in the summary (e.g., "Publications increased from 2566 to 2567").
    3. If asked about specific details (like "Who is the researcher of Project X?"), politely explain that you only have access to high-level statistical data in this view to protect privacy and system performance.
    4. Use Thai Fiscal Years (e.g., 2566, 2567) in your text.
    5. Be concise, professional, and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Use Flash model for speed and lower cost/free tier optimization
      contents: `User Question: "${prompt}"\n\n${dataContext}`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I processed the data but could not generate a text response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while analyzing the data. Please check your connection or API limit.";
  }
};
