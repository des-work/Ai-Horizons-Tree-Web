import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SkillTreeData, SimulationNode, SimulationLink, NodeType } from '../types';
import {
  getNodeColor,
  getNodeRadius,
  getNodeStrokeWidth,
  getNodeIcon,
  computeNodeLevels,
  getConnectedElements,
  getFullPathBetweenStackNodes,
  getLinkNodeId,
} from '../utils/graphUtils';
import { SIMULATION, LAYOUT, ANIMATION, COLORS } from '../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface GraphVisualizationProps {
  data: SkillTreeData;
  onNodeClick: (node: SimulationNode | null) => void;
  selectedNodeId: string | null;
  userStackIds?: Set<string>;
  width: number;
  height: number;
}

// ============================================================================
// LEGEND COMPONENT
// ============================================================================

interface LegendItemProps {
  color: string;
  label: string;
  icon: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, icon }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm">{icon}</span>
    <span className="text-xs text-slate-300 font-medium" style={{ color }}>
      {label}
    </span>
  </div>
);

const Legend: React.FC = () => {
  // Use getNodeColor utility for type safety
  return (
    <div className="main-page-legend absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-90">
      <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-2 rounded-full border border-slate-800 backdrop-blur-sm">
        <LegendItem color={getNodeColor(NodeType.CORE)} label="Core" icon={getNodeIcon(NodeType.CORE)} />
        <LegendItem color={getNodeColor(NodeType.CONCEPT)} label="Concept" icon={getNodeIcon(NodeType.CONCEPT)} />
        <LegendItem color={getNodeColor(NodeType.SKILL)} label="Skill" icon={getNodeIcon(NodeType.SKILL)} />
        <LegendItem color={getNodeColor(NodeType.TOOL)} label="AI Tool" icon={getNodeIcon(NodeType.TOOL)} />
        <LegendItem color={getNodeColor(NodeType.INFRASTRUCTURE)} label="Infra" icon={getNodeIcon(NodeType.INFRASTRUCTURE)} />
      </div>
    </div>
  );
};

// ============================================================================
// ORIENTATION HINT COMPONENT
// ============================================================================

const OrientationHint: React.FC = () => (
  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-30 pointer-events-none">
    <div className="text-xs font-mono uppercase rotate-90 tracking-widest text-purple-300">Zenith</div>
    <div className="w-px h-32 bg-gradient-to-b from-purple-400 via-orange-400 to-orange-600"></div>
    <div className="text-xs font-mono uppercase rotate-90 tracking-widest text-orange-500">Horizon</div>
  </div>
);

// ============================================================================
// LATTICE GUIDE - Explains node groupings
// ============================================================================

const LatticeGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
    <div className="max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-1"></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Lattice Layers</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-6">Nodes are organized in a vertical lattice from zenith to foundation:</p>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <span className="text-lg">🌟</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-400 mb-1">Top: Advanced Applications</h4>
              <p className="text-xs text-slate-400">Cutting-edge implementations and specialized use cases.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center">
              <span className="text-lg">🛠️</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-400 mb-1">Upper: AI Tools & IDEs</h4>
              <p className="text-xs text-slate-400">Specific tools like Cursor, ChatGPT, Ollama, and Claude that implement the concepts.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-pink-400 mb-1">Middle: Skills & Concepts</h4>
              <p className="text-xs text-slate-400">Practical skills like Vibe Coding, Prompt Engineering, and development practices.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
              <span className="text-lg">🏗️</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-cyan-400 mb-1">Lower: Infrastructure & Techniques</h4>
              <p className="text-xs text-slate-400">Essential tools and methods like Version Control, Containerization, and Automation.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
              <span className="text-lg">🏛️</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-400 mb-1">Bottom: Core / Foundation</h4>
              <p className="text-xs text-slate-400">Your domain knowledge and fundamental concepts that everything builds upon.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 italic">
            💡 Tip: Click a node to see its connections. Add nodes to your stack to track your learning path.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// ZOOM CONTROLS
