#!/usr/bin/env python3
"""
Example: Phone Number Extraction from ElevenLabs Conversation Details

This script demonstrates how to extract phone numbers from conversation details
using the ElevenLabs API as described in the documentation.
"""

import os
import requests
from dotenv import load_dotenv
from typing import Dict, Optional

# Load environment variables
load_dotenv()

class ElevenLabsPhoneExtractor:
    """Class to extract phone numbers from ElevenLabs conversation details"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the API client"""
        self.api_key = api_key or os.getenv('ELEVENLABS_API_KEY')
        if not self.api_key:
            raise ValueError("API key is required. Set ELEVENLABS_API_KEY environment variable or pass it to the constructor.")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def get_conversation_details(self, conversation_id: str) -> Optional[Dict]:
        """
        Get conversation details including phone number information
        
        Based on the API documentation:
        GET /v1/convai/conversations/:conversation_id
        
        The response includes a phone_call object with:
        - direction: "inbound" or "outbound"
        - phone_number_id: string
        - agent_number: string (the agent's phone number)
        - external_number: string (the caller's phone number)
        - type: "twilio" or other
        - stream_sid: string
        - call_sid: string
        """
        try:
            url = f"{self.base_url}/convai/conversations/{conversation_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving conversation {conversation_id}: {e}")
            return None
    
    def extract_phone_info(self, conversation_details: Dict) -> Optional[Dict]:
        """
        Extract phone number information from conversation details
        
        Args:
            conversation_details: The full conversation details from the API
            
        Returns:
            Dictionary with phone information or None if not available
        """
        phone_call = conversation_details.get('phone_call', {})
        
        if not phone_call:
            return None
        
        return {
            'direction': phone_call.get('direction'),
            'phone_number_id': phone_call.get('phone_number_id'),
            'agent_number': phone_call.get('agent_number'),
            'external_number': phone_call.get('external_number'),
            'type': phone_call.get('type'),
            'stream_sid': phone_call.get('stream_sid'),
            'call_sid': phone_call.get('call_sid')
        }
    
    def get_caller_phone_number(self, phone_info: Dict) -> Optional[str]:
        """
        Get the caller's phone number based on call direction
        
        Args:
            phone_info: Phone information dictionary
            
        Returns:
            The caller's phone number
        """
        if not phone_info:
            return None
        
        direction = phone_info.get('direction', '').lower()
        
        if direction == 'inbound':
            # For inbound calls, the external_number is the caller
            return phone_info.get('external_number')
        elif direction == 'outbound':
            # For outbound calls, the external_number is the recipient
            return phone_info.get('external_number')
        else:
            # Default to external_number if direction is unknown
            return phone_info.get('external_number')
    
    def get_agent_phone_number(self, phone_info: Dict) -> Optional[str]:
        """
        Get the agent's phone number
        
        Args:
            phone_info: Phone information dictionary
            
        Returns:
            The agent's phone number
        """
        if not phone_info:
            return None
        
        return phone_info.get('agent_number')
    
    def format_phone_number(self, phone_number: str) -> str:
        """
        Format phone number for display
        
        Args:
            phone_number: Raw phone number string
            
        Returns:
            Formatted phone number
        """
        if not phone_number:
            return "N/A"
        
        # Remove any non-digit characters except +
        cleaned = ''.join(c for c in phone_number if c.isdigit() or c == '+')
        
        # If it starts with +, it's already international format
        if cleaned.startswith('+'):
            return cleaned
        
        # If it's 10 digits, assume US number
        if len(cleaned) == 10:
            return f"+1{cleaned}"
        
        # If it's 11 digits and starts with 1, format as US
        if len(cleaned) == 11 and cleaned.startswith('1'):
            return f"+{cleaned}"
        
        # Otherwise, return as is
        return cleaned
    
    def get_call_summary(self, phone_info: Dict) -> str:
        """
        Get a human-readable summary of the phone call
        
        Args:
            phone_info: Phone information dictionary
            
        Returns:
            Summary string
        """
        if not phone_info:
            return "No phone call information"
        
        direction = phone_info.get('direction', 'unknown')
        agent_number = self.format_phone_number(phone_info.get('agent_number', ''))
        external_number = self.format_phone_number(phone_info.get('external_number', ''))
        
        if direction == 'inbound':
            return f"Inbound call from {external_number} to {agent_number}"
        elif direction == 'outbound':
            return f"Outbound call from {agent_number} to {external_number}"
        else:
            return f"Call between {agent_number} and {external_number}"

def main():
    """Main function to demonstrate phone number extraction"""
    print("📞 ElevenLabs Phone Number Extraction Example")
    print("=" * 50)
    
    try:
        # Initialize the extractor
        extractor = ElevenLabsPhoneExtractor()
        print("✅ Successfully initialized ElevenLabs API client")
        
        # Example conversation ID (you would replace this with actual conversation IDs)
        # You can get conversation IDs from the /v1/convai/conversations endpoint
        example_conversation_id = "123"  # Replace with actual conversation ID
        
        print(f"\n🔍 Getting details for conversation: {example_conversation_id}")
        
        # Get conversation details
        conversation_details = extractor.get_conversation_details(example_conversation_id)
        
        if not conversation_details:
            print("❌ Failed to get conversation details")
            return
        
        print("✅ Successfully retrieved conversation details")
        
        # Extract phone information
        phone_info = extractor.extract_phone_info(conversation_details)
        
        if phone_info:
            print("\n📱 PHONE NUMBER INFORMATION:")
            print("-" * 30)
            print(f"Direction: {phone_info.get('direction', 'N/A')}")
            print(f"Phone Number ID: {phone_info.get('phone_number_id', 'N/A')}")
            print(f"Agent Number: {extractor.format_phone_number(phone_info.get('agent_number', ''))}")
            print(f"External Number: {extractor.format_phone_number(phone_info.get('external_number', ''))}")
            print(f"Type: {phone_info.get('type', 'N/A')}")
            print(f"Stream SID: {phone_info.get('stream_sid', 'N/A')}")
            print(f"Call SID: {phone_info.get('call_sid', 'N/A')}")
            
            # Get caller and agent numbers
            caller_number = extractor.get_caller_phone_number(phone_info)
            agent_number = extractor.get_agent_phone_number(phone_info)
            
            print(f"\n👤 Caller Number: {extractor.format_phone_number(caller_number) if caller_number else 'N/A'}")
            print(f"🤖 Agent Number: {extractor.format_phone_number(agent_number) if agent_number else 'N/A'}")
            
            # Get call summary
            summary = extractor.get_call_summary(phone_info)
            print(f"\n📋 Call Summary: {summary}")
            
        else:
            print("\n❌ No phone call information found in conversation details")
            print("This conversation may not be a phone call or phone data is not available")
        
        print("\n✅ Phone number extraction example completed")
        
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("Please set your ELEVENLABS_API_KEY environment variable")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 