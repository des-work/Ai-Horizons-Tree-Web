# How to Set Up Your Gemini API Key

To enable AI-generated skill trees, you need a Google Gemini API key.

## Quick Setup

1. **Get your API key:**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Create a `.env` file in the project root:**
   ```bash
   # In the same folder as package.json
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

4. **Test it:**
   - Go to http://localhost:8080
   - Enter a field like "Healthcare Projects"
   - Press Enter or click "Explore"
   - You should see a new tree generated!

## Without API Key

If you don't set up an API key, the app will:
- Show the fallback demo data
- Display a warning in the console
- Still work for exploring the UI

## Troubleshooting

**API key not working?**
- Make sure the file is named exactly `.env` (with the dot)
- Ensure there are no extra spaces in `GEMINI_API_KEY=your_key`
- Restart the dev server after creating the file
- Check the browser console for error messages


