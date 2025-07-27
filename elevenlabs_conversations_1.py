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
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving conversation {conversation_id}: {e}")
            return None
    
    def get_conversation_audio(self, conversation_id: str) -> Optional[Dict]:
        """Get audio information for a specific conversation"""
        try:
            url = f"{self.base_url}/convai/conversations/{conversation_id}/audio"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            # Check if response has content
            if response.content:
                # Check if it's JSON or binary audio data
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    return response.json()
                elif 'audio' in content_type or 'application/octet-stream' in content_type:
                    # Binary audio data - return the actual audio content
                    return {
                        'raw_data': response.content,  # Return the actual binary data
                        'content_type': content_type,
                        'size_bytes': len(response.content),
                        'filename': f"conversation_{conversation_id}.{content_type.split('/')[-1] if '/' in content_type else 'audio'}"
                    }
                else:
                    # Try to parse as JSON, but handle gracefully if it fails
                    try:
                        return response.json()
                    except json.JSONDecodeError:
                        # Assume it's binary audio data
                        return {
                            'raw_data': response.content,  # Return the actual binary data
                            'content_type': content_type,
                            'size_bytes': len(response.content),
                            'filename': f"conversation_{conversation_id}.audio"
                        }
            else:
                print(f"No audio data available for conversation {conversation_id}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving audio for conversation {conversation_id}: {e}")
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
            
            return response.json()
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
            print(f"Start Time: {ConversationDisplay.format_timestamp_from_unix(metadata.get('start_time_unix_secs', 0))}")
            print(f"Call Duration: {metadata.get('call_duration_secs', 'N/A')} seconds")
        
        # Display audio information
        print(f"Has Audio: {details.get('has_audio', 'N/A')}")
        print(f"Has User Audio: {details.get('has_user_audio', 'N/A')}")
        print(f"Has Response Audio: {details.get('has_response_audio', 'N/A')}")
        
        # Display any additional details
        for key, value in details.items():
            if key not in ['agent_id', 'conversation_id', 'status', 'transcript', 'metadata', 'has_audio', 'has_user_audio', 'has_response_audio']:
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