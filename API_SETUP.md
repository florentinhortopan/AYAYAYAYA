# API Key Setup Guide

## OpenAI API Key Required

Yes, you **do need an OpenAI API key** for the AI agents to function with full capabilities. However, the system is designed to work gracefully without it for development.

## Current Status

- ✅ **System works without API key** - Returns helpful messages instead of crashing
- ⚠️ **Limited functionality** - Agents will inform users that API key is needed
- ✅ **Ready for API key** - Just add it to `.env` file

## How to Get an OpenAI API Key

1. **Sign up/Login** to OpenAI: https://platform.openai.com/
2. **Navigate to API Keys**: https://platform.openai.com/api-keys
3. **Create a new secret key**
4. **Copy the key** (you won't be able to see it again!)

## Setting Up the API Key

1. Open the `.env` file in the project root
2. Find the line: `OPENAI_API_KEY=your_openai_api_key_here`
3. Replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Restart the backend server** for changes to take effect

## Alternative: Anthropic API

The system also supports Anthropic's Claude API as an alternative:

1. Get an API key from: https://console.anthropic.com/
2. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Cost Considerations

- **OpenAI GPT-4**: More expensive, higher quality
- **OpenAI GPT-3.5-turbo**: More affordable, good quality
- **Anthropic Claude**: Competitive pricing, excellent quality

You can control which model to use by setting:
```
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4, claude-3-opus, etc.
```

## Development Without API Key

The system currently works without an API key:
- ✅ Backend starts successfully
- ✅ API endpoints respond
- ✅ Agents return informative messages about missing API key
- ❌ No actual AI-powered responses

## Testing the Setup

Once you add your API key and restart the server:

```bash
# Test the agent endpoint
curl -X POST http://localhost:3001/api/agents/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agentType": "career",
    "message": "What career paths are available?"
  }'
```

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Don't share your API key publicly
- Monitor your API usage on OpenAI's dashboard
- Set up usage limits to avoid unexpected charges

