# Phone Number Extraction from ElevenLabs Conversations

This implementation provides functionality to extract phone numbers from ElevenLabs conversation details using the API documentation provided.

## Overview

Based on the ElevenLabs API documentation, conversation details include a `phone_call` object that contains phone number information:

```json
{
  "phone_call": {
    "direction": "inbound" | "outbound",
    "phone_number_id": "string",
    "agent_number": "string",
    "external_number": "string", 
    "type": "twilio",
    "stream_sid": "string",
    "call_sid": "string"
  }
}
```

## Implementation

### 1. Enhanced API Client (`api/elevenlabs_conversations.py`)

The existing `ElevenLabsAPI` class has been enhanced to extract phone information:

```python
def get_conversation_details(self, conversation_id: str) -> Optional[Dict]:
    """Get detailed information about a specific conversation"""
    try:
        url = f"{self.base_url}/convai/conversations/{conversation_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract phone number information if available
        phone_call = data.get('phone_call', {})
        if phone_call:
            phone_info = {
                'direction': phone_call.get('direction'),
                'phone_number_id': phone_call.get('phone_number_id'),
                'agent_number': phone_call.get('agent_number'),
                'external_number': phone_call.get('external_number'),
                'type': phone_call.get('type'),
                'stream_sid': phone_call.get('stream_sid'),
                'call_sid': phone_call.get('call_sid')
            }
            data['extracted_phone_info'] = phone_info
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving conversation {conversation_id}: {e}")
        return None
```

### 2. API Server Updates (`api/main.py`)

The FastAPI server has been updated to include phone call information in responses:

#### New Models:
```python
class PhoneCallInfo(BaseModel):
    direction: Optional[str] = None
    phone_number_id: Optional[str] = None
    agent_number: Optional[str] = None
    external_number: Optional[str] = None
    type: Optional[str] = None
    stream_sid: Optional[str] = None
    call_sid: Optional[str] = None

class ConversationDetails(BaseModel):
    # ... existing fields ...
    phone_call: Optional[PhoneCallInfo] = None

class ConversationSummary(BaseModel):
    # ... existing fields ...
    phone_call: Optional[PhoneCallInfo] = None
```

#### Updated Endpoints:
- `/api/conversations/{conversation_id}` - Now includes phone call information
- `/api/conversations` - List endpoint now includes phone call data

### 3. Phone Utilities (`api/phone_utils.py`)

A utility module provides helper functions for phone number processing:

```python
def extract_phone_info_from_conversation(conversation_details: Dict) -> Optional[Dict]
def get_primary_phone_number(phone_info: Dict) -> Optional[str]
def format_phone_number(phone_number: str) -> str
def get_phone_call_summary(phone_info: Dict) -> str
def validate_phone_number(phone_number: str) -> bool
def extract_phone_numbers_from_conversations(conversations: List[Dict]) -> List[Dict]
def get_unique_phone_numbers(conversations: List[Dict]) -> List[str]
```

### 4. Example Implementation (`phone_extraction_example.py`)

A complete example showing how to extract phone numbers:

```python
class ElevenLabsPhoneExtractor:
    def get_conversation_details(self, conversation_id: str) -> Optional[Dict]
    def extract_phone_info(self, conversation_details: Dict) -> Optional[Dict]
    def get_caller_phone_number(self, phone_info: Dict) -> Optional[str]
    def get_agent_phone_number(self, phone_info: Dict) -> Optional[str]
    def format_phone_number(self, phone_number: str) -> str
    def get_call_summary(self, phone_info: Dict) -> str
```

## Usage Examples

### 1. Basic Phone Number Extraction

```python
from api.elevenlabs_conversations import ElevenLabsAPI

api = ElevenLabsAPI()
conversation_details = api.get_conversation_details("conversation_id_here")

if conversation_details:
    phone_call = conversation_details.get('phone_call', {})
    if phone_call:
        print(f"Agent Number: {phone_call.get('agent_number')}")
        print(f"External Number: {phone_call.get('external_number')}")
        print(f"Direction: {phone_call.get('direction')}")
```

### 2. Using the Phone Utilities

```python
from api.phone_utils import extract_phone_info_from_conversation, format_phone_number

phone_info = extract_phone_info_from_conversation(conversation_details)
if phone_info:
    formatted_number = format_phone_number(phone_info.get('external_number'))
    print(f"Formatted Number: {formatted_number}")
```

### 3. API Endpoint Usage

```bash
# Get conversation details with phone information
curl -H "xi-api-key: YOUR_API_KEY" \
     "http://localhost:8000/api/conversations/conversation_id_here"

# Response will include phone_call object:
{
  "conversation_id": "...",
  "phone_call": {
    "direction": "inbound",
    "agent_number": "+1234567890",
    "external_number": "+1987654321",
    "type": "twilio",
    "call_sid": "..."
  }
}
```

## API Endpoints

### GET `/api/conversations/{conversation_id}`

Returns detailed conversation information including phone call data:

```json
{
  "conversation_id": "string",
  "agent_id": "string",
  "status": "string",
  "phone_call": {
    "direction": "inbound|outbound",
    "agent_number": "string",
    "external_number": "string",
    "type": "twilio",
    "call_sid": "string"
  }
}
```

### GET `/api/conversations`

Returns list of conversations with phone call information included in each summary.

## Testing

### Run the Test Script

```bash
python test_phone_extraction.py
```

This will test the phone number extraction with actual conversation data.

### Run the Example

```bash
python phone_extraction_example.py
```

This demonstrates the complete phone number extraction workflow.

## Phone Number Formatting

The implementation includes phone number formatting that:

1. **Preserves international format** (+1, +44, etc.)
2. **Formats US numbers** (10 digits → +1XXXXXXXXXX)
3. **Handles various input formats** (spaces, dashes, parentheses)
4. **Validates phone numbers** (minimum 10 digits)

## Error Handling

The implementation includes comprehensive error handling:

- **API errors**: Network issues, authentication failures
- **Missing data**: Conversations without phone call information
- **Invalid formats**: Malformed phone numbers
- **Rate limiting**: API quota exceeded

## Configuration

Set your ElevenLabs API key:

```bash
export ELEVENLABS_API_KEY="your_api_key_here"
```

Or create a `.env` file:

```
ELEVENLABS_API_KEY=your_api_key_here
```

## Dependencies

- `requests` - HTTP client for API calls
- `python-dotenv` - Environment variable management
- `fastapi` - Web framework (for API server)
- `pydantic` - Data validation (for API models)

## Notes

- Phone call information is only available for actual phone calls
- Some conversations may not have phone call data (e.g., text-only conversations)
- The `direction` field indicates whether it's an inbound or outbound call
- Phone numbers are returned in the format provided by ElevenLabs
- The implementation handles both Twilio and other phone call types 