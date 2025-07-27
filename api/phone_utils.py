#!/usr/bin/env python3
"""
Phone number utilities for ElevenLabs conversation data
"""

from typing import Dict, Optional, List, Tuple

def extract_phone_info_from_conversation(conversation_details: Dict) -> Optional[Dict]:
    """
    Extract phone number information from conversation details
    
    Args:
        conversation_details: The conversation details from ElevenLabs API
        
    Returns:
        Dictionary containing phone information or None if not available
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

def get_primary_phone_number(phone_info: Dict) -> Optional[str]:
    """
    Get the primary phone number from phone info
    
    Args:
        phone_info: Phone information dictionary
        
    Returns:
        The primary phone number (external number for inbound, agent number for outbound)
    """
    if not phone_info:
        return None
    
    direction = phone_info.get('direction', '').lower()
    
    if direction == 'inbound':
        return phone_info.get('external_number')
    elif direction == 'outbound':
        return phone_info.get('agent_number')
    else:
        # Default to external number if direction is unknown
        return phone_info.get('external_number') or phone_info.get('agent_number')

def format_phone_number(phone_number: str) -> str:
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

def get_phone_call_summary(phone_info: Dict) -> str:
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
    agent_number = phone_info.get('agent_number', 'N/A')
    external_number = phone_info.get('external_number', 'N/A')
    
    if direction == 'inbound':
        return f"Inbound call from {format_phone_number(external_number)} to {format_phone_number(agent_number)}"
    elif direction == 'outbound':
        return f"Outbound call from {format_phone_number(agent_number)} to {format_phone_number(external_number)}"
    else:
        return f"Call between {format_phone_number(agent_number)} and {format_phone_number(external_number)}"

def validate_phone_number(phone_number: str) -> bool:
    """
    Basic phone number validation
    
    Args:
        phone_number: Phone number to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not phone_number:
        return False
    
    # Remove formatting characters
    cleaned = ''.join(c for c in phone_number if c.isdigit() or c == '+')
    
    # Must have at least 10 digits
    digits = ''.join(c for c in cleaned if c.isdigit())
    if len(digits) < 10:
        return False
    
    # Must start with + or be a reasonable length
    if cleaned.startswith('+'):
        return len(cleaned) >= 11  # +1 + 10 digits minimum
    else:
        return len(cleaned) >= 10  # At least 10 digits

def extract_phone_numbers_from_conversations(conversations: List[Dict]) -> List[Dict]:
    """
    Extract phone numbers from a list of conversations
    
    Args:
        conversations: List of conversation dictionaries
        
    Returns:
        List of dictionaries with conversation ID and phone information
    """
    phone_numbers = []
    
    for conversation in conversations:
        conversation_id = conversation.get('conversation_id')
        phone_info = extract_phone_info_from_conversation(conversation)
        
        if phone_info:
            phone_numbers.append({
                'conversation_id': conversation_id,
                'phone_info': phone_info,
                'primary_number': get_primary_phone_number(phone_info),
                'summary': get_phone_call_summary(phone_info)
            })
    
    return phone_numbers

def get_unique_phone_numbers(conversations: List[Dict]) -> List[str]:
    """
    Get unique phone numbers from conversations
    
    Args:
        conversations: List of conversation dictionaries
        
    Returns:
        List of unique phone numbers
    """
    phone_numbers = extract_phone_numbers_from_conversations(conversations)
    unique_numbers = set()
    
    for phone_data in phone_numbers:
        primary_number = phone_data.get('primary_number')
        if primary_number:
            unique_numbers.add(format_phone_number(primary_number))
    
    return sorted(list(unique_numbers)) 