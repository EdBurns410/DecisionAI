import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, AnalysisResult, PreparationPlan } from '../types';
import { marked } from 'marked';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const preparationPlanSchema = {
    type: Type.OBJECT,
    properties: {
        identifiedColumns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of column headers identified from the data."
        },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short title for the preparation step, e.g., 'Handle Missing Values'." },
                    description: { type: Type.STRING, description: "A detailed explanation of the step, e.g., 'Fill missing values in the Revenue column with 0'." }
                },
                required: ["title", "description"]
            },
            description: "A list of proposed data cleaning and preparation steps."
        },
        analysisSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential analyses that can be performed on this data, e.g., 'Analyze sales trend over time'."
        }
    },
    required: ["identifiedColumns", "steps", "analysisSuggestions"]
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        analysisTitle: { type: Type.STRING },
        dataTransformationSummary: { type: Type.STRING },
        keyInsights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    metric: { type: Type.STRING },
                    value: { type: Type.STRING },
                    trend: { type: Type.STRING }
                },
                required: ["metric", "value", "trend"]
            }
        },
        quantitativeAnalysis: { type: Type.STRING, description: "A summary in Markdown format." },
        qualitativeAnalysis: { type: Type.STRING, description: "A summary in Markdown format." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                },
                required: ["area", "recommendation"]
            }
        },
        chartData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                },
                required: ["name", "value"]
            }
        },
        chartType: { type: Type.STRING, enum: ['bar', 'line'] }
    },
    required: ["analysisTitle", "dataTransformationSummary", "keyInsights", "quantitativeAnalysis", "qualitativeAnalysis", "recommendations", "chartData", "chartType"]
};

export const generatePreparationPlan = async (profile: BusinessProfile, csvData: string): Promise<PreparationPlan> => {
    const csvSnippet = csvData.split('\n').slice(0, 10).join('\n').substring(0, 2000);

    const prompt = `
        You are a senior data analyst. Your task is to inspect a data sample from a business and propose a data preparation and analysis plan.

        Business Profile:
        - Sector: ${profile.sector}
        - KPIs: ${profile.kpis}
        - Customer Types: ${profile.customerTypes}
        - Product Mix: ${profile.productMix}

        Data Sample (first few rows of a CSV file):
        """
        ${csvSnippet}
        """

        Based on the business profile and the data sample, please do the following:
        1.  Identify the most relevant column headers from the data.
        2.  Propose a clear, step-by-step plan for cleaning and preparing this data for analysis. Steps could include formatting dates, handling missing values, creating new calculated columns (like profit margin), or correcting data types. Each step should have a short title and a clear description. Keep the plan to 3-5 essential steps.
        3.  Suggest 2-3 specific analyses that would be valuable for this business, given their profile and the available data.

        Return your response in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: preparationPlanSchema,
                temperature: 0.1
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating preparation plan:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during plan generation.");
    }
};

export const analyzeData = async (profile: BusinessProfile, csvData: string, plan: PreparationPlan): Promise<AnalysisResult> => {
    const MAX_CSV_LENGTH = 100000; // Limit to 100k characters to avoid exceeding token limit
    const isTruncated = csvData.length > MAX_CSV_LENGTH;
    const truncatedCsvData = isTruncated ? csvData.substring(0, MAX_CSV_LENGTH) : csvData;

    const prompt = `
        Analyze the following CSV data for a business with this profile:
        - Sector: ${profile.sector}
        - KPIs: ${profile.kpis}
        - Customer Types: ${profile.customerTypes}
        - Product Mix: ${profile.productMix}

        The user has approved the following data preparation and analysis plan. Please follow these steps when conducting your analysis:
        ---
        PLAN:
        ${plan.steps.map(s => `- ${s.title}: ${s.description}`).join('\n')}
        
        SUGGESTED ANALYSIS:
        ${plan.analysisSuggestions.join(', ')}
        ---

        CSV Data:
        """
        ${truncatedCsvData}
        """
        ${isTruncated ? "\nNote: The provided CSV data has been truncated due to its size. Perform the analysis based on this representative sample." : ""}

        Perform the following tasks:
        1.  Create a concise title for the analysis.
        2.  Briefly summarize the automated data transformations you performed based on the approved plan.
        3.  Identify 3-4 key insights or metrics directly from the data that are relevant to the business's KPIs. Provide a metric name, its value, and a trend indicator (e.g., "+5% vs last period" or "Stable").
        4.  Provide a quantitative analysis summary. Use Markdown for formatting (e.g., bolding, lists).
        5.  Provide a qualitative analysis summary if there are text columns. If not, state that no qualitative analysis was possible. Use Markdown.
        6.  Generate 3 actionable recommendations across areas like Sales, Marketing, or Product.
        7.  Extract data for a relevant chart (bar or line). Choose the chart type that best represents a key aspect of the data. The data should be an array of objects with 'name' and 'value' keys.
        
        Return the entire response in the specified JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.2
            },
        });

        const jsonText = response.text.trim();
        const result: AnalysisResult = JSON.parse(jsonText);

        result.quantitativeAnalysis = await marked.parse(result.quantitativeAnalysis || '');
        result.qualitativeAnalysis = await marked.parse(result.qualitativeAnalysis || '');

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during analysis.");
    }
};