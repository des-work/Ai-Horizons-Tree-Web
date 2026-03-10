# How to Set Up Local AI with Ollama

AI Horizon uses **Ollama** to run AI models locally on your machine — no API keys or cloud accounts needed.

## Quick Setup

1. **Install Ollama:**
   - Go to https://ollama.com/download
   - Download and install for your OS (Windows, Mac, Linux)

2. **Pull a model:**
   ```bash
   # Any of these will work — pick one based on your hardware
   ollama pull llama3.2        # 3B — fast, works on most machines
   ollama pull llama3.1        # 8B — better quality, needs ~8GB RAM
   ollama pull mistral          # 7B — great all-rounder
   ```

3. **Start Ollama** (it usually runs automatically after install):
   ```bash
   ollama serve
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. **Test it:**
   - Go to http://localhost:3000
   - Enter a field like "Healthcare Projects"
   - Press Enter or click "Explore"
   - Your local model will generate the tree!

## Custom Ollama URL

If Ollama runs on a different host/port, create a `.env` file in the project root:

```bash
OLLAMA_URL=http://localhost:11434
```

## Without Ollama

If Ollama isn't running or no models are installed, the app will:
- Show the fallback demo data
- Display a warning in the console
- Still work for exploring the UI

## Troubleshooting

**Not generating new trees?**
- Make sure Ollama is running: `ollama list` should show your installed models
- Check that the Ollama server is reachable: visit http://localhost:11434 in your browser
- Restart the dev server after any `.env` changes
- Check the browser console for error messages

**Generation is slow?**
- Smaller models (llama3.2 3B, phi3) are faster
- Close other GPU-heavy apps
- Ollama uses GPU by default; if you only have CPU, expect 30-60s per generation
