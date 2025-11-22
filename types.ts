export enum NodeType {
  CORE = 'CORE',
  TOOL = 'TOOL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  CONCEPT = 'CONCEPT',
  SKILL = 'SKILL'
}

export interface SkillNode {
  id: string;
  label: string;
  description: string;
  category: NodeType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  resources?: string[];
}

export interface SkillLink {
  source: string;
  target: string;
  relationship: string; // Describes why they are connected, e.g., "enables", "requires", "enhances"
}

export interface SkillTreeData {
  nodes: SkillNode[];
  links: SkillLink[];
}

export interface SimulationNode extends SkillNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimulationLink {
  source: SimulationNode | string;
  target: SimulationNode | string;
  relationship: string;
}