
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SkillTreeData, SimulationNode, SimulationLink, NodeType } from '../types';

interface GraphVisualizationProps {
  data: SkillTreeData;
  onNodeClick: (node: SimulationNode) => void;
  selectedNodeId: string | null;
  width: number;
  height: number;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onNodeClick, selectedNodeId, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Sunrise Palette
  const getColor = (category: string) => {
    switch (category) {
      case NodeType.CORE: return '#f97316'; // Orange 500 (The Horizon Sun)
      case NodeType.TOOL: return '#fbbf24'; // Amber 400 (Light/Rays)
      case NodeType.INFRASTRUCTURE: return '#22d3ee'; // Cyan 400 (Cool/Foundation/Water)
      case NodeType.CONCEPT: return '#a855f7'; // Purple 500 (The Sky/Atmosphere)
      case NodeType.SKILL: return '#f43f5e'; // Rose 500 (The Dawn)
      default: return '#94a3b8'; // Slate 400
    }
  };

  const getRadius = (category: string) => {
    switch (category) {
      case NodeType.CORE: return 35; // Larger roots
      case NodeType.CONCEPT: return 25;
      case NodeType.SKILL: return 20;
      case NodeType.INFRASTRUCTURE: return 22;
      default: return 18;
    }
  };

  // Helper to compute depth (levels) for Bottom-Up layout
  const computeLevels = (nodes: SimulationNode[], links: SimulationLink[]) => {
    const adjacency: Record<string, string[]> = {};
    links.forEach(l => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (!adjacency[s]) adjacency[s] = [];
      adjacency[s].push(t);
    });

    const levels: Record<string, number> = {};
    const queue: { id: string, lvl: number }[] = [];

    // Initialize CORE nodes at level 0
    nodes.forEach(n => {
      if (n.category === NodeType.CORE) {
        levels[n.id] = 0;
        queue.push({ id: n.id, lvl: 0 });
      }
    });

    // BFS to assign levels moving UP
    while (queue.length > 0) {
      const { id, lvl } = queue.shift()!;
      const children = adjacency[id] || [];
      children.forEach(childId => {
        if (levels[childId] === undefined) {
          levels[childId] = lvl + 1;
          queue.push({ id: childId, lvl: lvl + 1 });
        }
      });
    }

    let maxLevel = 0;
    nodes.forEach(n => {
      const lvl = levels[n.id] !== undefined ? levels[n.id] : 1; 
      (n as any).level = lvl;
      if (lvl > maxLevel) maxLevel = lvl;
    });

