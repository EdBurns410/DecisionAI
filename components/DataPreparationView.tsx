import React from 'react';
import { PreparationPlan } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { ArrowRight, Table, ListChecks, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface DataPreparationViewProps {
  plan: PreparationPlan | null;
  csvData: string | null;
  onApprove: () => void;
  onGoBack: () => void;
  isLoading: boolean;
}

const DataPreparationView: React.FC<DataPreparationViewProps> = ({ plan, csvData, onApprove, onGoBack, isLoading }) => {
  const dataPreview = React.useMemo(() => {
    if (!csvData) return { headers: [], rows: [] };
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
    return { headers, rows };
  }, [csvData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner size="lg" />
        <h2 className="text-2xl font-semibold mt-4 text-white">AI is preparing your plan...</h2>
        <p className="text-gray-400 mt-2">Analyzing data structure and formulating a strategy.</p>
      </div>
    );
  }
  
  if (!plan) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold text-white">Plan Generation Failed</h2>
            <p className="text-gray-400 mt-2">Could not generate a preparation plan. Please try uploading your data again.</p>
            <Button onClick={onGoBack} className="mt-4">Go Back</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Review AI Preparation Plan</h1>
      <p className="text-gray-400">The AI has inspected your data and suggests the following plan. Approve to proceed with dashboard generation.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <div className="p-4">
                <h3 className="flex items-center text-lg font-semibold text-white mb-3"><Table className="mr-2 h-5 w-5 text-brand-secondary"/>Data Preview</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>{dataPreview.headers.map((h, i) => <th key={i} className="px-4 py-2">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {dataPreview.rows.map((row, i) => (
                                <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                                    {row.map((cell, j) => <td key={j} className="px-4 py-2 truncate max-w-[150px]">{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>

        <Card>
            <div className="p-4">
                <h3 className="flex items-center text-lg font-semibold text-white mb-3"><BrainCircuit className="mr-2 h-5 w-5 text-brand-secondary"/>Analysis Suggestions</h3>
                <ul className="space-y-2 text-sm list-disc list-inside text-gray-300">
                    {plan.analysisSuggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                </ul>
            </div>
        </Card>
      </div>

      <Card>
        <div className="p-4">
            <h3 className="flex items-center text-lg font-semibold text-white mb-3"><ListChecks className="mr-2 h-5 w-5 text-brand-secondary"/>Proposed Steps</h3>
            <div className="space-y-3">
                {plan.steps.map((step, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white">{step.title}</p>
                            <p className="text-sm text-gray-400">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </Card>
      
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={onGoBack} variant="secondary">Back to Upload</Button>
        <Button onClick={onApprove}>
            Approve & Generate Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DataPreparationView;