# AWS Cognito Integration Guide for Call Center Frontend

## Overview

This guide provides comprehensive instructions for integrating AWS Cognito authentication with the Call Center Frontend application. The current implementation uses demo authentication, and this guide will help you replace it with AWS Cognito for production use.

## Prerequisites

### AWS Cognito Setup
1. **AWS Account** with appropriate permissions
2. **Cognito User Pool** created
3. **Cognito Identity Pool** (optional, for AWS service access)
4. **App Client** configured in the User Pool

### Required AWS Cognito Resources

#### 1. User Pool Configuration
```json
{
  "UserPoolName": "call-center-users",
  "Policies": {
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  },
  "AutoVerifiedAttributes": ["email"],
  "MfaConfiguration": "OFF",
  "MfaTypes": [],
  "EmailConfiguration": {
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }
}
```

#### 2. App Client Configuration
```json
{
  "ClientName": "call-center-web-client",
  "GenerateSecret": false,
  "RefreshTokenValidity": 30,
  "AccessTokenValidity": 1,
  "IdTokenValidity": 1,
  "TokenValidityUnits": {
    "AccessToken": "hours",
    "IdToken": "hours",
    "RefreshToken": "days"
  },
  "ReadAttributes": [
    "email",
    "email_verified",
    "name",
    "given_name",
    "family_name",
    "custom:role"
  ],
  "WriteAttributes": [
    "email",
    "name",
    "given_name",
    "family_name"
  ],
  "ExplicitAuthFlows": [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ],
  "SupportedIdentityProviders": ["COGNITO"],
  "CallbackURLs": [
    "http://localhost:3000/auth/callback",
    "https://your-amplify-domain.amplifyapp.com/auth/callback"
  ],
  "LogoutURLs": [
    "http://localhost:3000/auth/logout",
    "https://your-amplify-domain.amplifyapp.com/auth/logout"
  ]
}
```

## Required Dependencies

### Install AWS Amplify Libraries
```bash
npm install aws-amplify @aws-amplify/ui-react
```

### Update package.json
```json
{
  "dependencies": {
    "aws-amplify": "^6.0.0",
    "@aws-amplify/ui-react": "^6.0.0",
    // ... existing dependencies
  }
}
```

## Environment Variables

### Required Cognito Environment Variables

#### `NEXT_PUBLIC_AWS_REGION`
- **Description**: AWS region where Cognito resources are deployed
- **Required**: Yes
- **Example**: `us-east-1`, `us-west-2`, `eu-west-1`

#### `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- **Description**: Cognito User Pool ID
- **Required**: Yes
- **Format**: `region_poolid` (e.g., `us-east-1_abcdef123`)

#### `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- **Description**: Cognito App Client ID
- **Required**: Yes
- **Format**: Alphanumeric string

#### `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID` (Optional)
- **Description**: Cognito Identity Pool ID (for AWS service access)
- **Required**: No
- **Format**: `region:poolid`

### Complete Environment Variables Example

```env
# AWS Cognito Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_abcdef123
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghijklmnop
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789012

# Application Configuration
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=Call Center Dashboard
NEXT_PUBLIC_ENVIRONMENT=production

# Authentication Configuration
NEXT_PUBLIC_AUTH_PROVIDER=cognito
NEXT_PUBLIC_AUTH_ENABLED=true
```

## Implementation Steps

### 1. Configure AWS Amplify

Create `lib/amplify-config.ts`:
```typescript
import { Amplify } from 'aws-amplify'

const amplifyConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    oauth: {
      domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN,
      redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT,
      responseType: 'code'
    }
  },
  API: {
    endpoints: [
      {
        name: 'CallCenterAPI',
        endpoint: process.env.NEXT_PUBLIC_API_URL,
        region: process.env.NEXT_PUBLIC_AWS_REGION
      }
    ]
  }
}

export const configureAmplify = () => {
  Amplify.configure(amplifyConfig)
}
```

### 2. Update Authentication Context

Replace `contexts/auth-context.tsx` with Cognito integration:

