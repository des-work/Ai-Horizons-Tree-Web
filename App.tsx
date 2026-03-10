import React, { useState, useCallback, useRef, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import DetailPanel from './components/DetailPanel';
import AddNodeModal from './components/AddNodeModal';
import SunsetBackground from './components/SunsetBackground';
import { generateSkillTree, FALLBACK_DATA, fetchAvailableModels, OllamaModel } from './services/geminiService';
import { SkillTreeData, SkillNode, SkillLink } from './types';
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

/** Model selector dropdown for local Ollama models */
interface ModelSelectorProps {
  models: OllamaModel[];
  selectedModel: string;
  onSelect: (model: string) => void;
  isLoading: boolean;
  ollamaConnected: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelect, isLoading, ollamaConnected }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  };

  const displayName = selectedModel
    ? selectedModel.split(':')[0]
    : 'No model';

  return (
    <div ref={dropdownRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
          ollamaConnected
            ? 'border-slate-600 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 bg-slate-800/50'
            : 'border-red-800 text-red-400 bg-red-950/30'
        } disabled:opacity-50`}
        title={ollamaConnected ? `Active model: ${selectedModel}` : 'Ollama not connected'}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ollamaConnected ? 'bg-green-400' : 'bg-red-500'}`} />
        <span className="max-w-[100px] truncate">{displayName}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local Models (Ollama)</p>
          </div>
          {models.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-500">No models found</p>
              <p className="text-[10px] text-slate-600 mt-1">Run <code className="text-orange-400">ollama pull llama3.2</code></p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {models.map((m) => {
                const isActive = m.name === selectedModel;
                return (
                  <button
                    key={m.name}
                    onClick={() => { onSelect(m.name); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-orange-500/10 border-l-2 border-orange-500'
                        : 'hover:bg-slate-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-orange-400' : 'text-slate-300'}`}>
                        {m.name.split(':')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {m.parameterSize && <span>{m.parameterSize}</span>}
                        {m.parameterSize && m.family && <span> · </span>}
                        {m.family && <span>{m.family}</span>}
                        {(m.parameterSize || m.family) && <span> · </span>}
                        <span>{formatSize(m.size)}</span>
                      </p>
                    </div>
                    {isActive && (
                      <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Header logo component */
const Logo: React.FC = () => (
  <div className="flex items-center gap-3 z-10">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/30">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <h1 className="font-bold text-xl tracking-tight text-white">
      AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Horizon</span>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default so Add/Stack controls are visible
  const [variation, setVariation] = useState<number>(0);
  const [apiCallCount, setApiCallCount] = useState<number>(0);
  const [lastResultFromCache, setLastResultFromCache] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userStack, setUserStack] = useState<Set<string>>(new Set());
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // Refs and hooks
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const lastApiCallRef = useRef<number>(0);
  const { width, height } = useResizeObserver(graphContainerRef);

  // Sync API count from localStorage on mount + fetch Ollama models
  useEffect(() => {
    setApiCallCount(getApiCallCount());

    fetchAvailableModels().then((models) => {
      setOllamaModels(models);
      setOllamaConnected(models.length > 0);
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0].name);
      }
    });
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
      setUserStack(new Set());
      setError(null);
      setIsSidebarOpen(true);
      return;
    }

    setLastResultFromCache(false);
    setIsLoading(true);
    setSelectedNode(null);
    setIsSidebarOpen(false);
    setError(null);
    lastApiCallRef.current = now;

    try {
      const newData = await generateSkillTree(prompt.trim(), newVariation, selectedModel || undefined);
      setData(newData);
      setUserStack(new Set());

      // Cache and count only real API results (not fallback data)
      if (newData.projectSummary) {
        setCachedResult(prompt.trim(), newVariation, newData);
        setApiCallCount(incrementApiCallCount());
      }

      // Open sidebar to show AI insight
      setSelectedNode(null);
      setIsSidebarOpen(true);
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

  const handleNodeClick = useCallback((node: SkillNode | null) => {
    if (node === null) {
      // Clicking background - deselect and close sidebar
      setSelectedNode(null);
      setIsSidebarOpen(false);
    } else {
      setSelectedNode(node);
      setIsSidebarOpen(true);
    }
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


  const handleRemoveNode = useCallback((nodeId: string) => {
    setData((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      links: prev.links.filter((l) => l.source !== nodeId && l.target !== nodeId),
    }));
    setSelectedNode(null);
    setIsSidebarOpen(false);
  }, []);

  const handleAddNode = useCallback((node: SkillNode, linkFromId?: string) => {
    setData((prev) => {
      const newLinks: SkillLink[] = linkFromId
        ? [...prev.links, { source: linkFromId, target: node.id, relationship: 'enables' }]
        : prev.links;
      return {
        ...prev,
        nodes: [...prev.nodes, node],
        links: newLinks,
      };
    });
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleAddToStack = useCallback((nodeId: string) => {
    setUserStack((prev) => new Set(prev).add(nodeId));
  }, []);

  const handleRemoveFromStack = useCallback((nodeId: string) => {
    setUserStack((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
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

          <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-400 z-10 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-600 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-all text-xs font-medium"
              title="Add new node to graph"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
              New node
            </button>
            <button
              type="button"
              onClick={handleOpenSidebar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-600 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 transition-all text-xs font-medium"
              title="Open stack panel"
            >
              Stack
            </button>
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
            <ApiCallCounter apiCalls={apiCallCount} fromCache={lastResultFromCache} />
            <ModelSelector
              models={ollamaModels}
              selectedModel={selectedModel}
              onSelect={setSelectedModel}
              isLoading={isLoading}
              ollamaConnected={ollamaConnected}
            />
            <span className="font-mono text-xs opacity-50 hidden sm:inline">v4.3.0-horizon</span>
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

          {/* Loading Overlay */}
          {isLoading && <LoadingOverlay />}

          {/* Graph Visualization */}
          {width > 0 && height > 0 && (
            <GraphVisualization
              data={data}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id || null}
              userStackIds={userStack}
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
            userStack={userStack}
            currentTopic={prompt}
            onNavigate={handleNavigateNode}
            onClose={handleCloseSidebar}
            onAddToStack={handleAddToStack}
            onRemoveFromStack={handleRemoveFromStack}
            onRemoveNode={handleRemoveNode}
            onAddNewNode={() => setShowAddModal(true)}
          />
        </aside>
      </main>

      {showAddModal && (
        <AddNodeModal
          data={data}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default App;
