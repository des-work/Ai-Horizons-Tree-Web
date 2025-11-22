
import React, { useState, useEffect, useCallback } from 'react';
import GraphVisualization from './components/GraphVisualization';
import DetailPanel from './components/DetailPanel';
import { generateSkillTree, FALLBACK_DATA } from './services/geminiService';
import { SkillTreeData, SkillNode } from './types';

// Use a resize hook to make the D3 graph responsive
const useResizeObserver = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return dimensions;
};

const App: React.FC = () => {
  const [data, setData] = useState<SkillTreeData>(FALLBACK_DATA);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("AI Software Engineering");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const graphContainerRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver(graphContainerRef);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setSelectedNode(null);
    setIsSidebarOpen(false);
    
    try {
      const newData = await generateSkillTree(prompt);
      setData(newData);
    } catch (err) {
      console.error("Failed to generate tree", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: SkillNode) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  }, []);

  const handleNavigateNode = useCallback((nodeId: string) => {
    const node = data.nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsSidebarOpen(true);
    }
  }, [data]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-20 relative overflow-hidden">
        {/* Sunrise gradient line at bottom of header */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 via-orange-500 to-yellow-500"></div>

        <div className="flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/30">
                {/* Sun Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Horizons</span></h1>
        </div>

        {/* Search / Generate Bar */}
        <form onSubmit={handleGenerate} className="flex-1 max-w-xl mx-6 relative group hidden md:block z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-orange-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter interest, major, career field, or project..."
                className="block w-full pl-10 pr-24 py-2 border border-slate-700 rounded-full leading-5 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition-all shadow-sm"
            />
            <button 
                type="submit"
                disabled={isLoading}
                className="absolute inset-y-1 right-1 px-4 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all shadow-md"
            >
                {isLoading ? 'Scanning...' : 'Explore'}
            </button>
        </form>

        <div className="flex items-center gap-4 text-sm text-slate-400 z-10">
           <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
           <span className="font-mono text-xs opacity-50">v4.0.1-horizon</span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Graph Area */}
        <div ref={graphContainerRef} className="flex-1 relative bg-slate-950">
            {/* Mobile Search Overlay */}
            <div className="md:hidden absolute top-4 left-4 right-4 z-20">
                <form onSubmit={handleGenerate} className="flex gap-2">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-full bg-slate-800/90 backdrop-blur border border-slate-700 text-sm focus:border-orange-500 focus:outline-none"
                        placeholder="Interest, career, or project..."
                    />
                    <button type="submit" className="p-2 bg-orange-600 rounded-full text-white">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                         </svg>
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full opacity-25"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-4 text-orange-400 font-mono text-sm animate-pulse">Illuminating Horizon...</p>
                </div>
            )}
            
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
                onClose={() => {
                    setIsSidebarOpen(false);
                    setSelectedNode(null);
                }} 
            />
        </aside>

      </main>
    </div>
  );
};

export default App;
