#!/usr/bin/env python3
"""
ElevenLabs API REST Server

This FastAPI application provides REST endpoints for the ElevenLabs API,
making it accessible to web applications.
"""

import os
import sys
import logging
import traceback
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
from elevenlabs_conversations import ElevenLabsAPI
from area_code_mapping import get_location_from_phone_number

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('api_server.log')
    ]
)
logger = logging.getLogger(__name__)

# Add the parent directory to the path so we can import the ElevenLabsAPI
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from elevenlabs_conversations import ElevenLabsAPI
    logger.info("Successfully imported ElevenLabsAPI from parent directory")
except ImportError:
    # Try importing from the current directory if the above fails
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        from elevenlabs_conversations import ElevenLabsAPI
        logger.info("Successfully imported ElevenLabsAPI from current directory")
    except ImportError as e:
        logger.error(f"Failed to import ElevenLabsAPI: {e}")
        raise

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

# Initialize FastAPI app
app = FastAPI(
    title="ElevenLabs API Server",
    description="REST API server for ElevenLabs conversation data",
    version="1.0.0"
)
logger.info("FastAPI app initialized")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Your Next.js app
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
logger.info("CORS middleware configured")

# Pydantic models for API responses
class PhoneCallInfo(BaseModel):
    direction: Optional[str] = None
    phone_number_id: Optional[str] = None
    agent_number: Optional[str] = None
    external_number: Optional[str] = None
    type: Optional[str] = None
    stream_sid: Optional[str] = None
    call_sid: Optional[str] = None

class TranscriptMessage(BaseModel):
    role: str
    message: str = ""  # Default to empty string, never None
    time_in_call_secs: Optional[float] = None

class ConversationSummary(BaseModel):
    conversation_id: str
    agent_id: str
    agent_name: str
    start_time: str
    call_duration_secs: int
    message_count: int
    status: str
    call_successful: bool
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    outcome: Optional[str] = None
    sentiment: Optional[str] = None
    rating: Optional[float] = None
    tags: Optional[List[str]] = None
    phone_call: Optional[PhoneCallInfo] = None

class ConversationDetails(BaseModel):
    conversation_id: str
    agent_id: str
    agent_name: str
    status: str
    call_successful: bool
    start_time: str
    call_duration_secs: int
    message_count: int
    transcript: List[TranscriptMessage]
    has_audio: bool
    has_user_audio: bool
    has_response_audio: bool
    metadata: Optional[Dict[str, Any]] = None
    phone_call: Optional[PhoneCallInfo] = None

class AudioInfo(BaseModel):
    conversation_id: str
    has_audio: bool
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    filename: Optional[str] = None

class PhoneNumber(BaseModel):
    phone_number: str
    label: Optional[str] = None
    supports_inbound: Optional[bool] = None
    supports_outbound: Optional[bool] = None
    phone_number_id: Optional[str] = None
    assigned_agent: Optional[Dict[str, str]] = None
    provider: Optional[str] = None
    description: Optional[str] = None

class SearchResponse(BaseModel):
    conversations: List[ConversationSummary]
    total_count: int
    page: int
    page_size: int

# Initialize API client
try:
    # Use the same API key as in elevenlabs_conversations.py
    api_key = os.getenv('ELEVENLABS_API_KEY') or "sk_467eaffa636aa327e1710b5079372557aa112eac1ed4890e"
    logger.info(f"Initializing ElevenLabs API client with key: {api_key[:20]}...")
    api_client = ElevenLabsAPI(api_key=api_key)
    logger.info("✓ Successfully initialized ElevenLabs API client")
