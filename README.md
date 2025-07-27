# AI Call Center Dashboard

A comprehensive dashboard for monitoring and analyzing AI agent conversations using ElevenLabs API. This project consists of a FastAPI backend that provides REST endpoints for ElevenLabs conversation data and a Next.js frontend for visualization and analysis.

## 🚀 Features

### Backend (FastAPI)
- **ElevenLabs API Integration**: Connects to ElevenLabs ConvAI API to retrieve conversation data
- **REST API Endpoints**: Provides structured API endpoints for frontend consumption
- **Conversation Management**: Retrieve, filter, and paginate conversations
- **Transcript Analysis**: Access detailed conversation transcripts
- **Audio Information**: Check audio availability for conversations
- **Statistics**: Get comprehensive conversation analytics
- **Search & Filtering**: Advanced search capabilities with multiple criteria

### Frontend (Next.js)
- **Real-time Dashboard**: Live monitoring of AI agent conversations
- **Natural Language Search**: AI-powered search through conversations
- **Conversation Timeline**: Historical conversation analysis
- **Analytics Dashboard**: Performance metrics and insights
- **Live Call Monitoring**: Real-time call tracking
- **Responsive Design**: Modern, mobile-friendly interface

## 📁 Project Structure

```
call-center/
├── api/                          # FastAPI backend
│   ├── main.py                   # Main API server
│   ├── requirements.txt          # Python dependencies
│   ├── start.sh                  # API server startup script
│   └── README.md                # API documentation
├── ai-agent-dashboard/           # Next.js frontend
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   ├── lib/                     # Utilities and services
│   │   └── services/
│   │       ├── elevenlabs-api.ts    # API client
│   │       └── live-data-service.ts # Data service
│   └── package.json             # Node.js dependencies
├── elevenlabs_conversations.py  # Original ElevenLabs API client
├── start.sh                     # Full project startup script
└── README.md                    # This file
```

## 🛠️ Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- ElevenLabs API key

### 1. Environment Setup

Create a `.env` file in the project root with your ElevenLabs API key:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### 2. Quick Start

The easiest way to start the entire project:

```bash
# Make startup script executable
chmod +x start.sh

# Start both API server and frontend
./start.sh
```

This will:
- Start the FastAPI server on `http://localhost:8000`
- Start the Next.js frontend on `http://localhost:3000`
- Open API documentation at `http://localhost:8000/docs`

### 3. Manual Setup

#### Backend Setup
```bash
# Navigate to API directory
cd api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd ai-agent-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔌 API Endpoints

### Conversations
- `GET /api/conversations` - Get all conversations with pagination and filtering
- `GET /api/conversations/{id}` - Get detailed conversation information
- `GET /api/conversations/{id}/audio` - Get audio information

### Statistics
- `GET /api/stats` - Get overall conversation statistics
- `GET /api/phone-numbers` - Get available phone numbers

### Health Check
- `GET /` - Health check endpoint

## 🎯 Usage

### Dashboard Features

1. **Live Call Monitoring**
   - Real-time tracking of active calls
   - Live statistics and metrics
   - Call status updates

2. **Conversation Timeline**
   - Historical conversation analysis
   - Search and filtering capabilities
   - Detailed conversation views

3. **Analytics Dashboard**
   - Performance metrics
   - Success rate analysis
   - Call volume trends

4. **Natural Language Search**
   - AI-powered conversation search
   - Advanced filtering options
   - Intelligent result ranking

### API Integration

The frontend automatically connects to the API server and provides:

- Real-time data updates
- Error handling and retry logic
- Loading states and user feedback
- Responsive design for all devices

## 🔧 Configuration

### Environment Variables

- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `NEXT_PUBLIC_API_URL`: API server URL (defaults to `http://localhost:8000`)

### API Configuration

The API server can be configured in `api/main.py`:

- CORS origins for frontend access
- Pagination limits
- Search and filtering options

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   # Use production ASGI server
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   npm start
   ```

3. **Environment Configuration**
   - Set production CORS origins
   - Configure environment variables
   - Set up proper logging

## 📊 Data Flow

```
ElevenLabs API → FastAPI Server → Next.js Frontend → User Interface
```

1. **ElevenLabs API**: Provides conversation data
2. **FastAPI Server**: Processes and structures the data
3. **Next.js Frontend**: Displays and interacts with the data
4. **User Interface**: Real-time dashboard and analytics

## 🛠️ Development

### Adding New Features

1. **Backend**: Add new endpoints in `api/main.py`
2. **Frontend**: Create new components in `ai-agent-dashboard/components/`
3. **API Client**: Update `ai-agent-dashboard/lib/services/elevenlabs-api.ts`

### Testing

- API endpoints: Use the interactive docs at `http://localhost:8000/docs`
- Frontend: Use browser developer tools and React DevTools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `http://localhost:8000/docs`
2. Review the console logs for error messages
3. Ensure your ElevenLabs API key is valid
4. Check network connectivity between frontend and backend 