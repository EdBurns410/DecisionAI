import React, { useState, useCallback } from 'react';
import { BusinessProfile, AppView, AnalysisResult, ChatMessage, PreparationPlan } from './types';
import Sidebar from './components/Sidebar';
import BusinessProfileView from './components/BusinessProfileView';
import DataUploadView from './components/DataUploadView';
import DataPreparationView from './components/DataPreparationView';
import DashboardView from './components/DashboardView';
import { analyzeData, generatePreparationPlan } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.BUSINESS_PROFILE);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [preparationPlan, setPreparationPlan] = useState<PreparationPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleProfileSubmit = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    setCurrentView(AppView.DATA_UPLOAD);
  };

  const handleDataUpload = useCallback(async (data: string, name: string) => {
    if (!businessProfile) {
      setError("Business profile is not set. Please go back.");
      return;
    }
    setCsvData(data);
    setFileName(name);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPreparationPlan(null);

    try {
      const plan = await generatePreparationPlan(businessProfile, data);
      setPreparationPlan(plan);
      setCurrentView(AppView.DATA_PREPARATION);
    } catch (e) {
      if (e instanceof Error) {
        setError(`An error occurred while preparing your data: ${e.message}.`);
      } else {
        setError("An unexpected error occurred during data preparation.");
      }
      setCurrentView(AppView.DATA_UPLOAD);
    } finally {
      setIsLoading(false);
    }
  }, [businessProfile]);
  
  const handlePlanApproval = useCallback(async () => {
    if (!businessProfile || !csvData || !preparationPlan) {
        setError("Missing required information to generate dashboard.");
        setCurrentView(AppView.DATA_UPLOAD);
        return;
    }

    setCurrentView(AppView.DASHBOARD);
    setIsLoading(true);
    setError(null);

    try {
        const result = await analyzeData(businessProfile, csvData, preparationPlan);
        setAnalysisResult(result);

        const welcomeMessage: ChatMessage = {
            role: 'model',
            content: `Welcome! I've analyzed your data from **${fileName}** based on your business profile and the approved preparation plan. You can now ask me questions about it.`
        };
        setChatHistory([welcomeMessage]);

    } catch (e) {
        if (e instanceof Error) {
            setError(`An error occurred while analyzing data: ${e.message}. Please check your API key and prompt.`);
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
        setCurrentView(AppView.DATA_PREPARATION); // Revert to plan view on error
    } finally {
        setIsLoading(false);
    }
  }, [businessProfile, csvData, preparationPlan, fileName]);

  const resetApp = () => {
    setCurrentView(AppView.BUSINESS_PROFILE);
    setBusinessProfile(null);
    setCsvData(null);
    setFileName('');
    setAnalysisResult(null);
    setPreparationPlan(null);
    setIsLoading(false);
    setError(null);
    setChatHistory([]);
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case AppView.BUSINESS_PROFILE:
        return <BusinessProfileView onSubmit={handleProfileSubmit} />;
      case AppView.DATA_UPLOAD:
        return <DataUploadView onUpload={handleDataUpload} isLoading={isLoading} error={error} />;
      case AppView.DATA_PREPARATION:
        return <DataPreparationView
                  plan={preparationPlan}
                  csvData={csvData}
                  onApprove={handlePlanApproval}
                  onGoBack={() => setCurrentView(AppView.DATA_UPLOAD)}
                  isLoading={isLoading && !preparationPlan}
                />;
      case AppView.DASHBOARD:
        return (
          <DashboardView
            isLoading={isLoading}
            analysisResult={analysisResult}
            fileName={fileName}
            businessProfile={businessProfile}
            csvData={csvData}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        );
      default:
        return <BusinessProfileView onSubmit={handleProfileSubmit} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isProfileSet={!!businessProfile}
        isDataUploaded={!!csvData}
        isPlanApproved={!!analysisResult}
        onReset={resetApp}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;