    return maxLevel;
  };

  // Main D3 Effect
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes: SimulationNode[] = data.nodes.map(d => ({ ...d }));
    const links: SimulationLink[] = data.links.map(d => ({ ...d }));

    const maxLevel = computeLevels(nodes, links);

    // --- SETUP LAYOUT ---
    const g = svg.append("g").attr("class", "graph-container");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Filter Core Nodes
    const coreNodes = nodes.filter(n => n.category === NodeType.CORE);
    coreNodes.sort((a, b) => a.label.localeCompare(b.label));
    const coreCount = coreNodes.length;

    // --- POSITIONS ---
    const bottomY = height - 100;
    const topY = 100;
    const availableH = bottomY - topY;
    const spacingX = width / (coreCount + 1);

    // Fix Cores
    coreNodes.forEach((node, i) => {
      node.fx = spacingX * (i + 1);
      node.fy = bottomY;
      node.x = node.fx;
      node.y = node.fy;
    });

    // Init others
    nodes.forEach(node => {
      if (node.category !== NodeType.CORE) {
        const level = (node as any).level || 1;
        const ratio = level / Math.max(maxLevel, 1);
        node.y = bottomY - (ratio * availableH);
        node.x = width / 2 + (Math.random() - 0.5) * 300;
      }
    });

    // --- FORCE SIMULATION ---
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.4)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("collide", d3.forceCollide().radius((d: any) => getRadius(d.category) + 15).iterations(2))
      .force("y", d3.forceY().y((d: any) => {
          const level = (d as any).level || 0;
          const ratio = level / Math.max(maxLevel, 1);
          return bottomY - (ratio * availableH);
        }).strength(1.2)
      )
      .force("x", d3.forceX(width/2).strength(0.05));

    // --- DRAWING ---

    // Arrow Markers
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#64748b");

    const link = g.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrow)");

    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("cursor", "pointer")
      .attr("id", (d) => `node-${d.id}`)
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    nodeGroup.append("circle")
      .attr("r", (d) => getRadius(d.category))
      .attr("fill", "#0f172a")
      .attr("stroke", (d) => getColor(d.category))
      .attr("stroke-width", (d) => d.category === NodeType.CORE ? 4 : 2)
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    nodeGroup.append("text")
      .text(d => {
        if (d.category === NodeType.TOOL) return '🛠️';
        if (d.category === NodeType.INFRASTRUCTURE) return '🏗️';
        if (d.category === NodeType.SKILL) return '⚡';
        if (d.category === NodeType.CONCEPT) return '🧠';
        if (d.category === NodeType.CORE) return '☀️';
        return '';
      })
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.category === NodeType.CORE ? "18px" : "14px")
      .attr("pointer-events", "none");

    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", (d) => getRadius(d.category) + 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,1)");

    simulation.on("tick", () => {
      link.attr("d", (d: any) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`);
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.category !== NodeType.CORE) {
        d.fx = null;
        d.fy = null;
      }
    }

    return () => simulation.stop();
  }, [data, width, height]);

  // --- SELECTION HIGHLIGHTING EFFECT ---
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (!selectedNodeId) {
       // Reset state
       svg.selectAll(".node, .link").transition().duration(300).style("opacity", 1);
       return;
    }

    // Identify connected nodes and links
    const activeNodeIds = new Set<string>();
    const activeLinkIndices = new Set<number>();
    
    activeNodeIds.add(selectedNodeId);

    // D3 binds data to elements. We can iterate the data to find connections.
    // Note: After simulation, links have source/target as Node objects
    data.links.forEach((l, i) => {
       const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
       const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;

       // Highlight if connected to selection
       if (sId === selectedNodeId || tId === selectedNodeId) {
           activeNodeIds.add(sId);
           activeNodeIds.add(tId);
           activeLinkIndices.add(i);
       }
    });

    // Apply styles
    svg.selectAll(".node")
       .transition().duration(300)
       .style("opacity", (d: any) => activeNodeIds.has(d.id) ? 1 : 0.1);
    
    svg.selectAll(".link")
       .transition().duration(300)
       .style("opacity", (d: any, i) => activeLinkIndices.has(i) ? 1 : 0.05)
       .attr("stroke", (d: any, i) => activeLinkIndices.has(i) ? "#fbbf24" : "#64748b") // Highlight color (Amber)
       .attr("stroke-width", (d: any, i) => activeLinkIndices.has(i) ? 3 : 2);

  }, [selectedNodeId, data]); // Run when selection changes

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
       {/* Orientation Hint */}
       <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-30 pointer-events-none">
           <div className="text-xs font-mono uppercase rotate-90 tracking-widest text-purple-300">Zenith</div>
           <div className="w-px h-32 bg-gradient-to-b from-purple-400 via-orange-400 to-orange-600"></div>
           <div className="text-xs font-mono uppercase rotate-90 tracking-widest text-orange-500">Horizon</div>
       </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-90">
        <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-2 rounded-full border border-slate-800 backdrop-blur-sm">
           <LegendItem color="#f97316" label="Core" icon="☀️" />
           <LegendItem color="#a855f7" label="Concept" icon="🧠" />
           <LegendItem color="#f43f5e" label="Skill" icon="⚡" />
           <LegendItem color="#fbbf24" label="AI Tool" icon="🛠️" />
           <LegendItem color="#22d3ee" label="Infra" icon="🏗️" />
        </div>
      </div>
      <svg ref={svgRef} width={width} height={height} className="w-full h-full block touch-none" />
    </div>
  );
};

const LegendItem = ({ color, label, icon }: { color: string, label: string, icon: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm">{icon}</span>
    <span className="text-xs text-slate-300 font-medium" style={{color: color}}>{label}</span>
  </div>
);

export default GraphVisualization;
