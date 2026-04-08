import React from 'react';
import { SkillNode, NodeType, SkillTreeData } from '../types';
import { getCategoryClasses, getIncomingConnections, getOutgoingConnections, NodeConnection } from '../utils/graphUtils';

// ============================================================================
// TYPES
// ============================================================================

interface DetailPanelProps {
  node: SkillNode | null;
  data: SkillTreeData;
  userStack: Set<string>;
  currentTopic: string;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
  onAddToStack: (nodeId: string) => void;
  onRemoveFromStack: (nodeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
  onAddNewNode?: () => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Empty state shown when no node is selected */
interface EmptyStateProps {
  userStack: Set<string>;
  data: SkillTreeData;
  currentTopic: string;
  onNavigate: (nodeId: string) => void;
  onRemoveFromStack: (nodeId: string) => void;
  onAddNewNode?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ userStack, data, currentTopic, onNavigate, onRemoveFromStack, onAddNewNode }) => {
  const stackNodes = data.nodes.filter((n) => userStack.has(n.id));
  // Find direct links between stack nodes (no intermediary paths)
  const stackLinks = data.links.filter(
    (l) => userStack.has(l.source) && userStack.has(l.target)
  );

  const projectPathNodes = (data.projectNodes || [])
    .map(id => data.nodes.find(n => n.id === id))
    .filter(Boolean) as typeof data.nodes;

  return (
    <div className="h-full flex flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"></div>

      <div className="flex-none p-6 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white mb-1">
          {currentTopic ? currentTopic : 'AI Horizon'}
        </h3>
        <p className="text-xs text-slate-400">
          {projectPathNodes.length > 0
            ? 'Example project path — nodes are highlighted in the graph'
            : 'Select nodes to build your stack'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Example Project Section */}
        {data.projectSummary && (
          <div className="mb-5">
            <div className="rounded-lg border border-amber-500/40 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/10 px-4 py-2.5 border-b border-amber-500/30 flex items-center gap-2">
                <span className="text-sm">🚀</span>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Example Project</h4>
                {currentTopic && (
                  <span className="ml-auto text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{currentTopic}</span>
                )}
              </div>
              <div className="bg-slate-800/40 px-4 py-3">
                <p className="text-xs text-slate-300 leading-relaxed">{data.projectSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Path - lit up nodes */}
        {projectPathNodes.length > 0 && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              Project Path
              <span className="text-slate-600 normal-case font-normal">(highlighted in graph)</span>
            </h4>
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gradient-to-b from-amber-500/60 via-orange-500/40 to-rose-500/30"></div>
              <div className="space-y-2">
                {projectPathNodes.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => onNavigate(n.id)}
                    className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-[10px] font-bold text-amber-300 z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">{n.label}</p>
                      <p className="text-[10px] text-slate-500">{n.category}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stack section divider */}
        {(projectPathNodes.length > 0 || data.projectSummary) && (
          <div className="border-t border-slate-800/80 pt-4 mb-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Your Stack</h4>
          </div>
        )}

        {stackNodes.length === 0 ? (
          <div className={projectPathNodes.length > 0 ? 'text-center py-3' : 'text-center py-8'}>
            {projectPathNodes.length === 0 && (
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            <p className="text-slate-500 text-xs">Click nodes in the graph to add them to your stack.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Stack nodes */}
            {stackNodes.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-orange-500/30 cursor-pointer group transition-all"
                onClick={() => onNavigate(n.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-sm font-medium text-white group-hover:text-orange-400 truncate">{n.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromStack(n.id);
                    }}
                    className="text-slate-500 hover:text-red-400 text-xs p-1 flex-shrink-0"
                    title="Remove from stack"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 ml-4">{n.category}</span>
              </div>
            ))}

            {/* Direct connections between stack nodes */}
            {stackLinks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Direct connections</h4>
                <div className="space-y-2">
                  {stackLinks.map((l, i) => {
                    const src = data.nodes.find((n) => n.id === l.source);
                    const tgt = data.nodes.find((n) => n.id === l.target);
                    if (!src || !tgt) return null;
                    return (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/50 flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800/50 transition-colors"
                        onClick={() => onNavigate(tgt.id)}
                      >
                        <span className="text-orange-400 font-medium">{src.label}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-[9px] text-slate-500 italic">{l.relationship}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-orange-400 font-medium">{tgt.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hint when there's only 1 node */}
            {stackNodes.length === 1 && (
              <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-2">
                  Keep adding! Click more nodes and add them to your stack.
                </p>
                <p className="text-slate-500 text-[10px]">
                  With 2+ nodes, you can use <span className="text-orange-400">"Show Stack Connections"</span> to reveal how they connect.
                </p>
              </div>
            )}

            {/* No direct links between 2+ nodes */}
            {stackNodes.length >= 2 && stackLinks.length === 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs mb-2">
                    No direct connections found. These nodes may connect through intermediary nodes.
                  </p>
                  <p className="text-orange-400 text-xs font-medium">
                    Try "Show Stack Connections" to reveal the full network!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Individual connection item in the lattice view */
interface ConnectionItemProps {
  connection: NodeConnection;
  onNavigate: (nodeId: string) => void;
  onAddToStack: (nodeId: string) => void;
  userStack: Set<string>;
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ connection, onNavigate, onAddToStack, userStack }) => {
  if (!connection.node) return null;

  const isInStack = userStack.has(connection.node.id);

  return (
    <div className="group flex items-center gap-2 p-2 bg-slate-800/40 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition-all">
      <div
        onClick={() => onNavigate(connection.node!.id)}
        className="flex-1 flex items-center justify-between cursor-pointer min-w-0"
      >
        <span className="text-sm text-slate-300 group-hover:text-white truncate">
          {connection.node.label}
        </span>
        <span className="text-[10px] text-slate-500 italic flex-shrink-0 ml-2">{connection.relationship}</span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddToStack(connection.node!.id);
        }}
        className={`flex-shrink-0 p-1.5 rounded transition-all ${
          isInStack
            ? 'text-green-500 bg-green-500/10 cursor-default'
            : 'text-slate-500 hover:text-orange-400 hover:bg-orange-500/10'
        }`}
        disabled={isInStack}
        title={isInStack ? 'In stack' : 'Add to stack'}
      >
        {isInStack ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        )}
      </button>
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

const DetailPanel: React.FC<DetailPanelProps> = ({
  node,
  data,
  userStack,
  currentTopic,
  onClose,
  onNavigate,
  onAddToStack,
  onRemoveFromStack,
  onRemoveNode,
  onAddNewNode,
}) => {
  if (!node) {
    return (
      <EmptyState
        userStack={userStack}
        data={data}
        currentTopic={currentTopic}
        onNavigate={onNavigate}
        onRemoveFromStack={onRemoveFromStack}
        onAddNewNode={onAddNewNode}
      />
    );
  }

  const isInStack = userStack.has(node.id);

  // Compute connections using utility functions; filter out any whose source/target
  // node was deleted from the graph (model may reference non-existent IDs)
  const incoming = getIncomingConnections(node.id, data).filter(c => c.node !== undefined);
  const outgoing = getOutgoingConnections(node.id, data).filter(c => c.node !== undefined);
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
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{node.label}</h2>

        {/* Add / Remove from stack */}
        <div className="mb-4">
          {isInStack ? (
            <button
              type="button"
              onClick={() => onRemoveFromStack(node.id)}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Remove from stack
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onAddToStack(node.id)}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium hover:from-orange-400 hover:to-rose-400 transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
                Add to stack
              </button>
              {userStack.size >= 1 && (
                <p className="text-xs text-center text-slate-400">
                  Keep clicking nodes to add more! 
                  <span className="text-orange-400"> ({userStack.size} in stack)</span>
                </p>
              )}
            </div>
          )}
        </div>

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
                {incoming.map((connection) => (
                  <ConnectionItem
                    key={connection.node!.id}
                    connection={connection}
                    onNavigate={onNavigate}
                    onAddToStack={onAddToStack}
                    userStack={userStack}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic p-2">Horizon Node (Foundation)</div>
            )}
          </div>

          {/* DOWNSTREAM - Nodes that this node unlocks */}
          <div className="relative pl-8">
            <TimelineMarker type="down" />
            <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Unlocks & Enables</h4>

            {outgoing.length > 0 ? (
              <div className="space-y-2">
                {outgoing.map((connection) => (
                  <ConnectionItem
                    key={connection.node!.id}
                    connection={connection}
                    onNavigate={onNavigate}
                    onAddToStack={onAddToStack}
                    userStack={userStack}
                  />
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
            node.resources.map((res) => (
              <li key={res} className="flex items-center text-sm text-amber-400 hover:text-amber-300 transition-colors truncate">
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