except Exception as e:
    logger.error(f"Failed to initialize ElevenLabs API client: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    api_client = None

# Phone number geolocation service
class PhoneGeolocationService:
    def __init__(self):
        # NumVerify API (free tier: 100 requests/month)
        self.numverify_api_key = os.getenv("NUMVERIFY_API_KEY")
        self.numverify_url = "http://apilayer.net/api/validate"
        
        # Fallback: Abstract API (free tier: 100 requests/month)
        self.abstract_api_key = os.getenv("ABSTRACT_API_KEY")
        self.abstract_url = "https://phonevalidation.abstractapi.com/v1/"
        
        # OpenCage for reverse geocoding (free tier: 2,500 requests/day)
        self.opencage_api_key = os.getenv("OPENCAGE_API_KEY")
        self.opencage_url = "https://api.opencagedata.com/geocode/v1/json"
    
    def get_phone_location(self, phone_number: str) -> Optional[dict]:
        """Get location information for a phone number"""
        try:
            # Try NumVerify first
            if self.numverify_api_key:
                location = self._try_numverify(phone_number)
                if location:
                    return location
            
            # Try Abstract API as fallback
            if self.abstract_api_key:
                location = self._try_abstract_api(phone_number)
                if location:
                    return location
            
            # Use comprehensive area code mapping as final fallback
            return self._area_code_fallback(phone_number)
            
        except Exception as e:
            logger.error(f"Error getting phone location for {phone_number}: {e}")
            return self._area_code_fallback(phone_number)
    
    def _try_numverify(self, phone_number: str) -> Optional[dict]:
        """Try NumVerify API"""
        try:
            params = {
                'access_key': self.numverify_api_key,
                'number': phone_number,
                'format': 1
            }
            response = requests.get(self.numverify_url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('valid'):
                return {
                    'country': data.get('country_name'),
                    'region': data.get('location'),
                    'carrier': data.get('carrier'),
                    'line_type': data.get('line_type'),
                    'formatted': data.get('international_format')
                }
        except Exception as e:
            logger.error(f"NumVerify API error: {e}")
        return None
    
    def _try_abstract_api(self, phone_number: str) -> Optional[dict]:
        """Try Abstract API"""
        try:
            params = {
                'api_key': self.abstract_api_key,
                'phone': phone_number
            }
            response = requests.get(self.abstract_url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('valid'):
                return {
                    'country': data.get('country', {}).get('name'),
                    'region': data.get('region', {}).get('name'),
                    'carrier': data.get('carrier'),
                    'line_type': data.get('type'),
                    'formatted': data.get('format', {}).get('international')
                }
        except Exception as e:
            logger.error(f"Abstract API error: {e}")
        return None
    
    def _area_code_fallback(self, phone_number: str) -> dict:
        """Use comprehensive area code mapping"""
        location = get_location_from_phone_number(phone_number)
        
        return {
            'country': 'United States',
            'region': location,
            'carrier': 'Unknown',
            'line_type': 'mobile',
            'formatted': phone_number
        }

# Initialize geolocation service
geolocation_service = PhoneGeolocationService()

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    """Handle preflight OPTIONS requests"""
    logger.info(f"Handling preflight request for path: {full_path}")
    return {"message": "OK"}

@app.get("/")
async def root():
    """Health check endpoint"""
    logger.info("Health check endpoint accessed")
    return {"message": "ElevenLabs API Server is running", "status": "healthy"}

@app.get("/api/conversations", response_model=SearchResponse)
async def get_conversations(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Number of conversations per page"),
    search: Optional[str] = Query(default=None, description="Search query for conversations"),
    status: Optional[str] = Query(default=None, description="Filter by conversation status"),
    agent_id: Optional[str] = Query(default=None, description="Filter by agent ID")
):
    """Get all conversations with optional filtering and pagination"""
    logger.info(f"GET /api/conversations called with params: page={page}, page_size={page_size}, search={search}, status={status}, agent_id={agent_id}")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info("Retrieving conversations from ElevenLabs API...")
        conversations = api_client.get_conversations()
        logger.info(f"Retrieved {len(conversations)} conversations from API")
        
        # Apply filters
        filtered_conversations = conversations
        logger.info(f"Starting with {len(filtered_conversations)} conversations")
        
        if status:
            filtered_conversations = [c for c in filtered_conversations if c.get('status') == status]
            logger.info(f"After status filter '{status}': {len(filtered_conversations)} conversations")
        
        if agent_id:
            filtered_conversations = [c for c in filtered_conversations if c.get('agent_id') == agent_id]
            logger.info(f"After agent_id filter '{agent_id}': {len(filtered_conversations)} conversations")
        
        if search:
            # Simple text search in conversation data
            search_lower = search.lower()
            filtered_conversations = [
                c for c in filtered_conversations
                if (search_lower in str(c.get('agent_name', '')).lower() or
                    search_lower in str(c.get('conversation_id', '')).lower())
            ]
            logger.info(f"After search filter '{search}': {len(filtered_conversations)} conversations")
        
        # Apply pagination
        total_count = len(filtered_conversations)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_conversations = filtered_conversations[start_idx:end_idx]
        logger.info(f"Pagination: showing {len(paginated_conversations)} conversations (page {page}, size {page_size})")
        
        # Convert to response format
        conversation_summaries = []
        for i, conv in enumerate(paginated_conversations):
            try:
                conv_id = conv.get('conversation_id', 'unknown')
                logger.info(f"Processing conversation {i+1}/{len(paginated_conversations)}: {conv_id}")
                
                # Extract caller information from transcript or metadata
                caller_name = None
                caller_phone = None
                location = None
                summary = None
                outcome = None
                sentiment = None
                rating = None
                tags = []
                
                # Try to get more details for this conversation
                if conv_id:
                    logger.info(f"Getting details for conversation: {conv_id}")
                    details = api_client.get_conversation_details(conv_id)
                    if details:
                        logger.info(f"Retrieved details for conversation {conv_id}")
                        logger.info(f"Details keys: {list(details.keys())}")
                        
                        # Print detailed metadata information from detailed conversation
                        details_metadata = details.get('metadata', {})
                        logger.info(f"📋 DETAILED METADATA for conversation {conv_id}:")
                        logger.info(f"   Metadata keys: {list(details_metadata.keys())}")
                        logger.info(f"   Full metadata: {details_metadata}")
                        
                        # Show user-friendly phone information from detailed data
                        if details_metadata.get('phone_number'):
                            phone_number_data = details_metadata.get('phone_number', {})
                            logger.info(f"📱 DETAILED PHONE NUMBER INFO:")
                            logger.info(f"   Phone Number: {phone_number_data.get('phone_number', 'N/A')}")
                            logger.info(f"   Label: {phone_number_data.get('label', 'N/A')}")
                            logger.info(f"   Provider: {phone_number_data.get('provider', 'N/A')}")
                            if phone_number_data.get('assigned_agent'):
                                agent = phone_number_data.get('assigned_agent', {})
                                logger.info(f"   Assigned Agent: {agent.get('agent_name', 'N/A')}")
                        else:
                            logger.info(f"❌ No phone_number data found in detailed metadata")
                        
                        if details_metadata.get('phone_call'):
                            logger.info(f"📞 Found phone_call in details metadata: {details_metadata.get('phone_call')}")
                        else:
                            logger.info(f"❌ No phone_call in details metadata for {conv_id}")
                        
                        # Extract summary and other details from transcript
                        transcript = details.get('transcript', [])
                        if transcript:
                            logger.info(f"Processing transcript with {len(transcript)} messages")
                            # Generate a simple summary from the first few messages
                            messages = [msg.get('message', '') or '' for msg in transcript[:3]]
                            summary = " ".join(messages)[:100] + "..." if messages and any(messages) else None
                            
                            # Determine outcome based on conversation content
                            full_text = " ".join([msg.get('message', '') or '' for msg in transcript]).lower()
                            if 'appointment' in full_text:
                                outcome = "Appointment Scheduled"
                            elif 'information' in full_text:
                                outcome = "Information Inquiry"
                            elif 'reschedule' in full_text:
                                outcome = "Appointment Rescheduled"
                            else:
                                outcome = "General Inquiry"
                            
                            # Simple sentiment analysis
                            positive_words = ['good', 'great', 'excellent', 'happy', 'satisfied']
                            negative_words = ['bad', 'terrible', 'unhappy', 'dissatisfied', 'angry']
                            
                            positive_count = sum(1 for word in positive_words if word in full_text)
                            negative_count = sum(1 for word in negative_words if word in full_text)
                            
                            if positive_count > negative_count:
                                sentiment = "Positive"
                            elif negative_count > positive_count:
                                sentiment = "Negative"
                            else:
                                sentiment = "Neutral"
                            
                            # Generate a random rating (in real implementation, this would come from actual data)
                            import random
                            rating = round(random.uniform(3.5, 5.0), 1)
                            
                            # Generate tags based on content
                            if 'appointment' in full_text:
                                tags.extend(['Appointments', '#appointment'])
                            if 'dr.' in full_text or 'doctor' in full_text:
                                tags.extend(['#doctor'])
                            if 'urgent' in full_text or 'emergency' in full_text:
                                tags.extend(['#urgent'])
                            tags.extend(['#general'])
                            
                            logger.info(f"Generated summary for {conv_id}: outcome={outcome}, sentiment={sentiment}, rating={rating}")
                    else:
                        logger.warning(f"No details found for conversation {conv_id}")
                
                # Generate caller name from agent name or conversation ID
                agent_name = conv.get('agent_name', 'Unknown')
                if agent_name == 'Eric':
                    caller_name = f"Caller {conv.get('conversation_id', '')[-4:]}"
                elif agent_name == 'Emma':
                    caller_name = f"Patient {conv.get('conversation_id', '')[-4:]}"
                else:
                    caller_name = f"User {conv.get('conversation_id', '')[-4:]}"
                
                # Generate phone number from conversation details or use a placeholder
                # In real implementation, this would come from the phone_call data
                caller_phone = None
                
                # Debug: Log what's in the conversation object
                logger.info(f"Conversation {conv_id} keys: {list(conv.keys())}")
                
                # Print detailed metadata information
                metadata = conv.get('metadata', {})
                logger.info(f"📋 METADATA DETAILS for conversation {conv_id}:")
                logger.info(f"   Metadata keys: {list(metadata.keys())}")
                logger.info(f"   Full metadata: {metadata}")
                
                # Show user-friendly phone information
                if metadata.get('phone_number'):
                    phone_number_data = metadata.get('phone_number', {})
                    logger.info(f"📱 PHONE NUMBER INFO:")
                    logger.info(f"   Phone Number: {phone_number_data.get('phone_number', 'N/A')}")
                    logger.info(f"   Label: {phone_number_data.get('label', 'N/A')}")
                    logger.info(f"   Provider: {phone_number_data.get('provider', 'N/A')}")
                    if phone_number_data.get('assigned_agent'):
                        agent = phone_number_data.get('assigned_agent', {})
                        logger.info(f"   Assigned Agent: {agent.get('agent_name', 'N/A')}")
                else:
                    logger.info(f"❌ No phone_number data found in metadata")
                
                if metadata.get('phone_call'):
                    logger.info(f"📞 Found phone_call data in metadata: {metadata.get('phone_call')}")
                else:
                    logger.info(f"❌ No phone_call data found in metadata for conversation {conv_id}")
                
                # Try to get phone number from conversation metadata
                if conv.get('metadata', {}).get('phone_call'):
                    phone_call = conv.get('metadata', {}).get('phone_call', {})
                    caller_phone = phone_call.get('external_number') or phone_call.get('agent_number')
                    logger.info(f"Extracted phone number from metadata: {caller_phone}")
                
                # If we have detailed conversation data, try to get phone number from there
                if not caller_phone and details and details.get('metadata', {}).get('phone_call'):
                    phone_call = details.get('metadata', {}).get('phone_call', {})
                    caller_phone = phone_call.get('external_number') or phone_call.get('agent_number')
                    logger.info(f"Extracted phone number from details metadata: {caller_phone}")
                
                # If no phone number found, use a generic placeholder
                if not caller_phone:
                    caller_phone = "+1-XXX-XXX-XXXX"  # Generic placeholder
                    logger.info(f"Using placeholder phone number: {caller_phone}")
                
                # Get real location from phone number using comprehensive area code mapping
                try:
                    location_info = geolocation_service.get_phone_location(caller_phone)
                    location = location_info.get('region', 'Unknown Location')
                    logger.debug(f"Location for {caller_phone}: {location}")
                except Exception as e:
                    logger.warning(f"Failed to get location for {caller_phone}: {e}")
                    location = "Unknown Location"
                
                # Convert call_successful from string to boolean
                call_successful_raw = conv.get('call_successful', False)
                if isinstance(call_successful_raw, str):
                    call_successful = call_successful_raw.lower() in ['success', 'true', '1', 'yes']
                else:
                    call_successful = bool(call_successful_raw)
                
                # Extract phone call information from conversation details
                phone_call_info = None
                phone_call_data = None
                
                # Try to get phone call data from conversation metadata
                if conv.get('metadata', {}).get('phone_call'):
                    phone_call_data = conv.get('metadata', {}).get('phone_call', {})
                    logger.info(f"Using phone_call from conversation metadata: {phone_call_data}")
                
                # If not available in conversation metadata, try detailed data metadata
                elif details and details.get('metadata', {}).get('phone_call'):
                    phone_call_data = details.get('metadata', {}).get('phone_call', {})
                    logger.info(f"Using phone_call from detailed data metadata: {phone_call_data}")
                
                # Create PhoneCallInfo if we have data
                if phone_call_data:
                    phone_call_info = PhoneCallInfo(
                        direction=phone_call_data.get('direction'),
                        phone_number_id=phone_call_data.get('phone_number_id'),
                        agent_number=phone_call_data.get('agent_number'),
                        external_number=phone_call_data.get('external_number'),
                        type=phone_call_data.get('type'),
                        stream_sid=phone_call_data.get('stream_sid'),
                        call_sid=phone_call_data.get('call_sid')
                    )
                    logger.info(f"Created PhoneCallInfo: {phone_call_info}")
                else:
                    logger.info(f"No phone_call data available in metadata for conversation {conv_id}")
                
                conversation_summaries.append(ConversationSummary(
                    conversation_id=conv.get('conversation_id', ''),
                    agent_id=conv.get('agent_id', ''),
                    agent_name=agent_name,
                    start_time=datetime.fromtimestamp(conv.get('start_time_unix_secs', 0)).strftime("%Y-%m-%d %H:%M:%S UTC"),
                    call_duration_secs=conv.get('call_duration_secs', 0),
                    message_count=conv.get('message_count', 0),
                    status=conv.get('status', 'unknown'),
                    call_successful=call_successful,
                    caller_name=caller_name,
                    caller_phone=caller_phone,
                    location=location,
                    summary=summary,
                    outcome=outcome,
                    sentiment=sentiment,
                    rating=rating,
                    tags=tags,
                    phone_call=phone_call_info
                ))
                logger.debug(f"Successfully processed conversation {conv_id}")
            except Exception as conv_error:
                logger.error(f"Error processing conversation {conv.get('conversation_id', 'unknown')}: {str(conv_error)}")
                logger.error(f"Traceback for conversation error: {traceback.format_exc()}")
                # Skip this conversation and continue with the next one
                continue
        
        logger.info(f"Successfully processed {len(conversation_summaries)} conversations")
        response = SearchResponse(
            conversations=conversation_summaries,
            total_count=total_count,
            page=page,
            page_size=page_size
        )
        logger.info(f"Returning response with {len(conversation_summaries)} conversations")
        return response
        
    except Exception as e:
        logger.error(f"Error in get_conversations: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")

@app.get("/api/conversations/{conversation_id}", response_model=ConversationDetails)
async def get_conversation_details(conversation_id: str):
    """Get detailed information about a specific conversation"""
    logger.info(f"GET /api/conversations/{conversation_id} called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info(f"Retrieving details for conversation: {conversation_id}")
        details = api_client.get_conversation_details(conversation_id)
        if not details:
            logger.warning(f"Conversation not found: {conversation_id}")
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        logger.info(f"Retrieved details for conversation {conversation_id}")
        
        # Convert transcript to our format
        transcript_messages = []
        transcript = details.get('transcript', [])
        logger.info(f"Processing transcript with {len(transcript)} messages")
        
        for i, msg in enumerate(transcript):
            # Get message content and ensure it's a string
            message_content = msg.get('message')
            
            # Log the raw message for debugging
            logger.debug(f"Raw message {i+1}: {msg}")
            
            # Skip messages with None content, but keep empty strings
            if message_content is None:
                logger.debug(f"Skipping message {i+1}: None content")
                continue
            
            # Convert to string and ensure it's not None
            message_str = str(message_content) if message_content is not None else ""
            
            try:
                transcript_messages.append(TranscriptMessage(
                    role=str(msg.get('role', 'unknown')),  # Ensure role is a string
                    message=message_str,  # Always a string, never None
                    time_in_call_secs=msg.get('time_in_call_secs')
                ))
                if i < 5:  # Log first 5 messages for debugging
                    logger.debug(f"Message {i+1}: role={msg.get('role')}, message_length={len(message_str)}")
            except Exception as e:
                logger.error(f"Error processing message {i+1}: {e}")
                logger.error(f"Message data: {msg}")
                continue
        
        logger.info(f"Processed {len(transcript_messages)} valid messages out of {len(transcript)} total messages")
        
        # Extract phone call information
        phone_call_data = details.get('phone_call', {})
        phone_call_info = None
        if phone_call_data:
            phone_call_info = PhoneCallInfo(
                direction=phone_call_data.get('direction'),
                phone_number_id=phone_call_data.get('phone_number_id'),
                agent_number=phone_call_data.get('agent_number'),
                external_number=phone_call_data.get('external_number'),
                type=phone_call_data.get('type'),
                stream_sid=phone_call_data.get('stream_sid'),
                call_sid=phone_call_data.get('call_sid')
            )
        
        response = ConversationDetails(
            conversation_id=conversation_id,
            agent_id=details.get('agent_id', ''),
            agent_name=details.get('agent_name', ''),
            status=details.get('status', ''),
            call_successful=details.get('call_successful', False),
            start_time=datetime.fromtimestamp(details.get('metadata', {}).get('start_time_unix_secs', 0)).strftime("%Y-%m-%d %H:%M:%S UTC"),
            call_duration_secs=details.get('metadata', {}).get('call_duration_secs', 0),
            message_count=details.get('message_count', 0),
            transcript=transcript_messages,
            has_audio=details.get('has_audio', False),
            has_user_audio=details.get('has_user_audio', False),
            has_response_audio=details.get('has_response_audio', False),
            metadata=details.get('metadata'),
            phone_call=phone_call_info
        )
        
        logger.info(f"Successfully processed conversation details for {conversation_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation details for {conversation_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation details: {str(e)}")

@app.get("/api/conversations/{conversation_id}/transcript")
async def get_conversation_transcript(conversation_id: str):
    """Get the transcript for a specific conversation"""
    logger.info(f"GET /api/conversations/{conversation_id}/transcript called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info(f"Retrieving transcript for conversation: {conversation_id}")
        transcript_data = api_client.get_conversation_transcript(conversation_id)
        if not transcript_data:
            logger.warning(f"Transcript not found for conversation: {conversation_id}")
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        logger.info(f"Successfully retrieved transcript for conversation {conversation_id}")
        return transcript_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving transcript for {conversation_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving transcript: {str(e)}")

@app.get("/api/conversations/{conversation_id}/audio/file")
async def get_conversation_audio_file(conversation_id: str):
    """Get the actual audio file for a specific conversation"""
    logger.info(f"GET /api/conversations/{conversation_id}/audio/file called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info(f"Retrieving audio file for conversation: {conversation_id}")
        audio_data = api_client.get_conversation_audio(conversation_id)
        
        logger.info(f"AUDIO FILE ENDPOINT - Raw audio_data keys: {list(audio_data.keys()) if audio_data else 'None'}")
        
        if not audio_data:
            logger.warning(f"No audio data found for conversation: {conversation_id}")
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Check for raw audio data
        raw_data = audio_data.get('raw_data')
        logger.info(f"AUDIO FILE ENDPOINT - Raw data type: {type(raw_data)}")
        logger.info(f"AUDIO FILE ENDPOINT - Raw data length: {len(raw_data) if raw_data else 0}")
        
        if raw_data:
            logger.info(f"AUDIO FILE ENDPOINT - Raw data first 50 bytes: {raw_data[:50]}")
            logger.info(f"AUDIO FILE ENDPOINT - Raw data last 50 bytes: {raw_data[-50:]}")
            logger.info(f"AUDIO FILE ENDPOINT - Raw data is bytes: {isinstance(raw_data, bytes)}")
        
        if not raw_data:
            logger.warning(f"No raw audio data found for conversation: {conversation_id}")
            logger.warning(f"AUDIO FILE ENDPOINT - Available keys: {list(audio_data.keys())}")
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        content_type = audio_data.get('content_type', 'audio/mpeg')
        filename = audio_data.get('filename', f"conversation_{conversation_id}.audio")
        
        logger.info(f"Serving audio file for {conversation_id}: content_type={content_type}, size={len(raw_data)}")
        logger.info(f"AUDIO FILE ENDPOINT - Filename: {filename}")
        
        # Return the audio file as a streaming response
        from fastapi.responses import Response
        return Response(
            content=raw_data,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "public, max-age=3600"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving audio file for {conversation_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error serving audio file: {str(e)}")

@app.get("/api/conversations/{conversation_id}/audio", response_model=AudioInfo)
async def get_conversation_audio(conversation_id: str):
    """Get audio information for a specific conversation"""
    logger.info(f"GET /api/conversations/{conversation_id}/audio called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info(f"Retrieving audio info for conversation: {conversation_id}")
        audio_info = api_client.get_conversation_audio(conversation_id)
        
        logger.info(f"AUDIO INFO ENDPOINT - Raw audio_info keys: {list(audio_info.keys()) if audio_info else 'None'}")
        
        if not audio_info:
            logger.info(f"No audio found for conversation {conversation_id}")
            return AudioInfo(
                conversation_id=conversation_id,
                has_audio=False
            )
        
        has_audio = bool(audio_info.get('raw_data'))
        logger.info(f"Audio info for {conversation_id}: has_audio={has_audio}, content_type={audio_info.get('content_type')}, size_bytes={audio_info.get('size_bytes')}")
        logger.info(f"AUDIO INFO ENDPOINT - Has raw_data: {bool(audio_info.get('raw_data'))}")
        logger.info(f"AUDIO INFO ENDPOINT - Raw data length: {len(audio_info.get('raw_data', b''))}")
        
        return AudioInfo(
            conversation_id=conversation_id,
            has_audio=has_audio,
            content_type=audio_info.get('content_type'),
            size_bytes=audio_info.get('size_bytes'),
            filename=audio_info.get('filename')
        )
        
    except Exception as e:
        logger.error(f"Error retrieving audio information for {conversation_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving audio information: {str(e)}")

@app.get("/api/phone-numbers", response_model=List[PhoneNumber])
async def get_phone_numbers():
    """Get available phone numbers"""
    logger.info("GET /api/phone-numbers called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info("Retrieving phone numbers from ElevenLabs API")
        phone_numbers = api_client.get_phone_numbers()
        logger.info(f"Retrieved {len(phone_numbers)} phone numbers")
        logger.info(f"Phone numbers data: {phone_numbers}")
        logger.info(f"Phone numbers type: {type(phone_numbers)}")
        
        # Convert the phone number data to our PhoneNumber model
        response = []
        for phone in phone_numbers:
            logger.info(f"Processing phone number: {phone}")
            logger.info(f"Phone type: {type(phone)}")
            logger.info(f"Phone keys: {list(phone.keys()) if isinstance(phone, dict) else 'Not a dict'}")
            
            # Check if the phone object itself is the phone number data
            if isinstance(phone, dict) and 'phone_number' in phone:
                # This is the correct structure
                phone_obj = PhoneNumber(
                    phone_number=phone.get('phone_number', ''),
                    label=phone.get('label'),
                    supports_inbound=phone.get('supports_inbound'),
                    supports_outbound=phone.get('supports_outbound'),
                    phone_number_id=phone.get('phone_number_id'),
                    assigned_agent=phone.get('assigned_agent'),
                    provider=phone.get('provider'),
                    description=phone.get('description')
                )
            elif isinstance(phone, dict) and 'phone_number' in phone and isinstance(phone.get('phone_number'), str) and phone.get('phone_number').startswith('{'):
                # Handle case where phone_number field is a string representation of a dict
                try:
                    import ast
                    phone_dict = ast.literal_eval(phone.get('phone_number'))
                    logger.info(f"Parsed phone_number string to dict: {phone_dict}")
                    phone_obj = PhoneNumber(
                        phone_number=phone_dict.get('phone_number', ''),
                        label=phone_dict.get('label'),
                        supports_inbound=phone_dict.get('supports_inbound'),
                        supports_outbound=phone_dict.get('supports_outbound'),
                        phone_number_id=phone_dict.get('phone_number_id'),
                        assigned_agent=phone_dict.get('assigned_agent'),
                        provider=phone_dict.get('provider'),
                        description=phone_dict.get('description')
                    )
                except Exception as e:
                    logger.error(f"Failed to parse phone_number string: {e}")
                    phone_obj = PhoneNumber(
                        phone_number=phone.get('phone_number', ''),
                        description="Failed to parse"
                    )
            elif isinstance(phone, str) and phone.startswith('{'):
                # Handle case where the entire phone object is a string representation of a dict
                try:
                    import ast
                    phone_dict = ast.literal_eval(phone)
                    logger.info(f"Parsed phone string to dict: {phone_dict}")
                    phone_obj = PhoneNumber(
                        phone_number=phone_dict.get('phone_number', ''),
                        label=phone_dict.get('label'),
                        supports_inbound=phone_dict.get('supports_inbound'),
                        supports_outbound=phone_dict.get('supports_outbound'),
                        phone_number_id=phone_dict.get('phone_number_id'),
                        assigned_agent=phone_dict.get('assigned_agent'),
                        provider=phone_dict.get('provider'),
                        description=phone_dict.get('description')
                    )
                except Exception as e:
                    logger.error(f"Failed to parse phone string: {e}")
                    phone_obj = PhoneNumber(
                        phone_number=phone,
                        description="Failed to parse"
                    )
            else:
                # Handle case where phone might be a string or different structure
                logger.warning(f"Unexpected phone structure: {phone}")
                phone_obj = PhoneNumber(
                    phone_number=str(phone),
                    description="Unknown format"
                )
            
            logger.info(f"Created phone object: {phone_obj}")
            response.append(phone_obj)
        
        logger.info(f"Returning {len(response)} phone numbers")
        logger.info(f"Response type: {type(response)}")
        logger.info(f"First response item: {response[0] if response else 'No items'}")
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving phone numbers: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving phone numbers: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    """Get overall statistics"""
    logger.info("GET /api/stats called")
    
    if not api_client:
        logger.error("API client not initialized")
        raise HTTPException(status_code=500, detail="API client not initialized")
    
    try:
        logger.info("Retrieving conversations for statistics calculation")
        conversations = api_client.get_conversations()
        logger.info(f"Retrieved {len(conversations)} conversations for stats")
        
        total_conversations = len(conversations)
        successful_calls = sum(1 for c in conversations if c.get('call_successful', False))
        total_duration = sum(c.get('call_duration_secs', 0) for c in conversations)
        total_messages = sum(c.get('message_count', 0) for c in conversations)
        
        success_rate = (successful_calls / total_conversations * 100) if total_conversations > 0 else 0
        avg_duration = total_duration / total_conversations if total_conversations > 0 else 0
        avg_messages = total_messages / total_conversations if total_conversations > 0 else 0
        
        stats = {
            "total_conversations": total_conversations,
            "successful_calls": successful_calls,
            "success_rate": success_rate,
            "total_duration_seconds": total_duration,
            "total_messages": total_messages,
            "average_duration_seconds": avg_duration,
            "average_messages_per_conversation": avg_messages
        }
        
        logger.info(f"Calculated stats: total_conversations={total_conversations}, successful_calls={successful_calls}, success_rate={success_rate:.2f}%")
        return stats
        
    except Exception as e:
        logger.error(f"Error retrieving statistics: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting ElevenLabs API Server on host=0.0.0.0, port=8000")
    uvicorn.run(app, host="0.0.0.0", port=8000) 