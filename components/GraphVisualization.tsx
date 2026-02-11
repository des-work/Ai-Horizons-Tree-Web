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
  getLinkNodeId,
} from '../utils/graphUtils';
import { SIMULATION, LAYOUT, ANIMATION, COLORS } from '../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface GraphVisualizationProps {
  data: SkillTreeData;
  onNodeClick: (node: SimulationNode) => void;
  selectedNodeId: string | null;
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
// ZOOM CONTROLS
// ============================================================================

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => (
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
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  selectedNodeId,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

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

  // Selection highlighting effect
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!selectedNodeId) {
      // Reset all elements to full opacity
      svg
        .selectAll('.node, .link')
        .transition()
        .duration(ANIMATION.selectionTransition)
        .style('opacity', 1);
      return;
    }

    // Get connected elements
    const { nodeIds, linkIndices } = getConnectedElements(selectedNodeId, data.links);

    // Dim non-connected nodes
    svg
      .selectAll<SVGGElement, SimulationNode>('.node')
      .transition()
      .duration(ANIMATION.selectionTransition)
      .style('opacity', d => (nodeIds.has(d.id) ? 1 : 0.1));

    // Highlight connected links
    svg
      .selectAll<SVGPathElement, SimulationLink>('.link')
      .transition()
      .duration(ANIMATION.selectionTransition)
      .style('opacity', (_d, i) => (linkIndices.has(i) ? 1 : 0.05))
      .attr('stroke', (_d, i) => (linkIndices.has(i) ? COLORS.link.highlight : COLORS.link.default))
      .attr('stroke-width', (_d, i) => (linkIndices.has(i) ? 3 : 2));
  }, [selectedNodeId, data.links]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      <OrientationHint />
      <Legend />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
      />
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default GraphVisualization;
