
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

    return models.map(m => ({
      name: m.name,
      size: m.size,
      parameterSize: m.details?.parameter_size || '',
      family: m.details?.family || '',
    }));
  } catch {
    return [];
  }
}

// Default fallback data with 3 distinct CORE roots and bottom-up flow
export const FALLBACK_DATA: SkillTreeData = {
  projectSummary: "Build a complete AI-powered workflow by combining your domain expertise with modern tools. Start with foundational infrastructure like Version Control and Automation, learn Vibe Coding to direct AI assistants, then leverage tools like Cursor and Ollama to generate, test, and deploy solutions — all while picking the right model for each task using Model Selection.",
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

export const generateSkillTree = async (topic: string, variation: number = 0, selectedModel?: string): Promise<SkillTreeData> => {
  try {
    let model = selectedModel;
    if (!model) {
      const models = await fetchAvailableModels();
      model = models[0]?.name;
    }
    if (!model) {
      console.warn("Ollama not reachable or no models installed. Using fallback data.");
      return FALLBACK_DATA;
    }

    const prompt = `You are a JSON generator. Respond ONLY with valid JSON, no markdown, no explanation.

Create a practical "AI Tool Map" for the topic: "${topic}".
This is variation #${variation} — use DIFFERENT tool combinations than previous variations.

STRUCTURE:
1. CORE (1 node): The domain "${topic}" itself
2. INFRASTRUCTURE (2-3 nodes): Foundational tools (GitHub, Docker, n8n, etc.)
3. SKILL (2-4 nodes): Key skills like Prompt Engineering, API Integration, Data Analysis
4. TOOL (4-6 nodes): Specific AI tools for ${topic} (ChatGPT, Cursor, Midjourney, Claude, etc.)
5. CONCEPT (1-2 nodes): Methodologies or advanced techniques
6. ADVANCED (2-3 nodes): Cutting-edge applications

Each node description MUST include a CONCRETE EXAMPLE of how it's used in ${topic}.

Links flow from lower/prerequisite nodes (source) to higher/dependent nodes (target).

Return this exact JSON structure:
{
  "projectSummary": "2-3 sentence example project using these tools in ${topic}",
  "nodes": [
    {
      "id": "unique_id",
      "label": "Tool Name",
      "category": "CORE|TOOL|INFRASTRUCTURE|CONCEPT|SKILL",
      "description": "Practical how-to with specific ${topic} use case",
      "difficulty": "Beginner|Intermediate|Advanced",
      "tags": ["tag1", "tag2"],
      "link": "https://official-site.com"
    }
  ],
  "links": [
    { "source": "prerequisite_id", "target": "dependent_id", "relationship": "enables" }
  ]
}`;

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only response bot. Never output markdown fences, explanations, or anything outside the JSON object. Respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        format: 'json',
        stream: false,
        options: {
          temperature: 0.7 + (variation * 0.1),
          num_predict: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.message?.content;
    if (!text) throw new Error("No content returned from Ollama");

    const data = JSON.parse(text) as SkillTreeData;

    if (!data.nodes || !data.links || data.nodes.length < 3) {
      throw new Error("Response missing required fields or too few nodes");
    }

    return data;

  } catch (error) {
    console.error("Ollama generation error:", error);
    return FALLBACK_DATA;
  }
};
