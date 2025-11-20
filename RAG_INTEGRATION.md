# RAG Integration with Open Notebook

## Overview

This application integrates with Open Notebook for Retrieval-Augmented Generation (RAG) capabilities. The AI agents can now search and use context from your Open Notebook knowledge base.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Open Notebook Configuration
OPEN_NOTEBOOK_URL=http://localhost:8000  # Your Open Notebook instance URL
RAG_ENABLED=true                          # Enable/disable RAG (default: true)
```

### For Vercel Deployment

Set these as environment variables in Vercel:
- `OPEN_NOTEBOOK_URL` - Your deployed Open Notebook URL
- `RAG_ENABLED` - Set to `true` or `false`
- `OPENAI_API_KEY` - Your OpenAI API key

## How It Works

1. **User Query**: When a user asks a question to an AI agent
2. **RAG Search**: The system searches Open Notebook for relevant context
3. **Context Enhancement**: Relevant context is added to the system prompt
4. **AI Response**: OpenAI generates a response using both the context and its knowledge

## Open Notebook API Requirements

The integration expects Open Notebook to have a search endpoint:

```
POST /api/search
Content-Type: application/json

{
  "query": "user question",
  "limit": 5
}

Response:
{
  "results": [
    {
      "content": "relevant text",
      "source": "document name",
      "score": 0.95
    }
  ]
}
```

## Local Development

1. **Start Open Notebook** locally (default: http://localhost:8000)
2. **Update `.env`** with your Open Notebook URL
3. **Start the backend**: `npm run dev:backend`
4. **Test RAG**: Ask questions to AI agents - they'll use Open Notebook context

## Railway Deployment

### Application Deployment

See `RAILWAY_DEPLOYMENT.md` for complete Railway deployment guide.

**Quick Summary:**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add PostgreSQL database in Railway dashboard
5. Deploy: `railway up`

### Open Notebook Deployment

Deploy Open Notebook to Railway as a separate service:
1. Create new Railway service for Open Notebook
2. Add PostgreSQL database for Open Notebook
3. Deploy following Open Notebook's Railway setup
4. Get public URL from Open Notebook service
5. Update `OPEN_NOTEBOOK_URL` in backend environment variables

Both services can be in the same Railway project for easier management.

## Testing RAG Integration

```bash
# Test RAG search directly
curl -X POST http://localhost:3001/api/agents/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agentType": "career",
    "message": "What are the requirements for infantry?"
  }'
```

The response will include `"ragEnabled": true` in metadata if RAG is working.

## Troubleshooting

### RAG Not Working

1. Check `OPEN_NOTEBOOK_URL` is correct
2. Verify Open Notebook is running and accessible
3. Check `RAG_ENABLED` is not set to `false`
4. Review backend logs for RAG errors

### Open Notebook Connection Issues

- Ensure CORS is enabled on Open Notebook
- Check network connectivity
- Verify API endpoint matches expected format

## Architecture

```
User Query
    ↓
AI Agent
    ↓
RAG Service → Open Notebook API
    ↓
Context + Query → OpenAI API
    ↓
Enhanced Response
```

