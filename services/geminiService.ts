
import { SkillTreeData, NodeType } from "../types";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export interface OllamaModel {
  name: string;
  size: number;
  parameterSize: string;
  family: string;
}

export async function fetchAvailableModels(): Promise<OllamaModel[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    const models: Array<{
      name: string;
      size: number;
      details?: { parameter_size?: string; family?: string };
    }> = data.models || [];

    const mapped = models.map(m => ({
      name: m.name,
      size: m.size,
      parameterSize: m.details?.parameter_size || '',
      family: m.details?.family || '',
    }));

    // Sort so fast text models come first. Vision/VL models are too slow for JSON generation.
    // Preferred models (known-good for structured JSON) get priority 0,
    // generic text models get 1, vision models get 2.
    const modelPriority = (name: string): number => {
      const n = name.toLowerCase();
      if (/\b(vl|vision|llava|moondream)\b/.test(n)) return 2; // vision — slow
      if (/\b(llama|mistral|gemma|qwen2?\.?5?|phi|deepseek)\b/.test(n) && !/vl/.test(n)) return 0; // fast text
      return 1; // unknown — middle
    };
    mapped.sort((a, b) => modelPriority(a.name) - modelPriority(b.name));

    return mapped;
  } catch {
    return [];
  }
}

// Default fallback data with 3 distinct CORE roots and bottom-up flow
export const FALLBACK_DATA: SkillTreeData = {
  projectSummary: "Build a complete AI-powered workflow by combining your domain expertise with modern tools. Start with foundational infrastructure like Version Control and Automation, learn Vibe Coding to direct AI assistants, then leverage tools like Cursor and Ollama to generate, test, and deploy solutions — all while picking the right model for each task using Model Selection.",
  projectNodes: ["root", "inf3", "sk1", "t4", "sk2"],
  nodes: [
    // --- LEVEL 0: ROOT (CORE) ---
    {
      id: "root",
      label: "Domain Knowledge",
      category: NodeType.CORE,
      description: "This is the foundation of everything. It represents your specific area of expertise—whether that's Nursing, Law, Biology, or Engineering. AI isn't magic; it needs your deep understanding of a subject to be truly useful. Think of this as the 'fuel' that powers the AI engine.",
      difficulty: "Advanced",
      tags: ["Foundation", "Domain"],
      link: "https://en.wikipedia.org/wiki/Domain_knowledge"
    },

    // --- LEVEL 1: INFRASTRUCTURE ---
    {
      id: "inf1",
      label: "Automation",
      category: NodeType.INFRASTRUCTURE,
      description: "Workflow automation tools like n8n act as the 'glue' of the internet. They let you connect different apps (like Gmail, Slack, and Google Sheets) to talk to each other without writing complex code. Imagine having a digital assistant that automatically moves data where it needs to go.",
      difficulty: "Intermediate",
      tags: ["Automation", "Workflow"],
      link: "https://n8n.io/"
    },
    {
      id: "inf2",
      label: "Containerization",
      category: NodeType.INFRASTRUCTURE,
      description: "Platforms like Docker are like shipping containers for software. They package up an application with everything it needs to run, so it works exactly the same way on your laptop as it does on a giant server in the cloud. It stops the 'it works on my machine' problem.",
      difficulty: "Intermediate",
      tags: ["DevOps", "Containers"],
      link: "https://www.docker.com/"
    },
    {
      id: "inf3",
      label: "Version Control",
      category: NodeType.INFRASTRUCTURE,
      description: "Platforms like GitHub are like a time machine for your code. They save every version of your work, so if you make a mistake, you can easily go back. They also let teams work on the same project at the same time without overwriting each other's changes.",
      difficulty: "Beginner",
      tags: ["Collaboration", "Git"],
      link: "https://github.com/"
    },

    // --- LEVEL 2: SKILL ---
    {
      id: "sk1",
      label: "Vibe Coding",
      category: NodeType.SKILL,
      description: "Vibe Coding is a modern way of building software where you focus on the 'flow' and the outcome rather than getting stuck on syntax. It's about using AI to handle the heavy lifting of writing code, while you direct the logic and creativity, like a conductor leading an orchestra.",
      difficulty: "Intermediate",
      tags: ["Coding", "Flow"],
      link: "https://twitter.com/karpathy/status/1754213778556539356"
    },

    // --- LEVEL 3: TOOLS & CONCEPTS ---
    {
      id: "t2",
      label: "Cursor",
      category: NodeType.CONCEPT,
      description: "Cursor is a code editor built for the AI era. It looks like VS Code but has AI built right into the core. It can predict your next edit, explain bugs, and even write entire functions for you. It's like having a senior developer sitting next to you 24/7.",
      difficulty: "Intermediate",
      tags: ["Editor", "AI"],
      link: "https://cursor.sh/"
    },
    {
      id: "t3",
      label: "ChatGPT Codex",
      category: NodeType.CONCEPT,
      description: "Codex is the engine under the hood of many AI coding tools. It's a version of GPT trained specifically on billions of lines of code. It understands programming languages like it understands English, allowing it to translate your instructions directly into working software.",
      difficulty: "Advanced",
      tags: ["Code Generation", "Model"],
      link: "https://openai.com/blog/openai-codex"
    },
    {
      id: "con1",
      label: "Antigravity",
      category: NodeType.CONCEPT,
      description: "Antigravity is an experimental design paradigm that aims to make software feel weightless and fluid. It uses physics-based animations and intuitive interactions to create interfaces that feel more like natural extensions of your mind than rigid computer programs.",
      difficulty: "Advanced",
      tags: ["UI/UX", "Experimental"],
      link: "https://www.antigravity.com/"
    },
    {
      id: "t4",
      label: "Ollama",
      category: NodeType.CONCEPT,
      description: "Ollama is a tool that lets you run powerful AI models locally on your own computer, instead of sending your data to the cloud. It's great for privacy and for working offline. Think of it as having your own private AI lab right on your laptop.",
      difficulty: "Intermediate",
      tags: ["Local AI", "Privacy"],
      link: "https://ollama.com/"
    },

    // --- LEVEL 4: ADVANCED MODELS ---
    {
      id: "adv1",
      label: "Google Gemini",
      category: NodeType.TOOL,
      description: "Gemini is Google's most capable AI model. It's 'multimodal', meaning it can understand and reason across text, images, video, and audio all at once. It's designed to be a helpful assistant that can handle complex tasks like coding, writing, and visual analysis.",
      difficulty: "Advanced",
      tags: ["Multimodal", "Reasoning"],
      link: "https://deepmind.google/technologies/gemini/"
    },
    {
      id: "adv2",
      label: "ChatGPT",
      category: NodeType.TOOL,
      description: "ChatGPT is the AI chatbot that started the revolution. It's an advanced conversational assistant that can help you draft emails, write code, learn new topics, and brainstorm ideas. It's like a super-smart research assistant that's always available.",
      difficulty: "Beginner",
      tags: ["Chat", "Assistant"],
      link: "https://chat.openai.com/"
    },
    {
      id: "sk2",
      label: "Model Selection",
      category: NodeType.TOOL,
      description: "Model Selection isn't just a tool; it's the skill of knowing which AI brain to use for which job. Just like you wouldn't use a hammer to drive a screw, you need to know when to use a fast, cheap model versus a slow, powerful one. It's about optimizing for cost, speed, and intelligence.",
      difficulty: "Advanced",
      tags: ["Strategy", "Optimization"],
      link: "https://huggingface.co/models"
    },
  ],
  links: [
    // Level 0 -> Level 1
    { source: "root", target: "inf1", relationship: "automates" },
    { source: "root", target: "inf2", relationship: "runs on" },
    { source: "root", target: "inf3", relationship: "stored in" },

    // Level 1 -> Level 2
    { source: "inf1", target: "sk1", relationship: "enables" },
    { source: "inf2", target: "sk1", relationship: "supports" },
    { source: "inf3", target: "sk1", relationship: "facilitates" },

    // Level 2 -> Level 3
    { source: "sk1", target: "t2", relationship: "uses" },
    { source: "sk1", target: "t3", relationship: "powered by" },
    { source: "sk1", target: "con1", relationship: "explores" },
    { source: "sk1", target: "t4", relationship: "deploys" },

    // Level 3 -> Level 4
    { source: "con1", target: "adv1", relationship: "visualizes" },
    { source: "t3", target: "adv2", relationship: "powers" },
    { source: "t4", target: "sk2", relationship: "requires" },
    { source: "t2", target: "adv2", relationship: "integrates" },
    { source: "t2", target: "sk2", relationship: "leverages" }
  ]
};

