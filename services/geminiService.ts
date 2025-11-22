
import { GoogleGenAI, Type } from "@google/genai";
import { SkillTreeData, NodeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Default fallback data with 3 distinct CORE roots and bottom-up flow
export const FALLBACK_DATA: SkillTreeData = {
  nodes: [
    // --- LEVEL 0: ROOTS (CORE) ---
    { id: "c1", label: "Theoretical Foundations", category: NodeType.CORE, description: "The mathematical and scientific principles underpinning artificial intelligence, including calculus, linear algebra, and probability.", difficulty: "Advanced", tags: ["Math", "Theory"] },
    { id: "c2", label: "Engineering Infrastructure", category: NodeType.CORE, description: "The hardware, cloud systems, and deployment pipelines necessary to run and scale AI models.", difficulty: "Intermediate", tags: ["DevOps", "Systems"] },
    { id: "c3", label: "Human-AI Interaction", category: NodeType.CORE, description: "The design, psychology, and interface patterns that define how humans collaborate with intelligent systems.", difficulty: "Beginner", tags: ["UX", "Design"] },

    // --- LEVEL 1: SKILLS ---
    { id: "sk1", label: "Prompt Engineering", category: NodeType.SKILL, description: "The skill of crafting precise inputs (prompts) to guide Large Language Models (LLMs) toward desired outputs.", difficulty: "Beginner", tags: ["Prompting", "Communication"] },
    { id: "sk2", label: "Vibe Coding", category: NodeType.SKILL, description: "A modern coding approach prioritizing flow and intuition, often using natural language to generate code via AI.", difficulty: "Intermediate", tags: ["FutureOfWork", "Coding"] },
    { id: "con1", label: "LLM Architecture", category: NodeType.CONCEPT, description: "Understanding the Transformer architecture and attention mechanisms that power tools like GPT and Gemini.", difficulty: "Advanced", tags: ["NLP", "Deep Learning"] },

    // --- LEVEL 2: INFRASTRUCTURE (Enablers) ---
    { id: "t1", label: "GitHub", category: NodeType.INFRASTRUCTURE, description: "The essential platform for version control and collaboration. While not an AI tool itself, it is where the AI ecosystem lives, hosting datasets, model weights, and open-source agents.", difficulty: "Beginner", tags: ["Collaboration", "Git"] },
    { id: "t2", label: "Docker", category: NodeType.INFRASTRUCTURE, description: "A tool for containerization. It is critical for AI to ensure that models run consistently across different machines, but it is a general software engineering tool, not specific to AI.", difficulty: "Intermediate", tags: ["Containers", "DevOps"] },
    
    // --- LEVEL 2.5: TOOLS (AI Specific) ---
    { id: "t3", label: "Ollama", category: NodeType.TOOL, description: "An open-source tool that allows you to run powerful LLMs (like Llama 3) locally on your own machine without needing a cloud API.", difficulty: "Intermediate", tags: ["Local AI", "Privacy"] },
    
    // --- LEVEL 3: ADVANCED APPS ---
    { id: "t4", label: "ChatGPT", category: NodeType.TOOL, description: "OpenAI's consumer-facing AI chat interface. It popularized RLHF (Reinforcement Learning from Human Feedback) for conversational capabilities.", difficulty: "Beginner", tags: ["Chat", "Assistant"] },
    { id: "t5", label: "Google Gemini", category: NodeType.TOOL, description: "Google's native multimodal model capable of reasoning across text, images, video, and code seamlessly in a single context window.", difficulty: "Intermediate", tags: ["Multimodal", "Reasoning"] },
    { id: "t6", label: "ComfyUI", category: NodeType.TOOL, description: "A node-based graphical user interface for Stable Diffusion. It allows for complex, modular image generation workflows.", difficulty: "Advanced", tags: ["Generative Art", "Nodes"] },
    
    // --- LEVEL 4: ORCHESTRATION & FUTURE ---
    { id: "t7", label: "n8n", category: NodeType.INFRASTRUCTURE, description: "A workflow automation platform. It acts as the 'glue' connecting AI agents to other apps (Slack, Email). It is a general automation tool enhanced by AI.", difficulty: "Intermediate", tags: ["Automation", "Low-Code"] },
    { id: "con2", label: "Google Antigravity", category: NodeType.CONCEPT, description: "A metaphorical or experimental design paradigm representing fluid, physics-defying interfaces where AI elements float and reorganize dynamically.", difficulty: "Advanced", tags: ["Experimental", "UI/UX"] },

  ],
  links: [
    // Foundations
    { source: "c1", target: "con1", relationship: "underpins" },
    { source: "c2", target: "t1", relationship: "stores code in" },
    { source: "c2", target: "t2", relationship: "runs environments in" },
    { source: "c3", target: "sk1", relationship: "requires" },

    // Mid-Level
    { source: "con1", target: "t5", relationship: "enables" },
    { source: "con1", target: "t4", relationship: "enables" },
    { source: "t2", target: "t3", relationship: "hosts" },
    { source: "t1", target: "sk2", relationship: "facilitates sharing for" },

    // Advanced Connections
    { source: "sk2", target: "t7", relationship: "automates via" }, // Vibe coding -> n8n
    { source: "t3", target: "t6", relationship: "generates assets for" }, // Ollama -> ComfyUI
    { source: "sk1", target: "t4", relationship: "optimizes" },
    
    // Gemini Integration
    { source: "t5", target: "con2", relationship: "inspires" }, // Gemini -> Antigravity
    { source: "t5", target: "t7", relationship: "powers agents in" }, // Gemini -> n8n
    
    // Cross links
    { source: "sk1", target: "t6", relationship: "guides generation in" }
  ]
};

export const generateSkillTree = async (topic: string): Promise<SkillTreeData> => {
  try {
    const prompt = `
      CONTEXT: The user is interested in: "${topic}". 
      This input could be a CAREER (e.g., Nursing, Law), a MAJOR (e.g., Biology), a PROJECT idea, or a technical interest.
      
      TASK: Create a hierarchical "Skill Tree" visualization that explains how AI tools and concepts apply specifically to "${topic}".
      
      CRITICAL STRUCTURE RULES (BOTTOM-UP):
      1. Start with exactly 3 "CORE" nodes at the bottom. 
         - Core 1: Foundations (Relevant theoretical basics for ${topic})
         - Core 2: Infrastructure (The necessary environment/systems for ${topic})
         - Core 3: Application/Interaction (How users in ${topic} interact with AI)
      2. All other nodes must flow upwards from these cores.
      
      CLASSIFICATION RULES:
      - **INFRASTRUCTURE**: Use this category for tools that are NOT AI themselves but are essential for the ecosystem (e.g., GitHub, Docker, n8n).
      - **TOOL**: Use this category for actual AI models or AI-powered applications (e.g., ChatGPT, Gemini, Ollama, ComfyUI).
      
      MANDATORY NODES (Connect these to the user's topic, explaining their specific relevance):
      - Google Antigravity (Concept: Breaking boundaries/Physics of UI/New Paradigms)
      - GitHub (Category: INFRASTRUCTURE. Relevance: Collaboration/Sharing Knowledge)
      - Docker (Category: INFRASTRUCTURE. Relevance: Consistency/Environment)
      - Ollama (Category: TOOL. Relevance: Privacy/Local Operation)
      - ComfyUI (Category: TOOL. Relevance: Visual/Diagram Generation)
      - n8n (Category: INFRASTRUCTURE. Relevance: Workflow Automation)
      - ChatGPT (Category: TOOL. Relevance: Assistant/Reasoning)
      - Google Gemini (Category: TOOL. Relevance: Multimodal Analysis)
      
      CONTENT REQUIREMENTS:
      - **ACCURACY IS PARAMOUNT**. Descriptions must be factually correct.
      - **CONTEXTUALIZE**: If the topic is "Nursing", describe "GitHub" as a place to share research protocols, or "Ollama" as a way to run HIPAA-compliant local models. Do not just give generic tech definitions.
      - Link 'relationship' text should explain WHY they are connected in this specific context.
      
      Output JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    const data = JSON.parse(text) as SkillTreeData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_DATA;
  }
};
