import React, { useState } from 'react';
import { SkillNode, NodeType, SkillTreeData } from '../types';

interface AddNodeModalProps {
  data: SkillTreeData;
  onAdd: (node: SkillNode, linkFromId?: string) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: NodeType; label: string }[] = [
  { value: NodeType.TOOL, label: 'AI Tool' },
  { value: NodeType.SKILL, label: 'Skill' },
  { value: NodeType.INFRASTRUCTURE, label: 'Infrastructure' },
  { value: NodeType.CONCEPT, label: 'Concept' },
];

const AddNodeModal: React.FC<AddNodeModalProps> = ({ data, onAdd, onClose }) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<NodeType>(NodeType.TOOL);
  const [description, setDescription] = useState('');
  const [connectToId, setConnectToId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const node: SkillNode = {
      id,
      label: label.trim(),
      description: description.trim() || `Custom ${category} node.`,
      category,
      difficulty: 'Intermediate',
      tags: ['Custom'],
    };

    onAdd(node, connectToId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Add to Stack</h3>
          <p className="text-xs text-slate-400 mt-1">Add a tool, skill, or concept to your AI map.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Midjourney, Prompt Engineering"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NodeType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none text-sm"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Connect to (optional)</label>
            <select
              value={connectToId}
              onChange={(e) => setConnectToId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none text-sm"
            >
              <option value="">— Standalone —</option>
              {data.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label} ({n.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Links this node as enabled by the selected node.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or use case..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium hover:from-orange-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Add to Stack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;
