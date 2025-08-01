# Call Center Frontend - Session Management System

## Overview

A comprehensive session management system has been implemented to handle user sessions, idle timeouts, and automatic session refresh. The system provides security and user experience improvements through intelligent session handling.

## Features

### 🔐 Session Management
- **Automatic Session Refresh**: Tokens are refreshed before expiration
- **Idle Timeout Detection**: Monitors user activity and handles idle sessions
- **Session Status Indicator**: Real-time display of session status and time remaining
- **Activity Tracking**: Monitors mouse, keyboard, and touch interactions

### ⏰ Timeout Handling
- **15-Minute Idle Timeout**: Users are logged out after 15 minutes of inactivity
- **14-Minute Warning**: Shows timeout dialog 1 minute before automatic logout
- **60-Second Countdown**: Visual countdown in the timeout dialog
- **Automatic Logout**: Forces logout when countdown reaches zero

### 🔄 Session Refresh
- **Proactive Refresh**: Refreshes tokens 5 minutes before expiration
- **1-Hour Session Duration**: Default session length with automatic extension
- **Seamless Experience**: Users can continue working without interruption

## Configuration

### Session Settings
```typescript
const SESSION_CONFIG = {
    IDLE_TIMEOUT: 15 * 60 * 1000,        // 15 minutes
    WARNING_TIMEOUT: 14 * 60 * 1000,     // 14 minutes (1 min warning)
    SESSION_DURATION: 60 * 60 * 1000,    // 1 hour
    REFRESH_THRESHOLD: 5 * 60 * 1000,    // 5 minutes before expiry
}
```

### Activity Monitoring
The system tracks the following user activities:
- Mouse movements and clicks
- Keyboard input
- Touch interactions
- Scrolling
- Any DOM interactions

## Components

### 1. Session Manager (`components/auth/session-manager.tsx`)
- **Purpose**: Main orchestrator for session management
- **Features**:
  - Monitors user activity every 30 seconds
  - Shows timeout dialog when user is idle
  - Handles automatic logout
  - Manages session refresh

### 2. Session Timeout Dialog (`components/auth/session-timeout-dialog.tsx`)
- **Purpose**: User interface for session timeout warnings
- **Features**:
  - 60-second countdown timer
  - Continue session option
  - Logout option
  - Visual time remaining display

### 3. Session Status Indicator (`components/auth/session-status.tsx`)
- **Purpose**: Real-time session status display
- **Features**:
  - Shows session status (Active/Warning/Expired)
  - Displays time remaining
  - Color-coded status indicators
  - Updates every 30 seconds

### 4. Enhanced Auth Context (`contexts/auth-context.tsx`)
- **Purpose**: Centralized session state management
- **Features**:
  - Session token generation and validation
  - Activity tracking and timestamp updates
  - Automatic session refresh
  - Session expiration handling

## User Experience Flow

### Normal Session Flow
1. **Login**: User logs in and session starts
2. **Activity**: User interacts with the application
3. **Monitoring**: System tracks activity and session status
4. **Refresh**: Session automatically refreshes before expiration
5. **Continue**: User continues working seamlessly

### Idle Timeout Flow
1. **Inactivity**: User becomes inactive for 14 minutes
2. **Warning**: Timeout dialog appears with 60-second countdown
3. **Choice**: User can choose to continue or logout
4. **Continue**: Session refreshes and user continues working
5. **Logout**: User is logged out and redirected to login page
6. **Auto-logout**: If no choice is made, automatic logout occurs

## Implementation Details

### Session Data Structure
```typescript
interface SessionInfo {
    token: string           // Unique session token
    expiresAt: number       // Session expiration timestamp
    lastActivity: number    // Last user activity timestamp
}
```

### Activity Tracking
```typescript
// Events monitored for user activity
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

// Activity listener setup
events.forEach(event => {
    document.addEventListener(event, handleActivity, true)
})
```

### Session Refresh Logic
```typescript
const needsRefresh = (session: SessionInfo) => {
    const timeUntilExpiry = session.expiresAt - Date.now()
    return timeUntilExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD
}
```

## Security Features

### Session Security
- **Unique Tokens**: Each session has a unique, randomly generated token
- **Timestamp Validation**: Sessions are validated against expiration timestamps
- **Activity Verification**: Sessions are invalidated based on user activity
- **Automatic Cleanup**: Expired sessions are automatically cleared

