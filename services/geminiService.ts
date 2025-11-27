
import { GoogleGenAI, Type } from "@google/genai";
import { SkillTreeData, NodeType } from "../types";



// Initialize lazily to prevent crashes if API key is missing at startup
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Using fallback data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Default fallback data with 3 distinct CORE roots and bottom-up flow
export const FALLBACK_DATA: SkillTreeData = {
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
      link: "https://twitter.com/karpathy/status/1754213778556539356" // Karpathy's tweet on the concept
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
      link: "https://www.antigravity.com/" // Placeholder/Concept link
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
    { source: "con1", target: "adv1", relationship: "visualizes" }, // Antigravity -> Gemini
    { source: "t3", target: "adv2", relationship: "powers" }, // Codex -> ChatGPT
    { source: "t4", target: "sk2", relationship: "requires" }, // Ollama -> Model Selection
    { source: "t2", target: "adv2", relationship: "integrates" } // Cursor -> ChatGPT (Optional, keeping for structure)
  ]
};

export const generateSkillTree = async (topic: string): Promise<SkillTreeData> => {
  try {
    const prompt = `
      CONTEXT: The user is interested in: "${topic}". 
      This input could be a CAREER (e.g., Nursing, Law), a MAJOR (e.g., Biology), a PROJECT idea, or a technical interest.
      
      TASK: Create a hierarchical "Skill Tree" visualization that explains how AI tools and concepts apply specifically to "${topic}".
      
      CRITICAL STRUCTURE RULES (Strict 5-Level Hierarchy):
      1. **LEVEL 0 (ROOT)**: Start with exactly 1 CORE node: "Domain Knowledge". This represents the user's specific field (${topic}).
      2. **LEVEL 1 (INFRASTRUCTURE)**: Must include "Automation" (e.g., n8n), "Containerization" (e.g., Docker), "Version Control" (e.g., GitHub). These flow FROM Domain Knowledge.
      3. **LEVEL 2 (SKILL)**: Must include "Vibe Coding". This flows FROM Level 1 nodes.
      4. **LEVEL 3 (TOOLS)**: Must include "Cursor", "ChatGPT Codex", "Antigravity", "Ollama". These flow FROM Vibe Coding.
      5. **LEVEL 4 (ADVANCED)**: Must include "Google Gemini", "ChatGPT", "Model Selection".
         - "Google Gemini" must flow FROM "Antigravity".
         - "ChatGPT" must flow FROM "ChatGPT Codex".
         - "Model Selection" must flow FROM "Ollama".
      
      CLASSIFICATION RULES:
      - **SKILL**: Vibe Coding.
      - **TOOL**: Google Gemini, ChatGPT, Model Selection.
      - **CONCEPT**: Cursor, ChatGPT Codex, Antigravity, Ollama, Domain Knowledge.
      
      CONTENT REQUIREMENTS:
      - **ACCURACY IS PARAMOUNT**. Descriptions must be factually correct.
      - **SIMPLE LANGUAGE**: Explain concepts as if to a non-technical friend. Use analogies. Avoid jargon where possible.
      - **LINKS**: You MUST provide a valid 'link' field for every node pointing to the official website or a high-quality resource.
      - **TAGS**: Provide 2-3 relevant tags.
      
      JSON FORMAT:
      Return ONLY a raw JSON object with this structure:
      {
        "nodes": [
          { "id": "string", "label": "string", "category": "NodeType", "description": "string", "difficulty": "string", "tags": ["string"], "link": "https://..." }
        ],
        "links": [
          { "source": "id", "target": "id", "relationship": "string" }
        ]
      }
    `;

    const ai = getAiClient();
    if (!ai) {
      return FALLBACK_DATA;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["CORE", "TOOL", "INFRASTRUCTURE", "CONCEPT", "SKILL"] },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  link: { type: Type.STRING },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "label", "category", "description", "difficulty", "tags"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "ID of the lower/prerequisite node" },
                  target: { type: Type.STRING, description: "ID of the higher/advanced node" },
                  relationship: { type: Type.STRING }
                },
                required: ["source", "target", "relationship"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });

    const text = response.text();
    if (!text) throw new Error("No data returned from AI");

    const data = JSON.parse(text) as SkillTreeData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_DATA;
  }
};