// ============================================================================

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onShowGuide: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset, onShowGuide }) => (
  <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 p-1 shadow-lg">
    <button
      type="button"
      onClick={onZoomIn}
      className="p-2 rounded text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
      title="Zoom in"
      aria-label="Zoom in"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
      </svg>
    </button>
    <button
      type="button"
      onClick={onZoomOut}
      className="p-2 rounded text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
      title="Zoom out"
      aria-label="Zoom out"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
      </svg>
    </button>
    <div className="h-px bg-slate-600/80 my-0.5" />
    <button
      type="button"
      onClick={onReset}
      className="p-2 rounded text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
      title="Reset view (also: double-click)"
      aria-label="Reset view"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4a8 8 0 108 8" />
      </svg>
    </button>
    <div className="h-px bg-slate-600/80 my-0.5" />
    <button
      type="button"
      onClick={onShowGuide}
      className="p-2 rounded text-slate-300 hover:text-white hover:bg-orange-500/20 hover:border-orange-500/50 transition-colors relative group"
      title="Show lattice layers guide"
      aria-label="Show guide"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Lattice Guide
      </span>
    </button>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  selectedNodeId,
  userStackIds = new Set(),
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showStackConnections, setShowStackConnections] = React.useState(false);
  const hasAutoEnabledStackConnectionsRef = React.useRef(false);

  // Auto-enable "Show Stack Connections" when user first adds 2+ nodes - keeps top connections visible
  React.useEffect(() => {
    if (userStackIds.size >= 2 && !hasAutoEnabledStackConnectionsRef.current) {
      hasAutoEnabledStackConnectionsRef.current = true;
      setShowStackConnections(true);
    }
  }, [userStackIds.size]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.4);
    }
  };
  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 0.7);
    }
  };
  const handleResetView = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  // Main D3 Effect - creates and manages the force simulation
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create deep copies to avoid mutating original data
    const nodes: SimulationNode[] = data.nodes.map(d => ({ ...d }));
    const links: SimulationLink[] = data.links.map(d => ({ ...d }));

    const maxLevel = computeNodeLevels(nodes, links);

    // --- SETUP LAYOUT ---
    const g = svg.append('g').attr('class', 'graph-container');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Click on background to deselect node (show only stack)
    svg.on('click', (event: MouseEvent) => {
      // Only deselect if clicking on SVG background (not a node)
      if (event.target === svgRef.current) {
        onNodeClick(null as any); // Deselect current node
      }
    });

    // Double-click on background to reset zoom
    svg.on('dblclick.zoom', null); // remove default zoom-in on dblclick
    svg.on('dblclick', () => {
      svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    });

    // Filter and sort Core Nodes
    const coreNodes = nodes.filter(n => n.category === NodeType.CORE);
    coreNodes.sort((a, b) => a.label.localeCompare(b.label));
    const coreCount = coreNodes.length;

    // --- COMPUTE POSITIONS ---
    const bottomY = height - LAYOUT.verticalPadding;
    const topY = LAYOUT.verticalPadding;
    const availableH = bottomY - topY;
    const spacingX = width / (coreCount + 1);

    // Fix Core nodes at the bottom (the "Horizon")
    coreNodes.forEach((node, i) => {
      node.fx = spacingX * (i + 1);
      node.fy = bottomY;
      node.x = node.fx;
      node.y = node.fy;
    });

    // Initialize other nodes based on their level
    nodes.forEach(node => {
      if (node.category !== NodeType.CORE) {
        const level = node.level ?? 1;
        const ratio = level / Math.max(maxLevel, 1);
        node.y = bottomY - ratio * availableH;
        node.x = width / 2 + (Math.random() - 0.5) * 300;
      }
    });

    // --- FORCE SIMULATION ---
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, SimulationLink>(links)
          .id(d => d.id)
          .distance(SIMULATION.link.distance)
          .strength(SIMULATION.link.strength)
      )
      .force('charge', d3.forceManyBody().strength(SIMULATION.charge.strength))
      .force(
        'collide',
        d3
          .forceCollide<SimulationNode>()
          .radius(d => getNodeRadius(d.category) + SIMULATION.collide.padding)
          .iterations(SIMULATION.collide.iterations)
      )
      .force(
        'y',
        d3
          .forceY<SimulationNode>()
          .y(d => {
            const level = d.level ?? 0;
            const ratio = level / Math.max(maxLevel, 1);
            return bottomY - ratio * availableH;
          })
          .strength(SIMULATION.yForce.strength)
      )
      .force('x', d3.forceX(width / 2).strength(SIMULATION.xForce.strength));

    // --- DRAWING ---

    // Defs: arrow markers + node glow filter
    const defs = svg.append('defs');
    defs
      .append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-80%')
      .attr('y', '-80%')
      .attr('width', '260%')
      .attr('height', '260%')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '2.5')
      .attr('result', 'blur');
    defs
      .select('filter#node-glow')
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);
    defs
      .selectAll('marker')
      .data(['arrow'])
      .enter()
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', LAYOUT.arrowMarker.refX)
      .attr('refY', 0)
      .attr('markerWidth', LAYOUT.arrowMarker.markerWidth)
      .attr('markerHeight', LAYOUT.arrowMarker.markerHeight)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', COLORS.link.default);

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('stroke', COLORS.link.default)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');

    // Draw Nodes
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimulationNode>('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .attr('id', d => `node-${d.id}`)
      .call(
        d3
          .drag<SVGGElement, SimulationNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Node circles (with glow filter)
    nodeGroup
      .append('circle')
      .attr('r', d => getNodeRadius(d.category))
      .attr('fill', COLORS.background.primary)
      .attr('stroke', d => getNodeColor(d.category))
      .attr('stroke-width', d => getNodeStrokeWidth(d.category))
      .attr('filter', 'url(#node-glow)')
      .on('click', (event: MouseEvent, d: SimulationNode) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    // Node icons (emoji)
    nodeGroup
      .append('text')
      .text(d => getNodeIcon(d.category))
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => (d.category === NodeType.CORE ? '18px' : '14px'))
      .attr('pointer-events', 'none');

    // Node labels
    nodeGroup
      .append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => getNodeRadius(d.category) + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.text.primary)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,1)');

    // Tick handler - updates positions on each simulation tick
    simulation.on('tick', () => {
      link.attr('d', d => {
        const source = d.source as SimulationNode;
        const target = d.target as SimulationNode;
        return `M${source.x},${source.y} L${target.x},${target.y}`;
      });
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0);
      // Keep core nodes fixed, release others
      if (d.category !== NodeType.CORE) {
        d.fx = null;
        d.fy = null;
      }
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  // Selection highlighting: ONLY show connections for clicked node, stack nodes stay highlighted without connections
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const hasSelection = selectedNodeId || userStackIds.size > 0;

    if (!hasSelection) {
      // No selection — reset everything to full visibility
      svg.selectAll<SVGGElement, SimulationNode>('.node')
        .transition().duration(ANIMATION.selectionTransition)
        .style('opacity', 1);
      svg.selectAll<SVGPathElement, SimulationLink>('.link')
        .transition().duration(ANIMATION.selectionTransition)
        .style('opacity', 1)
        .attr('stroke', COLORS.link.default)
        .attr('stroke-width', 2);
      return;
    }

    // Build highlight sets
    const highlightNodeIds = new Set<string>(userStackIds);
    const highlightLinkIndices = new Set<number>();
    const stackPathLinkIndices = new Set<number>();

    // ONLY show connections for the explicitly selected node (if any)
    if (selectedNodeId) {
      highlightNodeIds.add(selectedNodeId);
      const { nodeIds, linkIndices } = getConnectedElements(selectedNodeId, data.links);
      nodeIds.forEach((id) => highlightNodeIds.add(id));
      linkIndices.forEach((i) => highlightLinkIndices.add(i));
    }

    // Show connections between stack nodes when toggle is ON - full path top-to-bottom
    if (showStackConnections && userStackIds.size >= 2) {
      const { nodeIds: pathNodeIds, linkIndices: pathLinkIndices } = getFullPathBetweenStackNodes(
        userStackIds,
        data.links
      );
      pathNodeIds.forEach((id) => highlightNodeIds.add(id));
      pathLinkIndices.forEach((i) => {
        highlightLinkIndices.add(i);
        const link = data.links[i];
        const src = typeof link.source === 'string' ? link.source : (link.source as SimulationNode).id;
        const tgt = typeof link.target === 'string' ? link.target : (link.target as SimulationNode).id;
        if (userStackIds.has(src) && userStackIds.has(tgt)) {
          stackPathLinkIndices.add(i);
        }
      });
    } else {
      // Just show direct links between stack nodes (no full connections)
      data.links.forEach((link, i) => {
        const src = typeof link.source === 'string' ? link.source : (link.source as SimulationNode).id;
        const tgt = typeof link.target === 'string' ? link.target : (link.target as SimulationNode).id;
        if (userStackIds.has(src) && userStackIds.has(tgt)) {
          stackPathLinkIndices.add(i);
          highlightLinkIndices.add(i);
        }
      });
    }

    // Apply opacity to nodes - dimmed nodes stay visible (lattice structure preserved)
    svg
      .selectAll<SVGGElement, SimulationNode>('.node')
      .transition()
      .duration(ANIMATION.selectionTransition)
      .style('opacity', (d) => (highlightNodeIds.has(d.id) ? 1 : 0.4));

    // Apply styles to links
    svg
      .selectAll<SVGPathElement, SimulationLink>('.link')
      .transition()
      .duration(ANIMATION.selectionTransition)
      .style('opacity', (_d, i) => {
        if (stackPathLinkIndices.has(i)) return 1;
        if (highlightLinkIndices.has(i)) return 0.6;
        return 0.15;
      })
      .attr('stroke', (_d, i) => {
        if (stackPathLinkIndices.has(i)) return COLORS.link.highlight;
        if (highlightLinkIndices.has(i)) return COLORS.link.default;
        return COLORS.link.default;
      })
      .attr('stroke-width', (_d, i) => {
        if (stackPathLinkIndices.has(i)) return 3.5;
        if (highlightLinkIndices.has(i)) return 2;
        return 1.5;
      });
  }, [selectedNodeId, data.links, userStackIds, showStackConnections]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      <OrientationHint />
      <Legend />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        onShowGuide={() => setShowGuide(true)}
      />
      
      {/* Stack Connections Toggle - only show if there are stack nodes */}
      {userStackIds.size >= 2 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => setShowStackConnections(!showStackConnections)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg backdrop-blur-sm
              ${showStackConnections
                ? 'bg-orange-500 text-white border-2 border-orange-400 shadow-orange-500/50'
                : 'bg-slate-900/90 text-slate-300 border-2 border-slate-700 hover:border-orange-500/50 hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {showStackConnections ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Hide Stack Connections
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Show Stack Connections
                </>
              )}
            </span>
          </button>
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />
      {showGuide && <LatticeGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default GraphVisualization;
