#!/usr/bin/env python3
"""
ElevenLabs.ai Conversation Retrieval Tool

This script connects to ElevenLabs.ai API and retrieves all conversations
with their transcripts and call details.
"""

import os
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ElevenLabsAPI:
    """Class to handle ElevenLabs API interactions"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the API client"""
        self.api_key = api_key or os.getenv('ELEVENLABS_API_KEY') or "sk_467eaffa636aa327e1710b5079372557aa112eac1ed4890e"
        if not self.api_key:
            raise ValueError("API key is required. Set ELEVENLABS_API_KEY environment variable or pass it to the constructor.")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def get_conversations(self) -> List[Dict]:
        """Retrieve all conversations from ElevenLabs ConvAI"""
        try:
            url = f"{self.base_url}/convai/conversations"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            conversations = data.get('conversations', [])
            print(f"Found {len(conversations)} conversations")
            return conversations
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving conversations: {e}")
            return []
    
    def get_conversation_details(self, conversation_id: str) -> Optional[Dict]:
        """Get detailed information about a specific conversation"""
        try:
            url = f"{self.base_url}/convai/conversations/{conversation_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Print detailed metadata information
            metadata = data.get('metadata', {})
            print(f"📋 METADATA DETAILS for conversation {conversation_id}:")
            print(f"   Metadata keys: {list(metadata.keys())}")
            print(f"   Full metadata: {metadata}")
            
            # Extract phone number information if available (from metadata)
            phone_call = metadata.get('phone_call', {})
            if phone_call:
                print(f"📞 Found phone_call data: {phone_call}")
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
            else:
                print(f"❌ No phone_call data found in metadata")
            
            # Also check for phone_number data (from phone_numbers endpoint)
            phone_number_data = metadata.get('phone_number', {})
            if phone_number_data:
                print(f"📱 Found phone_number data:")
                print(f"   Phone Number: {phone_number_data.get('phone_number', 'N/A')}")
                print(f"   Label: {phone_number_data.get('label', 'N/A')}")
                print(f"   Supports Inbound: {phone_number_data.get('supports_inbound', 'N/A')}")
                print(f"   Supports Outbound: {phone_number_data.get('supports_outbound', 'N/A')}")
                print(f"   Provider: {phone_number_data.get('provider', 'N/A')}")
                if phone_number_data.get('assigned_agent'):
                    agent = phone_number_data.get('assigned_agent', {})
                    print(f"   Assigned Agent: {agent.get('agent_name', 'N/A')} (ID: {agent.get('agent_id', 'N/A')})")
            else:
                print(f"❌ No phone_number data found in metadata")
            
            return data
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving conversation {conversation_id}: {e}")
            return None
    
    def get_conversation_audio(self, conversation_id: str) -> Optional[Dict]:
        """Get audio information for a specific conversation"""
        try:
            url = f"{self.base_url}/convai/conversations/{conversation_id}/audio"
            print(f"🔊 AUDIO REQUEST - URL: {url}")
            print(f"🔊 AUDIO REQUEST - Conversation ID: {conversation_id}")
            
            # Use the same headers as the working curl command
            headers = {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'origin': 'https://elevenlabs.io',
                'priority': 'u=1, i',
                'referer': 'https://elevenlabs.io/',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'x-fern-proxy-request-headers': 'xi-api-key',
                'xi-api-key': self.api_key
            }
            
            print(f"🔊 AUDIO REQUEST - Headers: {headers}")
            print(f"🔊 AUDIO REQUEST - API Key: {self.api_key[:10]}...")
            
            response = requests.get(url, headers=headers)
            print(f"🔊 AUDIO RESPONSE - Status Code: {response.status_code}")
            print(f"🔊 AUDIO RESPONSE - Headers: {dict(response.headers)}")
            
            response.raise_for_status()
            
            # Check if response has content
            print(f"🔊 AUDIO RESPONSE - Content Length: {len(response.content)} bytes")
            print(f"🔊 AUDIO RESPONSE - Content Type: {response.headers.get('content-type', 'N/A')}")
            
            if response.content:
                # Check if it's JSON or binary audio data
                content_type = response.headers.get('content-type', '')
                print(f"🔊 AUDIO ANALYSIS - Content Type: {content_type}")
                
                if 'application/json' in content_type:
                    print(f"🔊 AUDIO ANALYSIS - Detected JSON response")
                    json_data = response.json()
                    print(f"🔊 AUDIO ANALYSIS - JSON Data: {json_data}")
                    return json_data
                elif 'audio' in content_type or 'application/octet-stream' in content_type:
                    print(f"🔊 AUDIO ANALYSIS - Detected binary audio data")
                    print(f"🔊 AUDIO ANALYSIS - Raw content first 100 bytes: {response.content[:100]}")
                    print(f"🔊 AUDIO ANALYSIS - Raw content last 100 bytes: {response.content[-100:]}")
                    print(f"🔊 AUDIO ANALYSIS - Content is binary: {isinstance(response.content, bytes)}")
                    
                    # Binary audio data - return the actual audio content
                    result = {
                        'raw_data': response.content,  # Return the actual binary data
                        'content_type': content_type,
                        'size_bytes': len(response.content),
                        'filename': f"conversation_{conversation_id}.{content_type.split('/')[-1] if '/' in content_type else 'audio'}"
                    }
                    print(f"🔊 AUDIO RESULT - Returning binary data with size: {len(response.content)} bytes")
                    print(f"🔊 AUDIO RESULT - Filename: {result['filename']}")
                    return result
                else:
                    print(f"🔊 AUDIO ANALYSIS - Unknown content type, trying JSON first")
                    # Try to parse as JSON, but handle gracefully if it fails
                    try:
                        json_data = response.json()
                        print(f"🔊 AUDIO ANALYSIS - Successfully parsed as JSON: {json_data}")
                        return json_data
                    except json.JSONDecodeError as e:
                        print(f"🔊 AUDIO ANALYSIS - Failed to parse as JSON: {e}")
                        print(f"🔊 AUDIO ANALYSIS - Assuming binary data")
                        print(f"🔊 AUDIO ANALYSIS - Raw content first 100 bytes: {response.content[:100]}")
                        print(f"🔊 AUDIO ANALYSIS - Raw content last 100 bytes: {response.content[-100:]}")
                        
                        # Assume it's binary audio data
                        result = {
                            'raw_data': response.content,  # Return the actual binary data
                            'content_type': content_type,
                            'size_bytes': len(response.content),
                            'filename': f"conversation_{conversation_id}.audio"
                        }
                        print(f"🔊 AUDIO RESULT - Returning binary data with size: {len(response.content)} bytes")
                        return result
            else:
                print(f"🔊 AUDIO ERROR - No audio data available for conversation {conversation_id}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"🔊 AUDIO ERROR - Request failed for conversation {conversation_id}: {e}")
            return None
    
    def get_conversation_transcript(self, conversation_id: str) -> Optional[Dict]:
        """Get the transcript for a specific conversation"""
        try:
            url = f"{self.base_url}/convai/conversations/{conversation_id}/transcript"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving transcript for conversation {conversation_id}: {e}")
            return None
    
    def get_phone_numbers(self) -> List[Dict]:
        """Get available phone numbers"""
        try:
            url = f"{self.base_url}/convai/phone-numbers"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            print(f"📱 PHONE NUMBERS API RESPONSE:")
            print(f"   Response type: {type(data)}")
            print(f"   Response: {data}")
            
            return data
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving phone numbers: {e}")
            return []

class ConversationDisplay:
    """Class to handle displaying conversation information"""
    
    @staticmethod
    def format_timestamp(timestamp: str) -> str:
        """Format timestamp for display"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        except:
            return timestamp
    
    @staticmethod
    def format_timestamp_from_unix(unix_timestamp: int) -> str:
        """Format Unix timestamp for display"""
        try:
            dt = datetime.fromtimestamp(unix_timestamp)
            return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        except:
            return str(unix_timestamp)
    
    @staticmethod
    def display_conversation_summary(conversation: Dict):
        """Display a summary of conversation details"""
        print("\n" + "="*80)
        print(f"CONVERSATION ID: {conversation.get('conversation_id', 'N/A')}")
        print("="*80)
        
        # Basic conversation info
        print(f"Agent ID: {conversation.get('agent_id', 'N/A')}")
        print(f"Agent Name: {conversation.get('agent_name', 'N/A')}")
        print(f"Start Time: {ConversationDisplay.format_timestamp_from_unix(conversation.get('start_time_unix_secs', 0))}")
        print(f"Call Duration: {conversation.get('call_duration_secs', 'N/A')} seconds")
        print(f"Message Count: {conversation.get('message_count', 'N/A')}")
        print(f"Status: {conversation.get('status', 'N/A')}")
        print(f"Call Successful: {conversation.get('call_successful', 'N/A')}")
    
    @staticmethod
    def display_transcript(transcript_data: Dict):
        """Display the conversation transcript"""
        print("\n" + "-"*80)
        print("TRANSCRIPT")
        print("-"*80)
        
        transcript = transcript_data.get('transcript', [])
        if not transcript:
            print("No transcript available")
            return
        
        for i, message in enumerate(transcript, 1):
            role = message.get('role', 'unknown')
            message_text = message.get('message', '')
            time_in_call = message.get('time_in_call_secs', '')
            
            print(f"\n[{i}] {role.upper()}")
            if time_in_call:
                print(f"Time in call: {time_in_call} seconds")
            print(f"Message: {message_text}")
    
    @staticmethod
    def display_conversation_details(details: Dict):
        """Display detailed conversation information"""
        print("\n" + "-"*80)
        print("DETAILED INFORMATION")
        print("-"*80)
        
        # Display metadata
        metadata = details.get('metadata', {})
        if metadata:
            print(f"📋 METADATA DETAILS:")
            print(f"   Metadata keys: {list(metadata.keys())}")
            print(f"   Full metadata: {metadata}")
            print(f"Start Time: {ConversationDisplay.format_timestamp_from_unix(metadata.get('start_time_unix_secs', 0))}")
            print(f"Call Duration: {metadata.get('call_duration_secs', 'N/A')} seconds")
        
        # Display audio information
        print(f"Has Audio: {details.get('has_audio', 'N/A')}")
        print(f"Has User Audio: {details.get('has_user_audio', 'N/A')}")
        print(f"Has Response Audio: {details.get('has_response_audio', 'N/A')}")
        
        # Display phone call information
        phone_call = details.get('metadata', {}).get('phone_call', {})
        if phone_call:
            print("\n" + "-"*40)
            print("📞 PHONE CALL INFORMATION")
            print("-"*40)
            print(f"Direction: {phone_call.get('direction', 'N/A')}")
            print(f"Agent Number: {phone_call.get('agent_number', 'N/A')}")
            print(f"External Number: {phone_call.get('external_number', 'N/A')}")
            print(f"Type: {phone_call.get('type', 'N/A')}")
        
        # Display phone number information (user-friendly)
        phone_number_data = details.get('metadata', {}).get('phone_number', {})
        if phone_number_data:
            print("\n" + "-"*40)
            print("📱 PHONE NUMBER INFORMATION")
            print("-"*40)
            print(f"Phone Number: {phone_number_data.get('phone_number', 'N/A')}")
            print(f"Label: {phone_number_data.get('label', 'N/A')}")
            print(f"Provider: {phone_number_data.get('provider', 'N/A')}")
            print(f"Supports Inbound: {phone_number_data.get('supports_inbound', 'N/A')}")
            print(f"Supports Outbound: {phone_number_data.get('supports_outbound', 'N/A')}")
            if phone_number_data.get('assigned_agent'):
                agent = phone_number_data.get('assigned_agent', {})
                print(f"Assigned Agent: {agent.get('agent_name', 'N/A')}")
        
        # Display extracted phone info if available
        extracted_phone_info = details.get('extracted_phone_info', {})
        if extracted_phone_info:
            print("\n" + "-"*40)
            print("📱 EXTRACTED PHONE INFORMATION")
            print("-"*40)
            for key, value in extracted_phone_info.items():
                print(f"{key}: {value}")
        
        # Display any additional details
        for key, value in details.items():
            if key not in ['agent_id', 'conversation_id', 'status', 'transcript', 'metadata', 'has_audio', 'has_user_audio', 'has_response_audio', 'phone_call', 'extracted_phone_info']:
                print(f"{key}: {value}")

def main():
    """Main function to retrieve and display all conversations"""
    print("ElevenLabs.ai Conversation Retrieval Tool")
    print("="*50)
    
    try:
        # Initialize API client
        api = ElevenLabsAPI()
        print("✓ Successfully connected to ElevenLabs API")
        
        # Get available phone numbers
        phone_numbers = api.get_phone_numbers()
        if phone_numbers:
            print(f"\n📞 Available Phone Numbers: {len(phone_numbers)}")
            for phone in phone_numbers:
                print(f"  - {phone}")
        
        # Get all conversations
        conversations = api.get_conversations()
        
        if not conversations:
            print("No conversations found or error occurred.")
            return
        
        # Process each conversation
        for i, conversation in enumerate(conversations, 1):
            print(f"\n{'='*20} CONVERSATION {i} OF {len(conversations)} {'='*20}")
            
            # Display conversation summary
            ConversationDisplay.display_conversation_summary(conversation)
            
            # Get and display detailed information
            conversation_id = conversation.get('conversation_id')
            if conversation_id:
                details = api.get_conversation_details(conversation_id)
                if details:
                    ConversationDisplay.display_conversation_details(details)
                    
                    # Display transcript from the details response
                    if details.get('transcript'):
                        ConversationDisplay.display_transcript(details)
                    else:
                        print("\nNo transcript available for this conversation.")
                
                # Get and display audio information
                audio_info = api.get_conversation_audio(conversation_id)
                if audio_info:
                    print("\n" + "-"*80)
                    print("AUDIO INFORMATION")
                    print("-"*80)
                    if audio_info.get('raw_data'):
                        print(f"✅ Audio file available")
                        print(f"Content Type: {audio_info.get('content_type', 'N/A')}")
                        print(f"Size: {audio_info.get('size_bytes', 0)} bytes")
                        print(f"Filename: {audio_info.get('filename', 'N/A')}")
                    elif audio_info.get('raw_data'):
                        print(f"📁 Raw data available")
                        print(f"Content Type: {audio_info.get('content_type', 'N/A')}")
                        print(f"Size: {audio_info.get('size_bytes', 0)} bytes")
                    else:
                        print(f"📋 Audio metadata: {audio_info}")
                else:
                    print("\n" + "-"*80)
                    print("AUDIO INFORMATION")
                    print("-"*80)
                    print("No audio data available for this conversation")
            
            print("\n" + "="*80)
        
        print(f"\n✓ Successfully processed {len(conversations)} conversations")
        
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("Please set your ELEVENLABS_API_KEY environment variable or create a .env file.")
        print("You can get your API key from: https://elevenlabs.io/account")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main() 