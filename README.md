<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Horizons - Dynamic Knowledge Graph Visualization

**AI Horizons** is an interactive, AI-powered visualization tool that generates dynamic skill trees and knowledge graphs based on any topic you enter. Built with React, D3.js, and the Google Gemini API, it transforms abstract concepts into navigable, interconnected constellations of knowledge.

View your app in AI Studio: [https://ai.studio/apps/drive/13mQdvHeNiNElvkm7gza3rMP9mos0__ZD](https://ai.studio/apps/drive/13mQdvHeNiNElvkm7gza3rMP9mos0__ZD)

## 🚀 Key Features

*   **🤖 AI-Powered Generation**: Simply type in a field, major, or interest (e.g., "Neuroscience", "React Development", "Ancient Rome"), and the app uses the Gemini API to intelligently generate a structured tree of core concepts, tools, and skills.
*   **🕸️ Interactive Force-Directed Graph**: Explore the data visually. Nodes naturally organize themselves, and you can drag, zoom, and pan to navigate the knowledge space.
*   **🔍 Deep Dive Details**: Click on any node to open a detail panel containing:
    *   **Description**: A concise explanation of the concept.
    *   **Difficulty Level**: Categorized as Beginner, Intermediate, or Advanced.
    *   **Tags & Resources**: Related keywords and links to learn more.
    *   **Navigation**: "Visit Platform" links to jump to relevant external resources.
*   **🎨 Modern, Responsive Design**: A sleek, dark-mode interface with glassmorphism effects, smooth animations, and a responsive layout that works on desktop and mobile.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Visualization**: [D3.js](https://d3js.org/) (Force Simulation)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Integration**: [Google Gemini API](https://ai.google.dev/)

## 🏃 Run Locally

Follow these steps to get the project running on your local machine.

**Prerequisites:** Node.js (v16 or higher recommended)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
    *(Note: Ensure the variable name matches what is used in `services/geminiService.ts`. If the code uses a different variable name like `GEMINI_API_KEY`, please adjust accordingly. Standard Vite apps usually require `VITE_` prefix for client-side exposure unless configured otherwise.)*

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage Guide

1.  **Enter a Prompt**: In the top search bar, type a topic you want to explore (e.g., "Machine Learning").
2.  **Explore**: Watch as the graph generates.
    *   **Blue Nodes**: Core Concepts
    *   **Green Nodes**: Tools/Technologies
    *   **Purple Nodes**: Skills
    *   **Grey Nodes**: Infrastructure/Foundations
3.  **Interact**:
    *   **Drag** nodes to rearrange the view.
    *   **Scroll** to zoom in/out.
    *   **Click** a node to view details in the sidebar.
