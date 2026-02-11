import React from 'react';
import { SkillNode, NodeType, SkillTreeData } from '../types';
import { getCategoryClasses, getIncomingConnections, getOutgoingConnections, NodeConnection } from '../utils/graphUtils';

// ============================================================================
// TYPES
// ============================================================================

interface DetailPanelProps {
  node: SkillNode | null;
  data: SkillTreeData;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Empty state shown when no node is selected */
const EmptyState: React.FC = () => (
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
          Discover how AI tools can accelerate your projects—whether you're in healthcare, marketing, education, or any field.
        </p>
        <p className="text-orange-400 font-medium mt-4">
          🔍 Enter your field or project type above and click "Explore"
        </p>
        <p className="text-purple-400 font-medium">
          🔀 Click "Shuffle" to see different tool combinations
        </p>
        <p className="text-amber-400 font-medium">
          👆 Click any node to see practical usage examples
        </p>
        <p className="text-xs italic opacity-70 mt-4">
          The graph shows you which tools to use, how they connect, and specific ways to apply them to real projects in your field.
        </p>
      </div>
    </div>
  </div>
);

/** Individual connection item in the lattice view */
interface ConnectionItemProps {
  connection: NodeConnection;
  onNavigate: (nodeId: string) => void;
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ connection, onNavigate }) => {
  if (!connection.node) return null;

  return (
    <div
      onClick={() => onNavigate(connection.node!.id)}
      className="group flex items-center justify-between p-2 bg-slate-800/40 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 cursor-pointer transition-all"
    >
      <span className="text-sm text-slate-300 group-hover:text-white">
        {connection.node.label}
      </span>
      <span className="text-[10px] text-slate-500 italic">{connection.relationship}</span>
    </div>
  );
};

/** Timeline marker icon */
interface TimelineMarkerProps {
  type: 'up' | 'current' | 'down';
}

const TimelineMarker: React.FC<TimelineMarkerProps> = ({ type }) => {
  if (type === 'current') {
    return (
      <div className="absolute left-0 top-1 w-6 h-6 -ml-3 flex items-center justify-center bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] rounded-full z-10">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 w-6 h-6 -ml-3 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-full z-10">
      <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={type === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    </div>
  );
};

// ============================================================================
// ICONS
// ============================================================================

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExternalLinkIcon: React.FC = () => (
  <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DetailPanel: React.FC<DetailPanelProps> = ({ node, data, onClose, onNavigate }) => {
  if (!node) {
    return <EmptyState />;
  }

  // Compute connections using utility functions
  const incoming = getIncomingConnections(node.id, data);
  const outgoing = getOutgoingConnections(node.id, data);
  const categoryClasses = getCategoryClasses(node.category);

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl transition-all duration-300">
      {/* Header Section */}
      <div className="flex-none p-6 border-b border-slate-800 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500/50 to-transparent opacity-50"></div>

        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest border ${categoryClasses}`}>
            {node.category}
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
            aria-label="Close panel"
          >
            <CloseIcon />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{node.label}</h2>

        <div className="flex flex-wrap gap-2">
          {node.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">About this Node</h3>
          <div className="prose prose-invert prose-sm bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
            <p className="text-slate-300 leading-relaxed">{node.description}</p>
            {node.link && (
              <a
                href={node.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
              >
                Visit Official Platform
                <ExternalLinkIcon />
              </a>
            )}
            {node.category === NodeType.INFRASTRUCTURE && (
              <p className="text-cyan-400/80 text-xs mt-2 italic border-t border-slate-700/50 pt-2">
                * This is a foundational tool for the ecosystem, distinct from core AI models.
              </p>
            )}
          </div>
        </div>

        {/* Lattice Connections Visualization */}
        <div className="space-y-0 relative">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Lattice Connections</h3>
          <div className="absolute left-3 top-8 bottom-0 w-px bg-slate-800"></div>

          {/* UPSTREAM - Nodes that this node is built upon */}
          <div className="relative pb-6 pl-8">
            <TimelineMarker type="up" />
            <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Built Upon</h4>

            {incoming.length > 0 ? (
              <div className="space-y-2">
                {incoming.map((connection, idx) => (
                  <ConnectionItem key={idx} connection={connection} onNavigate={onNavigate} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic p-2">Horizon Node (Foundation)</div>
            )}
          </div>

          {/* CURRENT - Selected node indicator */}
          <div className="relative pb-6 pl-8">
            <TimelineMarker type="current" />
            <div className="py-2 px-3 bg-gradient-to-r from-orange-900/30 to-transparent rounded border-l-2 border-orange-500">
              <span className="text-sm font-bold text-orange-400 block">Current Selection</span>
            </div>
          </div>

          {/* DOWNSTREAM - Nodes that this node unlocks */}
          <div className="relative pl-8">
            <TimelineMarker type="down" />
            <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Unlocks & Enables</h4>

            {outgoing.length > 0 ? (
              <div className="space-y-2">
                {outgoing.map((connection, idx) => (
                  <ConnectionItem key={idx} connection={connection} onNavigate={onNavigate} />
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
          {node.resources && node.resources.length > 0 ? (
            node.resources.map((res, i) => (
              <li key={i} className="flex items-center text-sm text-amber-400 hover:text-amber-300 transition-colors truncate">
                <LinkIcon />
                <a href={res} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                  {res}
                </a>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-600 italic">No additional resources available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DetailPanel;
