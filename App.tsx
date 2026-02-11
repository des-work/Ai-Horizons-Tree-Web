import React, { useState, useCallback, useRef, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import DetailPanel from './components/DetailPanel';
import SunsetBackground from './components/SunsetBackground';
import { generateSkillTree, FALLBACK_DATA } from './services/geminiService';
import { SkillTreeData, SkillNode } from './types';
import { useResizeObserver } from './hooks/useResizeObserver';
import {
  getCachedResult,
  setCachedResult,
  incrementApiCallCount,
  getApiCallCount,
} from './utils/cacheUtils';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Loading overlay with spinner */
const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full opacity-25"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-orange-400 font-mono text-sm animate-pulse">Illuminating Horizon...</p>
  </div>
);

/** Project Summary Card */
interface ProjectSummaryProps {
  summary: string;
  onDismiss: () => void;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ summary, onDismiss }) => (
  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full mx-4">
    <div className="bg-gradient-to-r from-orange-900/90 via-rose-900/90 to-purple-900/90 border border-orange-500/50 rounded-lg px-6 py-4 backdrop-blur-sm shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-orange-300 mb-2 flex items-center gap-2">
            💡 Example Project
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

/** Error banner component */
interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => (
  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
    <div className="bg-red-900/90 border border-red-700 rounded-lg px-4 py-3 flex items-start gap-3 backdrop-blur-sm shadow-lg">
      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-200">{message}</p>
        <p className="text-xs text-red-400 mt-1">Using fallback data instead.</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 transition-colors"
        aria-label="Dismiss error"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

/** API call counter - shows usage to help manage costs */
const ApiCallCounter: React.FC<{ apiCalls: number; fromCache: boolean }> = ({
  apiCalls,
  fromCache,
}) => (
  <div
    className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-slate-800/50 border border-slate-700"
    title="API calls today (cached results don't count)"
  >
    <span className="text-xs text-slate-400">API:</span>
    <span className="text-xs font-mono text-amber-400">{apiCalls}</span>
    {fromCache && (
      <span className="text-[10px] text-green-400" title="Last result from cache">
        ✓ cached
      </span>
    )}
  </div>
);

/** Header logo component */
const Logo: React.FC = () => (
  <div className="flex items-center gap-3 z-10">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/30">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <h1 className="font-bold text-xl tracking-tight text-white">
      AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Horizons</span>
    </h1>
  </div>
);

/** Search icon component */
const SearchIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

/** Desktop search bar */
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onShuffle: () => void;
  isLoading: boolean;
}

const DesktopSearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, onShuffle, isLoading }) => (
  <form onSubmit={onSubmit} className="flex-1 max-w-xl mx-6 relative group hidden md:block z-10">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon className="h-5 w-5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your field, area of study, or project type..."
      className="block w-full pl-10 pr-32 py-2 border border-slate-700 rounded-full leading-5 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all shadow-sm"
    />
    <div className="absolute inset-y-1 right-1 flex gap-1">
      <button
        type="button"
        onClick={onShuffle}
        disabled={isLoading}
        className="px-3 border border-slate-600 text-xs font-medium rounded-full text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all flex items-center gap-1"
        title="Show different tool combinations"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Shuffle
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all shadow-md"
      >
        {isLoading ? 'Scanning...' : 'Explore'}
      </button>
    </div>
  </form>
);

