# AWS Amplify Environment Variables for Call Center Frontend

## Overview

This document outlines all the environment variables required to deploy the Call Center Frontend application to AWS Amplify. The application is a Next.js-based dashboard for monitoring AI agent conversations with authentication and session management.

## Required Environment Variables

### 🔗 API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Description**: Base URL for the backend API
- **Required**: Yes
- **Default**: `http://localhost:8000`
- **Production Example**: `https://your-api-domain.com`
- **Usage**: Used in API service calls and audio file URLs
- **Notes**: Must be accessible from the frontend domain

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 🔐 Authentication Configuration (Optional for Demo)

The current implementation uses demo authentication. For production, you may want to add:

#### `NEXT_PUBLIC_AUTH_ENABLED`
- **Description**: Enable/disable authentication system
- **Required**: No
- **Default**: `true`
- **Values**: `true` | `false`

#### `NEXT_PUBLIC_AUTH_PROVIDER`
- **Description**: Authentication provider to use
- **Required**: No
- **Default**: `demo`
- **Values**: `demo` | `cognito` | `auth0` | `custom`

### 🌐 Application Configuration

#### `NEXT_PUBLIC_APP_NAME`
- **Description**: Application name displayed in the UI
- **Required**: No
- **Default**: `Call Center Dashboard`
- **Example**: `MediScribe AI Dashboard`

#### `NEXT_PUBLIC_APP_VERSION`
- **Description**: Application version for debugging
- **Required**: No
- **Default**: `1.0.0`

#### `NEXT_PUBLIC_ENVIRONMENT`
- **Description**: Environment name (development, staging, production)
- **Required**: No
- **Default**: `development`
- **Values**: `development` | `staging` | `production`

### 📊 Analytics & Monitoring (Optional)

#### `NEXT_PUBLIC_ANALYTICS_ENABLED`
- **Description**: Enable analytics tracking
- **Required**: No
- **Default**: `false`
- **Values**: `true` | `false`

#### `NEXT_PUBLIC_ANALYTICS_ID`
- **Description**: Analytics service ID (Google Analytics, etc.)
- **Required**: No
- **Example**: `G-XXXXXXXXXX`

### 🔒 Security Configuration

#### `NEXT_PUBLIC_CORS_ORIGINS`
- **Description**: Allowed CORS origins (comma-separated)
- **Required**: No
- **Default**: `*`
- **Example**: `https://yourdomain.com,https://www.yourdomain.com`

#### `NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES`
- **Description**: Session timeout in minutes
- **Required**: No
- **Default**: `15`
- **Example**: `30`

## AWS Amplify Configuration

### Build Settings

In your AWS Amplify console, configure the following build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables Setup

1. **Go to AWS Amplify Console**
2. **Navigate to your app**
3. **Go to Environment Variables**
4. **Add the following variables:**

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com` | Backend API URL |
| `NEXT_PUBLIC_APP_NAME` | `Call Center Dashboard` | App display name |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` | Environment name |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | App version |

### Branch-Specific Configuration

You can set different environment variables for different branches:

#### Production Branch (`main`)
```env
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=Call Center Dashboard
```

#### Staging Branch (`staging`)
```env
NEXT_PUBLIC_API_URL=https://api.staging.com
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_APP_NAME=Call Center Dashboard (Staging)
```

#### Development Branch (`develop`)
```env
NEXT_PUBLIC_API_URL=https://api.development.com
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_NAME=Call Center Dashboard (Dev)
```

## Complete Environment Variables Example

### Production Environment
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Call Center Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Authentication (if using custom auth)
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=demo

# Security
NEXT_PUBLIC_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=15

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

### Development Environment
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application Configuration
NEXT_PUBLIC_APP_NAME=Call Center Dashboard (Dev)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=demo

# Security
NEXT_PUBLIC_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=15

# Analytics (disabled for development)
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

## Deployment Checklist

### ✅ Pre-Deployment
- [ ] Set up AWS Amplify app
- [ ] Connect to your Git repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Test backend API connectivity
- [ ] Verify CORS configuration

### ✅ Post-Deployment
- [ ] Test authentication flow
- [ ] Verify API calls work
- [ ] Check session management
- [ ] Test audio playback functionality
- [ ] Verify real-time data updates
- [ ] Test responsive design

## Troubleshooting

### Common Issues

1. **API Calls Failing**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration on backend
   - Ensure API is accessible from Amplify domain

2. **Authentication Issues**
   - Verify session management is working
   - Check localStorage access in production
   - Test login/logout flow

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Environment Variables Not Loading**
   - Ensure variables start with `NEXT_PUBLIC_`
   - Check variable names are correct
   - Verify Amplify build is using latest variables

### Debug Mode

To enable debug mode, add:
```env
NEXT_PUBLIC_DEBUG=true
```

This will enable additional console logging for troubleshooting.

## Security Considerations

### Production Security
- Use HTTPS for all API communications
- Implement proper CORS policies
- Use secure session management
- Enable CSP headers
- Implement rate limiting

### Environment Variable Security
- Never commit sensitive data to Git
- Use AWS Secrets Manager for sensitive values
- Rotate API keys regularly
- Monitor for unauthorized access

## Monitoring & Analytics

### Recommended Monitoring
- AWS CloudWatch for logs
- Application performance monitoring
- Error tracking (Sentry, etc.)
- User analytics (Google Analytics, etc.)

### Health Checks
The application includes built-in health checks:
- API connectivity
- Session status
- Real-time data updates
- Audio playback functionality

## Support

For deployment issues:
1. Check AWS Amplify documentation
2. Review build logs in Amplify console
3. Verify environment variables are set correctly
4. Test API connectivity manually
5. Check browser console for errors 