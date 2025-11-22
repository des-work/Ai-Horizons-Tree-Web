
import React from 'react';
import { SkillNode, NodeType, SkillTreeData } from '../types';

interface DetailPanelProps {
  node: SkillNode | null;
  data: SkillTreeData;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, data, onClose, onNavigate }) => {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"></div>
        
        <div className="max-w-sm flex flex-col items-center z-10">
            <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-b from-orange-400/20 to-purple-600/20 flex items-center justify-center border border-orange-500/30 relative">
                <div className="absolute inset-0 rounded-full border border-orange-400/20 animate-pulse"></div>
                <span className="text-5xl">☀️</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">The AI Horizon</h3>
            
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  Every day the world of AI gets introduced to another tool. This may seem confusing and dense at first.
                </p>
                <p>
                  But with exploration and investigation of these tools and concepts, it becomes clear.
                </p>
                <p className="text-orange-400 font-medium mt-4">
                   Click on a node to visualize this idea.
                </p>
                <p className="text-xs italic opacity-70">
                  Watch as the orientation of the lattice becomes distinguishable, revealing the path from foundation to future.
                </p>
            </div>
        </div>
      </div>
    );
  }

  // --- Compute Connections ---
  const incoming = data.links
    .filter(l => {
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return targetId === node.id;
    })
    .map(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        return {
            node: data.nodes.find(n => n.id === sourceId),
            rel: l.relationship
        };
    });

  const outgoing = data.links
    .filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        return sourceId === node.id;
    })
    .map(l => {
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return {
            node: data.nodes.find(n => n.id === targetId),
            rel: l.relationship
        };
    });

  // Sunrise Palette Colors
  const getCategoryColor = (cat: NodeType) => {
     switch (cat) {
      case NodeType.CORE: return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
      case NodeType.TOOL: return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
      case NodeType.INFRASTRUCTURE: return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
      case NodeType.CONCEPT: return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
      case NodeType.SKILL: return 'text-rose-400 border-rose-400/20 bg-rose-400/5';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl transition-all duration-300">
      
      {/* Header Section */}
      <div className="flex-none p-6 border-b border-slate-800 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500/50 to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${getCategoryColor(node.category)}`}>
                {node.category}
            </span>
            <button 
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{node.label}</h2>
          
          <div className="flex flex-wrap gap-2">
             {node.tags.map(tag => (
                 <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">#{tag}</span>
             ))}
          </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">About this Node</h3>
            <div className="prose prose-invert prose-sm bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
                <p className="text-slate-300 leading-relaxed">{node.description}</p>
                {node.category === NodeType.INFRASTRUCTURE && (
                    <p className="text-cyan-400/80 text-xs mt-2 italic border-t border-slate-700/50 pt-2">
                        * This is a foundational tool for the ecosystem, distinct from core AI models.
                    </p>
                )}
            </div>
          </div>

          {/* Visualization of Flow */}
          <div className="space-y-0 relative">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Lattice Connections</h3>
             <div className="absolute left-3 top-8 bottom-0 w-px bg-slate-800"></div>
             
             {/* UPSTREAM */}
             <div className="relative pb-6 pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 -ml-3 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-full z-10">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </div>
                <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Built Upon</h4>
                
                {incoming.length > 0 ? (
                    <div className="space-y-2">
                        {incoming.map((item, idx) => (
                            <div key={idx} onClick={() => item.node && onNavigate(item.node.id)} className="group flex items-center justify-between p-2 bg-slate-800/40 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 cursor-pointer transition-all">
                                <span className="text-sm text-slate-300 group-hover:text-white">{item.node?.label}</span>
                                <span className="text-[10px] text-slate-500 italic">{item.rel}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-600 italic p-2">Horizon Node (Foundation)</div>
                )}
             </div>

             {/* CURRENT */}
             <div className="relative pb-6 pl-8">
                 <div className="absolute left-0 top-1 w-6 h-6 -ml-3 flex items-center justify-center bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] rounded-full z-10">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
                 <div className="py-2 px-3 bg-gradient-to-r from-orange-900/30 to-transparent rounded border-l-2 border-orange-500">
                    <span className="text-sm font-bold text-orange-400 block">Current Selection</span>
                 </div>
             </div>

             {/* DOWNSTREAM */}
             <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 -ml-3 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-full z-10">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Unlocks & Enables</h4>
                
                {outgoing.length > 0 ? (
                    <div className="space-y-2">
                        {outgoing.map((item, idx) => (
                            <div key={idx} onClick={() => item.node && onNavigate(item.node.id)} className="group flex items-center justify-between p-2 bg-slate-800/40 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 cursor-pointer transition-all">
                                <span className="text-sm text-slate-300 group-hover:text-white">{item.node?.label}</span>
                                <span className="text-[10px] text-slate-500 italic">{item.rel}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-600 italic p-2">Zenith Node (Pinnacle)</div>
                )}
             </div>
          </div>

      </div>

      {/* Footer / Resources */}
      <div className="flex-none p-6 border-t border-slate-800 bg-slate-900/50">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Resources</h3>
         <ul className="space-y-2">
            {node.resources && node.resources.length > 0 ? node.resources.map((res, i) => (
                <li key={i} className="flex items-center text-sm text-amber-400 hover:text-amber-300 cursor-pointer transition-colors truncate">
                    <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="truncate">{res}</span>
                </li>
            )) : (
                <li className="text-xs text-slate-600 italic">No external links generated.</li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default DetailPanel;