/** Mobile search overlay */
const MobileSearchOverlay: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, onShuffle, isLoading }) => (
  <div className="md:hidden absolute top-4 left-4 right-4 z-20">
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-2 rounded-full bg-slate-800/90 backdrop-blur border border-slate-700 text-sm focus:border-orange-500 focus:outline-none"
        placeholder="Field, area, or project..."
      />
      <button
        type="button"
        onClick={onShuffle}
        disabled={isLoading}
        className="p-2 bg-slate-700 rounded-full text-white disabled:opacity-50"
        aria-label="Shuffle"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="p-2 bg-orange-600 rounded-full text-white disabled:opacity-50"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const COOLDOWN_MS = 1500; // Prevent rapid API calls

const App: React.FC = () => {
  // State
  const [data, setData] = useState<SkillTreeData>(FALLBACK_DATA);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Healthcare Projects');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [variation, setVariation] = useState<number>(0);
  const [showProjectSummary, setShowProjectSummary] = useState(false);
  const [apiCallCount, setApiCallCount] = useState<number>(0);
  const [lastResultFromCache, setLastResultFromCache] = useState<boolean>(false);

  // Refs and hooks
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const lastApiCallRef = useRef<number>(0);
  const { width, height } = useResizeObserver(graphContainerRef);

  // Sync API count from localStorage on mount
  useEffect(() => {
    setApiCallCount(getApiCallCount());
  }, []);

  // Handlers
  const handleGenerate = async (e?: React.FormEvent, shuffle: boolean = false) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    // Cooldown: prevent rapid double-clicks
    const now = Date.now();
    if (now - lastApiCallRef.current < COOLDOWN_MS) {
      return; // Ignore rapid clicks
    }

    const newVariation = shuffle ? variation + 1 : 0;
    setVariation(newVariation);

    // Check cache first (saves API costs!)
    const cached = getCachedResult(prompt.trim(), newVariation);
    if (cached) {
      setData(cached);
      setLastResultFromCache(true);
      setSelectedNode(null);
      setIsSidebarOpen(false);
      setError(null);
      if (cached.projectSummary) setShowProjectSummary(true);
      return;
    }

    setLastResultFromCache(false);
    setIsLoading(true);
    setSelectedNode(null);
    setIsSidebarOpen(false);
    setError(null);
    lastApiCallRef.current = now;

    try {
      const newData = await generateSkillTree(prompt.trim(), newVariation);
      setData(newData);

      // Cache and count only real API results (not fallback data)
      if (newData.projectSummary) {
        setCachedResult(prompt.trim(), newVariation, newData);
        setApiCallCount(incrementApiCallCount());
        setShowProjectSummary(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Failed to generate tree:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffle = () => {
    handleGenerate(undefined, true);
  };

  const handleQuickExample = (example: string) => {
    setPrompt(example);
    setVariation(0); // Reset variation for new topic
    setTimeout(() => {
      handleGenerate(undefined, false);
    }, 100);
  };

  const handleNodeClick = useCallback((node: SkillNode) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  }, []);

  const handleNavigateNode = useCallback(
    (nodeId: string) => {
      const node = data.nodes.find(n => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setIsSidebarOpen(true);
      }
    },
    [data]
  );

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedNode(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleDismissProjectSummary = useCallback(() => {
    setShowProjectSummary(false);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="main-page-header flex-none border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-20 relative overflow-hidden">
        {/* Sunrise gradient line at bottom of header */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 via-orange-500 to-yellow-500"></div>

        {/* Top bar with logo and search */}
        <div className="h-16 flex items-center justify-between px-6">
          <Logo />

          <DesktopSearchBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            onShuffle={handleShuffle}
            isLoading={isLoading}
          />

          <div className="flex items-center gap-4 text-sm text-slate-400 z-10">
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
            <ApiCallCounter apiCalls={apiCallCount} fromCache={lastResultFromCache} />
            <span className="font-mono text-xs opacity-50">v4.2.0-horizon</span>
          </div>
        </div>

        {/* Quick Examples Bar */}
        <div className="hidden md:flex items-center gap-2 px-6 pb-3 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick start:</span>
          {[
            'Healthcare Projects',
            'Marketing Content',
            'Data Analysis',
            'Mobile App Development',
            'Legal Research',
            'Educational Content',
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleQuickExample(example)}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500/50 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {example}
            </button>
          ))}
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Graph Area with sunset background */}
        <div ref={graphContainerRef} className="main-page-graph flex-1 relative overflow-hidden">
          <SunsetBackground />
          {/* Mobile Search */}
          <MobileSearchOverlay
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            onShuffle={handleShuffle}
            isLoading={isLoading}
          />

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onDismiss={handleDismissError} />}

          {/* Project Summary */}
          {showProjectSummary && data.projectSummary && (
            <ProjectSummary summary={data.projectSummary} onDismiss={handleDismissProjectSummary} />
          )}

          {/* Loading Overlay */}
          {isLoading && <LoadingOverlay />}

          {/* Graph Visualization */}
          {width > 0 && height > 0 && (
            <GraphVisualization
              data={data}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id || null}
              width={width}
              height={height}
            />
          )}
        </div>

        {/* Sidebar Panel */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-30 w-full sm:w-96 transform transition-transform duration-300 ease-in-out shadow-2xl
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            sm:relative sm:transform-none sm:w-96 sm:flex-none sm:border-l sm:border-slate-800
            ${!isSidebarOpen && 'sm:hidden'}
          `}
        >
          <DetailPanel
            node={selectedNode}
            data={data}
            onNavigate={handleNavigateNode}
            onClose={handleCloseSidebar}
          />
        </aside>
      </main>
    </div>
  );
};

export default App;