// Timeout for Ollama requests
const REQUEST_TIMEOUT_MS = 60_000; // 60s — this is a small query now

/**
 * Result from the AI: which nodes to highlight and a project description.
 * The graph data itself never changes.
 */
export interface ProjectInsight {
  projectSummary: string;
  projectNodes: string[];  // IDs of nodes to highlight
}

/**
 * Ask the local model which of the existing graph nodes are relevant
 * to a given topic/job, and to describe an example project using them.
 * This is a lightweight query (~200 output tokens) so it's fast even on small models.
 */
export async function generateProjectInsight(
  topic: string,
  existingNodes: { id: string; label: string }[],
  selectedModel?: string
): Promise<ProjectInsight | null> {
  try {
    const model = selectedModel || undefined;
    if (!model) return null;

    const nodeList = existingNodes.map(n => `${n.id}: ${n.label}`).join(', ');

    const prompt = `Given these tools/skills: [${nodeList}]

A user is interested in "${topic}". Pick 3-5 of these tools that would be most useful for a ${topic} project. Return JSON only:
{"projectSummary":"2-3 sentences describing a concrete example project in ${topic} using the selected tools. Be specific about what gets built.","projectNodes":["id1","id2","id3"]}

Use ONLY IDs from the list above. Return valid JSON only, nothing else.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          format: 'json',
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300,
          }
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Ollama ${response.status}: ${errorBody || response.statusText}`);
    }

    const result = await response.json();
    const rawText: string = result.message?.content ?? '';
    if (!rawText) throw new Error("No content returned from Ollama");

    // Strip markdown fences
    const text = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    const data = JSON.parse(text) as ProjectInsight;

    // Validate: only keep node IDs that actually exist
    const validIds = new Set(existingNodes.map(n => n.id));
    const projectNodes = (data.projectNodes || []).filter(id => validIds.has(id));

    if (projectNodes.length === 0) return null;

    return {
      projectSummary: data.projectSummary || `Example project for ${topic}`,
      projectNodes,
    };

  } catch (error) {
    console.error("Project insight error:", error instanceof Error ? error.message : error);
    return null;
  }
}
