/**
 * Graph utility functions for D3 visualization
 */

import { NodeType, SimulationNode, SimulationLink, SkillLink, SkillTreeData } from '../types';
import { NODE_COLORS, NODE_RADII, NODE_STROKE_WIDTH, NODE_ICONS, CATEGORY_CLASSES } from '../constants/theme';

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get the color for a node based on its category
 */
export function getNodeColor(category: NodeType | string): string {
  return NODE_COLORS[category] || NODE_COLORS['default'];
}

/**
 * Get Tailwind CSS classes for a node category badge
 */
export function getCategoryClasses(category: NodeType): string {
  return CATEGORY_CLASSES[category] || CATEGORY_CLASSES['default'];
}

// ============================================================================
// NODE STYLING
// ============================================================================

/**
 * Get the radius for a node based on its category
 */
export function getNodeRadius(category: NodeType | string): number {
  return NODE_RADII[category] || NODE_RADII['default'];
}

/**
 * Get the stroke width for a node based on its category
 */
export function getNodeStrokeWidth(category: NodeType | string): number {
  return NODE_STROKE_WIDTH[category] || NODE_STROKE_WIDTH['default'];
}

/**
 * Get the emoji icon for a node category
 */
export function getNodeIcon(category: NodeType | string): string {
  return NODE_ICONS[category] || '';
}

// ============================================================================
// GRAPH STRUCTURE UTILITIES
// ============================================================================

/**
 * Extract the ID from a link source or target (handles both string and object forms)
 */
export function getLinkNodeId(linkEnd: SimulationNode | string): string {
  return typeof linkEnd === 'object' ? linkEnd.id : linkEnd;
}

/**
 * Compute hierarchy levels for nodes using BFS from CORE nodes
 * Returns the maximum level found
 */
export function computeNodeLevels(nodes: SimulationNode[], links: SimulationLink[]): number {
  // Build adjacency list (source -> targets)
  const adjacency: Record<string, string[]> = {};
  
  links.forEach(link => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    
    if (!adjacency[sourceId]) {
      adjacency[sourceId] = [];
    }
    adjacency[sourceId].push(targetId);
  });

  // Track levels for each node
  const levels: Record<string, number> = {};
  const queue: Array<{ id: string; level: number }> = [];

  // Initialize CORE nodes at level 0
  nodes.forEach(node => {
    if (node.category === NodeType.CORE) {
      levels[node.id] = 0;
      queue.push({ id: node.id, level: 0 });
    }
  });

  // BFS to assign levels moving UP the tree
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const children = adjacency[id] || [];
    
    children.forEach(childId => {
      if (levels[childId] === undefined) {
        levels[childId] = level + 1;
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Assign computed levels to nodes and find max
  let maxLevel = 0;
  nodes.forEach(node => {
    const level = levels[node.id] ?? 1; // Default to level 1 if not found
    node.level = level;
    if (level > maxLevel) {
      maxLevel = level;
    }
  });

  return maxLevel;
}

// ============================================================================
// CONNECTION UTILITIES
// ============================================================================

export interface NodeConnection {
  node: SimulationNode | undefined;
  relationship: string;
}

/**
 * Get incoming connections for a node (nodes that point TO this node)
 */
export function getIncomingConnections(
  nodeId: string,
  data: SkillTreeData
): NodeConnection[] {
  return data.links
    .filter(link => {
      const targetId = getLinkNodeId(link.target as SimulationNode | string);
      return targetId === nodeId;
    })
    .map(link => {
      const sourceId = getLinkNodeId(link.source as SimulationNode | string);
      return {
        node: data.nodes.find(n => n.id === sourceId) as SimulationNode | undefined,
        relationship: link.relationship,
      };
    });
}

/**
 * Get outgoing connections for a node (nodes that this node points TO)
 */
export function getOutgoingConnections(
  nodeId: string,
  data: SkillTreeData
): NodeConnection[] {
  return data.links
    .filter(link => {
      const sourceId = getLinkNodeId(link.source as SimulationNode | string);
      return sourceId === nodeId;
    })
    .map(link => {
      const targetId = getLinkNodeId(link.target as SimulationNode | string);
      return {
        node: data.nodes.find(n => n.id === targetId) as SimulationNode | undefined,
        relationship: link.relationship,
      };
    });
}

/**
 * Get all connected node IDs and link indices for selection highlighting
 */
export function getConnectedElements(
  selectedNodeId: string,
  links: SkillLink[]
): { nodeIds: Set<string>; linkIndices: Set<number> } {
  const nodeIds = new Set<string>([selectedNodeId]);
  const linkIndices = new Set<number>();

  links.forEach((link, index) => {
    const sourceId = getLinkNodeId(link.source as SimulationNode | string);
    const targetId = getLinkNodeId(link.target as SimulationNode | string);

    if (sourceId === selectedNodeId || targetId === selectedNodeId) {
      nodeIds.add(sourceId);
      nodeIds.add(targetId);
      linkIndices.add(index);
    }
  });

  return { nodeIds, linkIndices };
}