```typescript
"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { Auth, Hub } from 'aws-amplify'
import { CognitoUser } from '@aws-amplify/auth'

interface User {
  id: string
  email: string
  name: string
  role: string
  attributes?: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  confirmSignUp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const cognitoUser = await Auth.currentAuthenticatedUser()
      const attributes = await Auth.currentUserInfo()
      
      const userData: User = {
        id: cognitoUser.username,
        email: attributes.attributes.email,
        name: attributes.attributes.name || attributes.attributes.given_name || 'User',
        role: attributes.attributes['custom:role'] || 'user',
        attributes: attributes.attributes
      }
      
      setUser(userData)
    } catch (error) {
      console.log('No authenticated user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const cognitoUser = await Auth.signIn(email, password)
      
      const userData: User = {
        id: cognitoUser.username,
        email: cognitoUser.attributes.email,
        name: cognitoUser.attributes.name || cognitoUser.attributes.given_name || 'User',
        role: cognitoUser.attributes['custom:role'] || 'user',
        attributes: cognitoUser.attributes
      }
      
      setUser(userData)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      
      if (error.code === 'UserNotConfirmedException') {
        errorMessage = 'Please confirm your email address'
      } else if (error.code === 'NotAuthorizedException') {
        errorMessage = 'Invalid email or password'
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'User not found'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await Auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name,
          'custom:role': 'user'
        }
      })
      return { success: true }
    } catch (error: any) {
      console.error('Sign up error:', error)
      let errorMessage = 'Sign up failed'
      
      if (error.code === 'UsernameExistsException') {
        errorMessage = 'User already exists'
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet requirements'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Confirm sign up
  const confirmSignUp = useCallback(async (email: string, code: string) => {
    try {
      setIsLoading(true)
      await Auth.confirmSignUp(email, code)
      return { success: true }
    } catch (error: any) {
      console.error('Confirm sign up error:', error)
      return { success: false, error: 'Invalid confirmation code' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      await Auth.forgotPassword(email)
      return { success: true }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      return { success: false, error: 'Failed to send reset code' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true)
      await Auth.forgotPasswordSubmit(email, code, newPassword)
      return { success: true }
    } catch (error: any) {
      console.error('Reset password error:', error)
      return { success: false, error: 'Failed to reset password' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Listen for auth events
  useEffect(() => {
    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          checkAuth()
          break
        case 'signOut':
          setUser(null)
          break
        case 'tokenRefresh':
          checkAuth()
          break
      }
    }

    Hub.listen('auth', listener)
    checkAuth()

    return () => Hub.remove('auth', listener)
  }, [checkAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signUp,
    confirmSignUp,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 3. Update Login Page

Update `app/login/page.tsx` to support Cognito:

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Phone, Lock, AlertCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignUpFormData = z.infer<typeof signUpSchema>
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const { 
    login, 
    signUp, 
    confirmSignUp, 
    forgotPassword, 
    resetPassword,
    isAuthenticated, 
    isLoading 
  } = useAuth()
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (data: LoginFormData) => {
    setError(null)
    setSuccess(null)
    
    const result = await login(data.email, data.password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed")
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    setError(null)
    setSuccess(null)
    
    const result = await signUp(data.email, data.password, data.name)
    
    if (result.success) {
      setSuccess("Account created! Please check your email for confirmation code.")
      setIsSignUpMode(false)
    } else {
      setError(result.error || "Sign up failed")
    }
  }

  const handleConfirmSignUp = async () => {
    setError(null)
    setSuccess(null)
    
    const email = signUpForm.getValues("email")
    const result = await confirmSignUp(email, confirmationCode)
    
    if (result.success) {
      setSuccess("Email confirmed! You can now log in.")
      setIsSignUpMode(false)
    } else {
      setError(result.error || "Confirmation failed")
    }
  }

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setError(null)
    setSuccess(null)
    
    const result = await forgotPassword(data.email)
    
    if (result.success) {
      setSuccess("Reset code sent to your email!")
      setIsForgotPasswordMode(false)
    } else {
      setError(result.error || "Failed to send reset code")
    }
  }

  const handleResetPassword = async () => {
    setError(null)
    setSuccess(null)
    
    const email = forgotPasswordForm.getValues("email")
    const result = await resetPassword(email, resetCode, newPassword)
    
    if (result.success) {
      setSuccess("Password reset successfully! You can now log in.")
      setIsForgotPasswordMode(false)
    } else {
      setError(result.error || "Password reset failed")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Call Center Dashboard
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your AI agent dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...loginForm.register("password")}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsForgotPasswordMode(true)}
                    className="text-sm text-blue-600"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      {...signUpForm.register("name")}
                    />
                    {signUpForm.formState.errors.name && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signUpForm.register("email")}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      {...signUpForm.register("password")}
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={signUpForm.formState.isSubmitting}
                  >
                    {signUpForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 4. Update Layout

Update `app/layout.tsx` to configure Amplify:

```typescript
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { SessionManager } from "@/components/auth/session-manager"
import { configureAmplify } from "@/lib/amplify-config"

