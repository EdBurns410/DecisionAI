
import React from 'react';
import { AnalysisResult, BusinessProfile, ChatMessage } from '../types';
import Spinner from './ui/Spinner';
import Card from './ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, Lightbulb, Bot } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface DashboardViewProps {
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
  fileName: string;
  businessProfile: BusinessProfile | null;
  csvData: string | null;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const MetricCard: React.FC<{ metric: string, value: string, trend: string }> = ({ metric, value, trend }) => (
  <Card className="p-4 flex-1 min-w-[200px] bg-gray-800/50">
    <p className="text-sm text-gray-400">{metric}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className={`text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trend}</p>
  </Card>
);

const DashboardView: React.FC<DashboardViewProps> = ({ isLoading, analysisResult, fileName, businessProfile, csvData, chatHistory, setChatHistory }) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner size="lg" />
        <h2 className="text-2xl font-semibold mt-4 text-white">Finalizing Dashboard...</h2>
        <p className="text-gray-400 mt-2">The AI is preparing your personalized insights and visualizations.</p>
      </div>
    );
  }

  if (!analysisResult) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold text-white">Analysis Failed</h2>
            <p className="text-gray-400 mt-2">Could not generate analysis. Please try uploading your data again.</p>
        </div>
    );
  }

  const { analysisTitle, keyInsights, chartData, chartType, quantitativeAnalysis, qualitativeAnalysis, recommendations, dataTransformationSummary } = analysisResult;

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }} />
          <Legend />
          <Bar dataKey="value" fill="#00A9FF" />
        </BarChart>
      );
    }
    return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis dataKey="name" stroke="#A0AEC0" />
        <YAxis stroke="#A0AEC0" />
        <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }} />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#00A9FF" strokeWidth={2} />
      </LineChart>
    );
  };
  
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">{analysisTitle} for <span className="text-brand-primary">{fileName}</span></h1>

        <div className="flex flex-wrap gap-4">
            {keyInsights.map(insight => <MetricCard key={insight.metric} {...insight} />)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="h-[400px]">
                    <h3 className="text-lg font-semibold text-white p-4">Visual Analysis</h3>
                    <ResponsiveContainer width="100%" height="90%">
                       {renderChart()}
                    </ResponsiveContainer>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card>
                    <div className="p-4">
                        <h3 className="flex items-center text-lg font-semibold text-white mb-2"><Bot className="mr-2 h-5 w-5 text-brand-secondary"/>Natural Language Query</h3>
                        <ChatInterface businessProfile={businessProfile} csvData={csvData} analysisResult={analysisResult} history={chatHistory} setHistory={setChatHistory} />
                    </div>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card>
                <div className="p-4">
                    <h3 className="flex items-center text-lg font-semibold text-white mb-2"><Lightbulb className="mr-2 h-5 w-5 text-brand-secondary"/>Actionable Recommendations</h3>
                    <ul className="space-y-3 text-sm">
                        {recommendations.map((rec, i) => (
                           <li key={i} className="p-3 bg-gray-800/50 rounded-md">
                               <strong className="text-brand-light">{rec.area}:</strong>
                               <p className="text-gray-300">{rec.recommendation}</p>
                           </li>
                        ))}
                    </ul>
                </div>
            </Card>
             <Card>
                <div className="p-4">
                    <h3 className="flex items-center text-lg font-semibold text-white mb-2"><TrendingUp className="mr-2 h-5 w-5 text-brand-secondary"/>Quantitative Analysis</h3>
                    <div className="prose prose-sm prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: quantitativeAnalysis }}></div>
                </div>
            </Card>
             <Card>
                <div className="p-4">
                    <h3 className="flex items-center text-lg font-semibold text-white mb-2"><FileText className="mr-2 h-5 w-5 text-brand-secondary"/>Qualitative Analysis</h3>
                    <div className="prose prose-sm prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: qualitativeAnalysis }}></div>
                </div>
            </Card>
        </div>

        <Card>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white">Data Transformation Summary</h3>
                <p className="text-sm text-gray-400">{dataTransformationSummary}</p>
            </div>
        </Card>
    </div>
  );
};

export default DashboardView;