### Data Protection
- **Local Storage**: Session data is stored securely in browser localStorage
- **Token Rotation**: Session tokens are refreshed regularly
- **Activity Monitoring**: Continuous monitoring prevents session hijacking
- **Automatic Logout**: Forces logout on security violations

## Customization

### Adjusting Timeouts
To modify session timeouts, update the `SESSION_CONFIG` object:

```typescript
const SESSION_CONFIG = {
    IDLE_TIMEOUT: 30 * 60 * 1000,        // 30 minutes
    WARNING_TIMEOUT: 29 * 60 * 1000,     // 29 minutes
    SESSION_DURATION: 2 * 60 * 60 * 1000, // 2 hours
    REFRESH_THRESHOLD: 10 * 60 * 1000,   // 10 minutes
}
```

### Adding Custom Activity Events
To track additional user activities:

```typescript
const customEvents = ['customEvent1', 'customEvent2']
events.push(...customEvents)
```

### Customizing the Timeout Dialog
Modify the dialog appearance and behavior in `session-timeout-dialog.tsx`:

```typescript
// Custom styling
<DialogContent className="sm:max-w-lg custom-dialog">
    {/* Custom content */}
</DialogContent>
```

## Production Considerations

### Backend Integration
For production use, integrate with a real backend:

```typescript
const refreshSession = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionInfo.token}`,
                'Content-Type': 'application/json'
            }
        })
        
        if (response.ok) {
            const data = await response.json()
            // Update session with new token
            return true
        }
        return false
    } catch (error) {
        return false
    }
}
```

### Security Enhancements
- **HTTPS Only**: Ensure all communication uses HTTPS
- **Token Encryption**: Encrypt session tokens in localStorage
- **Server Validation**: Validate tokens on the server side
- **Rate Limiting**: Implement rate limiting for session refresh
- **Audit Logging**: Log session events for security monitoring

### Performance Optimization
- **Debounced Activity**: Debounce activity tracking to reduce overhead
- **Efficient Monitoring**: Use efficient intervals for session checks
- **Memory Management**: Clean up event listeners and intervals
- **Caching**: Cache session data for better performance

## Troubleshooting

### Common Issues

1. **Session Expires Too Quickly**
   - Check `SESSION_DURATION` configuration
   - Verify activity tracking is working
   - Check for timezone issues

2. **Timeout Dialog Not Showing**
   - Verify `WARNING_TIMEOUT` is less than `IDLE_TIMEOUT`
   - Check browser console for errors
   - Ensure SessionManager is mounted

3. **Session Not Refreshing**
   - Check `REFRESH_THRESHOLD` configuration
   - Verify refresh function is working
   - Check network connectivity

4. **Activity Not Being Tracked**
   - Verify event listeners are attached
   - Check for JavaScript errors
   - Ensure user interactions are being detected

### Debug Mode
Enable debug logging by adding console logs:

```typescript
// In session-manager.tsx
console.log('Session check:', {
    timeSinceActivity: Date.now() - sessionInfo.lastActivity,
    shouldShowWarning: shouldShowWarning(sessionInfo),
    isUserIdle: isUserIdle(sessionInfo)
})
```

## Testing

### Manual Testing
1. **Login**: Log in and verify session starts
2. **Activity**: Interact with the application
3. **Idle**: Leave the application idle for 14+ minutes
4. **Warning**: Verify timeout dialog appears
5. **Continue**: Test session continuation
6. **Logout**: Test manual and automatic logout

### Automated Testing
```typescript
// Example test cases
describe('Session Management', () => {
    test('should show timeout dialog after 14 minutes of inactivity')
    test('should refresh session when user continues')
    test('should logout user after 15 minutes of inactivity')
    test('should update activity timestamp on user interaction')
})
```

## Future Enhancements

- [ ] **Remember Me**: Option to extend session duration
- [ ] **Multi-tab Support**: Synchronize sessions across browser tabs
- [ ] **Session Analytics**: Track session patterns and usage
- [ ] **Custom Timeouts**: User-configurable timeout preferences
- [ ] **Session Recovery**: Recover sessions after browser crash
- [ ] **Device Management**: Manage sessions across multiple devices
- [ ] **Session Notifications**: Push notifications for session events 