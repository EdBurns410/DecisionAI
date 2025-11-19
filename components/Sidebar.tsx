import React from 'react';
import { AppView } from '../types';
import { BarChart2, FileUp, Home, User, Zap, ClipboardCheck } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isProfileSet: boolean;
  isDataUploaded: boolean;
  isPlanApproved: boolean;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isProfileSet, isDataUploaded, isPlanApproved, onReset }) => {
    
  const NavItem = ({ icon, label, view, enabled }: { icon: React.ReactNode, label: string, view: AppView, enabled: boolean }) => {
    const isActive = currentView === view;
    const isCompleted = (view === AppView.BUSINESS_PROFILE && isProfileSet) || 
                        (view === AppView.DATA_UPLOAD && isDataUploaded) ||
                        (view === AppView.DATA_PREPARATION && isPlanApproved);

    return (
      <button
        onClick={() => onNavigate(view)}
        disabled={!enabled}
        className={`w-full flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-sm ${
          isActive
            ? 'bg-brand-primary/20 text-brand-primary'
            : enabled
            ? 'text-gray-300 hover:bg-gray-700'
            : 'text-gray-600 cursor-not-allowed'
        } ${isCompleted && !isActive ? 'text-green-400' : ''}`}
      >
        {icon}
        <span className="ml-3">{label}</span>
        {isCompleted && <span className="ml-auto text-xs">✓</span>}
      </button>
    );
  };

  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col h-full border-r border-gray-700/50">
      <div className="flex items-center mb-8">
        <Zap className="text-brand-primary h-8 w-8" />
        <h1 className="text-xl font-bold ml-2 text-white">Decision AI</h1>
      </div>
      
      <div className="flex-grow">
        <NavItem 
          icon={<User size={20} />} 
          label="Business Profile" 
          view={AppView.BUSINESS_PROFILE} 
          enabled={true} 
        />
        <NavItem 
          icon={<FileUp size={20} />} 
          label="Upload Data" 
          view={AppView.DATA_UPLOAD} 
          enabled={isProfileSet} 
        />
        <NavItem 
          icon={<ClipboardCheck size={20} />} 
          label="Preparation Plan" 
          view={AppView.DATA_PREPARATION} 
          enabled={isDataUploaded} 
        />
        <NavItem 
          icon={<BarChart2 size={20} />} 
          label="Dashboard" 
          view={AppView.DASHBOARD} 
          enabled={isPlanApproved} 
        />
      </div>

      <div className="mt-auto">
        <button
            onClick={onReset}
            className="w-full flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400"
        >
          <Home size={20} />
          <span className="ml-3">Start Over</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;