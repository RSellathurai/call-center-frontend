"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

interface User {
    id: string
    email: string
    name: string
    role: string
}

interface SessionInfo {
    token: string
    expiresAt: number
    lastActivity: number
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    sessionInfo: SessionInfo | null
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    checkAuth: () => Promise<void>
    refreshSession: () => Promise<boolean>
    updateLastActivity: () => void
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

// Session configuration
const SESSION_CONFIG = {
    IDLE_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
    WARNING_TIMEOUT: 14 * 60 * 1000, // Show warning at 14 minutes
    SESSION_DURATION: 60 * 60 * 1000, // 1 hour session duration
    REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token if expires in 5 minutes
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)

    // Generate a new session token
    const generateSessionToken = useCallback(() => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }, [])

    // Check if session is expired
    const isSessionExpired = useCallback((session: SessionInfo) => {
        return Date.now() > session.expiresAt
    }, [])

    // Check if session needs refresh
    const needsRefresh = useCallback((session: SessionInfo) => {
        const timeUntilExpiry = session.expiresAt - Date.now()
        return timeUntilExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD
    }, [])

    // Check if user is idle
    const isUserIdle = useCallback((session: SessionInfo) => {
        const timeSinceLastActivity = Date.now() - session.lastActivity
        return timeSinceLastActivity >= SESSION_CONFIG.IDLE_TIMEOUT
    }, [])

    // Check if warning should be shown
    const shouldShowWarning = useCallback((session: SessionInfo) => {
        const timeSinceLastActivity = Date.now() - session.lastActivity
        return timeSinceLastActivity >= SESSION_CONFIG.WARNING_TIMEOUT
    }, [])

    // Refresh session token
    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            if (!sessionInfo) return false

            // In a real app, you would make an API call to refresh the token
            // For demo purposes, we'll simulate a refresh
            const newSession: SessionInfo = {
                token: generateSessionToken(),
                expiresAt: Date.now() + SESSION_CONFIG.SESSION_DURATION,
                lastActivity: Date.now()
            }

            // Store new session data
            localStorage.setItem("session_info", JSON.stringify(newSession))
            setSessionInfo(newSession)

            console.log("Session refreshed successfully")
            return true
        } catch (error) {
            console.error("Failed to refresh session:", error)
            return false
        }
    }, [sessionInfo, generateSessionToken])

    // Update last activity timestamp
    const updateLastActivity = useCallback(() => {
        setSessionInfo(prevSession => {
            if (prevSession) {
                const updatedSession = {
                    ...prevSession,
                    lastActivity: Date.now()
                }
                localStorage.setItem("session_info", JSON.stringify(updatedSession))
                return updatedSession
            }
            return prevSession
        })
    }, [])

    // Logout function - defined before checkAuth to avoid circular dependency
    const logout = useCallback(() => {
        localStorage.removeItem("user_data")
        localStorage.removeItem("session_info")
        setUser(null)
        setSessionInfo(null)
    }, [])

    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true)

            // Check if user is logged in from localStorage
            const userData = localStorage.getItem("user_data")
            const sessionData = localStorage.getItem("session_info")

            if (userData && sessionData) {
                const user = JSON.parse(userData)
                const session = JSON.parse(sessionData)

                // Check if session is expired
                if (Date.now() > session.expiresAt) {
                    console.log("Session expired, logging out")
                    logout()
                    return
                }

                // Check if session needs refresh
                const timeUntilExpiry = session.expiresAt - Date.now()
                if (timeUntilExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD) {
                    console.log("Session needs refresh")
                    const refreshed = await refreshSession()
                    if (!refreshed) {
                        console.log("Failed to refresh session, logging out")
                        logout()
                        return
                    }
                }

                setUser(user)
                setSessionInfo(session)
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }, [logout, refreshSession])

    const login = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true)

            // In a real app, you would make an API call to your backend
            // For demo purposes, we'll simulate a login
            if (email === "admin@callcenter.com" && password === "password123") {
                const userData: User = {
                    id: "1",
                    email: email,
                    name: "Call Center Admin",
                    role: "admin"
                }

                // Create new session
                const newSession: SessionInfo = {
                    token: generateSessionToken(),
                    expiresAt: Date.now() + SESSION_CONFIG.SESSION_DURATION,
                    lastActivity: Date.now()
                }

                // Store auth data
                localStorage.setItem("user_data", JSON.stringify(userData))
                localStorage.setItem("session_info", JSON.stringify(newSession))

                setUser(userData)
                setSessionInfo(newSession)
                return { success: true }
            } else {
                return { success: false, error: "Invalid email or password" }
            }
        } catch (error) {
            console.error("Login failed:", error)
            return { success: false, error: "Login failed. Please try again." }
        } finally {
            setIsLoading(false)
        }
    }, [generateSessionToken])

    // Set up activity listeners
    useEffect(() => {
        const handleActivity = () => {
            updateLastActivity()
        }

        // Add event listeners for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true)
        })

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true)
            })
        }
    }, [updateLastActivity])

    // Set up session monitoring
    useEffect(() => {
        if (!sessionInfo) return

        const checkSession = () => {
            if (Date.now() > sessionInfo.expiresAt) {
                console.log("Session expired during monitoring")
                logout()
                return
            }

            const timeUntilExpiry = sessionInfo.expiresAt - Date.now()
            if (timeUntilExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD) {
                console.log("Session needs refresh during monitoring")
                refreshSession()
            }
        }

        // Check session every minute
        const interval = setInterval(checkSession, 60 * 1000)

        return () => clearInterval(interval)
    }, [sessionInfo, logout, refreshSession])

    // Initial auth check - only run once on mount
    useEffect(() => {
        checkAuth()
    }, []) // Empty dependency array to run only once

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionInfo,
        login,
        logout,
        checkAuth,
        refreshSession,
        updateLastActivity
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
} 