// Configure Amplify
configureAmplify()

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Agent Dashboard - DoctorsWithHeart",
  description: "Monitor and analyze your AI agent conversations with natural language search and real-time updates",
  keywords: ["AI", "dashboard", "call center", "analytics", "healthcare", "conversations"],
  authors: [{ name: "AI Agent Dashboard Team" }],
  viewport: "width=device-width, initial-scale=1",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <SessionManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## AWS Cognito Setup Instructions

### 1. Create User Pool

```bash
# Using AWS CLI
aws cognito-idp create-user-pool \
  --pool-name "call-center-users" \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "role",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true,
      "StringAttributeConstraints": {
        "MinLength": "1",
        "MaxLength": "256"
      }
    }
  ]'
```

### 2. Create App Client

```bash
# Replace USER_POOL_ID with your actual User Pool ID
aws cognito-idp create-user-pool-client \
  --user-pool-id USER_POOL_ID \
  --client-name "call-center-web-client" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls "http://localhost:3000/auth/callback" "https://your-amplify-domain.amplifyapp.com/auth/callback" \
  --logout-urls "http://localhost:3000/auth/logout" "https://your-amplify-domain.amplifyapp.com/auth/logout" \
  --read-attributes email email_verified name given_name family_name custom:role \
  --write-attributes email name given_name family_name custom:role
```

### 3. Create Identity Pool (Optional)

```bash
# Replace USER_POOL_ID and CLIENT_ID with your actual values
aws cognito-identity create-identity-pool \
  --identity-pool-name "call-center-identity-pool" \
  --allow-unauthenticated-identities \
  --cognito-identity-providers ProviderName="cognito-idp.REGION.amazonaws.com/USER_POOL_ID",ClientId="CLIENT_ID",ServerSideTokenCheck=false
```

## Testing the Integration

### 1. Test User Registration
```bash
# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username "test@example.com" \
  --user-attributes Name=email,Value="test@example.com" Name=name,Value="Test User" Name=custom:role,Value="admin" \
  --temporary-password "TempPass123!"
```

### 2. Test Authentication
- Navigate to your application
- Try logging in with the test user
- Verify session management works
- Test logout functionality

## Security Considerations

### 1. Token Management
- Tokens are automatically managed by AWS Amplify
- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Automatic token refresh is handled

### 2. CORS Configuration
Ensure your Cognito User Pool allows your domain:
```json
{
  "CallbackURLs": [
    "https://your-domain.com/auth/callback"
  ],
  "LogoutURLs": [
    "https://your-domain.com/auth/logout"
  ]
}
```

### 3. Password Policy
The default password policy includes:
- Minimum 8 characters
- Requires uppercase letters
- Requires lowercase letters
- Requires numbers
- Requires symbols

## Troubleshooting

### Common Issues

1. **"User not found" error**
   - Verify user exists in Cognito User Pool
   - Check if user is confirmed
   - Ensure email is correct

2. **"Invalid password" error**
   - Check password meets requirements
   - Verify temporary password is changed
   - Ensure password is not expired

3. **CORS errors**
   - Verify callback URLs in Cognito configuration
   - Check domain is allowed in User Pool settings
   - Ensure HTTPS is used in production

4. **Token refresh issues**
   - Check refresh token validity
   - Verify client configuration
   - Ensure network connectivity

### Debug Mode

Enable debug logging:
```typescript
import { Logger } from 'aws-amplify'

Logger.configure({
  level: 'DEBUG'
})
```

## Migration from Demo Auth

### 1. Backup Current Users
If you have existing demo users, export their data:
```typescript
// Export demo user data
const demoUsers = JSON.parse(localStorage.getItem("user_data") || "[]")
console.log("Demo users:", demoUsers)
```

### 2. Create Cognito Users
Use AWS CLI or Cognito console to create users:
```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username "admin@callcenter.com" \
  --user-attributes Name=email,Value="admin@callcenter.com" Name=name,Value="Call Center Admin" Name=custom:role,Value="admin" \
  --temporary-password "TempPass123!"
```

### 3. Update Environment Variables
Set the Cognito environment variables in AWS Amplify:
```env
NEXT_PUBLIC_AUTH_PROVIDER=cognito
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_abcdef123
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghijklmnop
```

## Support

For Cognito-specific issues:
1. Check AWS Cognito documentation
2. Review CloudWatch logs
3. Verify User Pool configuration
4. Test with AWS CLI commands
5. Check network connectivity and CORS settings 