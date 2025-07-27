# ElevenLabs API Server

This FastAPI server provides REST endpoints for the ElevenLabs conversation data, making it accessible to web applications.

## Features

- **Conversation Management**: Retrieve all conversations with filtering and pagination
- **Conversation Details**: Get detailed information about specific conversations including transcripts
- **Audio Information**: Check audio availability for conversations
- **Phone Numbers**: Get available phone numbers
- **Statistics**: Get overall conversation statistics
- **Search & Filtering**: Search conversations by various criteria
- **CORS Support**: Configured for web application access

## API Endpoints

### Health Check
- `GET /` - Health check endpoint

### Conversations
- `GET /api/conversations` - Get all conversations with pagination and filtering
  - Query parameters:
    - `page` (optional): Page number (default: 1)
    - `page_size` (optional): Items per page (default: 20, max: 100)
    - `search` (optional): Search query
    - `status` (optional): Filter by status
    - `agent_id` (optional): Filter by agent ID

- `GET /api/conversations/{conversation_id}` - Get detailed information about a specific conversation
- `GET /api/conversations/{conversation_id}/audio` - Get audio information for a conversation

### Phone Numbers
- `GET /api/phone-numbers` - Get available phone numbers

### Statistics
- `GET /api/stats` - Get overall conversation statistics

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in the parent directory with your ElevenLabs API key:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```

3. **Start the Server**:
   ```bash
   # Option 1: Use the startup script
   ./start.sh
   
   # Option 2: Run directly
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Access the API**:
   - API Base URL: `http://localhost:8000`
   - Interactive Documentation: `http://localhost:8000/docs`
   - Alternative Documentation: `http://localhost:8000/redoc`

## Frontend Integration

The API is configured with CORS to allow requests from:
- `http://localhost:3000` (Next.js development server)
- `http://127.0.0.1:3000`

### Example Usage in Next.js

```typescript
import { elevenLabsAPI } from './lib/services/elevenlabs-api'

// Get conversations
const conversations = await elevenLabsAPI.getConversations({
  page: 1,
  page_size: 20,
  search: 'appointment'
})

// Get conversation details
const details = await elevenLabsAPI.getConversationDetails('conversation_id')

// Get statistics
const stats = await elevenLabsAPI.getStats()
```

## Response Formats

### Conversation Summary
```json
{
  "conversation_id": "string",
  "agent_id": "string",
  "agent_name": "string",
  "start_time": "string",
  "call_duration_secs": 0,
  "message_count": 0,
  "status": "string",
  "call_successful": true,
  "caller_name": "string",
  "caller_phone": "string",
  "location": "string",
  "summary": "string",
  "outcome": "string",
  "sentiment": "string",
  "rating": 0.0,
  "tags": ["string"]
}
```

### Search Response
```json
{
  "conversations": [...],
  "total_count": 0,
  "page": 1,
  "page_size": 20
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses include a `detail` field with error information.

## Development

- The server runs with auto-reload enabled for development
- API documentation is automatically generated from the code
- CORS is configured for local development
- Environment variables are loaded from `.env` file

## Production Deployment

For production deployment:
1. Set appropriate CORS origins
2. Use a production ASGI server like Gunicorn
3. Configure environment variables securely
4. Set up proper logging and monitoring 