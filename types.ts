export enum AppView {
    BUSINESS_PROFILE = 'business_profile',
    DATA_UPLOAD = 'data_upload',
    DATA_PREPARATION = 'data_preparation',
    DASHBOARD = 'dashboard',
}

export interface BusinessProfile {
    sector: string;
    kpis: string;
    customerTypes: string;
    productMix: string;
}

export interface PreparationStep {
    title: string;
    description: string;
}

export interface PreparationPlan {
    identifiedColumns: string[];
    steps: PreparationStep[];
    analysisSuggestions: string[];
}

export interface KeyInsight {
    metric: string;
    value: string;
    trend: string;
}

export interface Recommendation {
    area: string;
    recommendation: string;
}

export interface ChartData {
    name: string;
    value: number;
}

export interface AnalysisResult {
    analysisTitle: string;
    dataTransformationSummary: string;
    keyInsights: KeyInsight[];
    quantitativeAnalysis: string;
    qualitativeAnalysis: string;
    recommendations: Recommendation[];
    chartData: ChartData[];
    chartType: 'bar' | 'line';
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}