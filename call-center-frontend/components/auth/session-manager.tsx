"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SessionTimeoutDialog } from "./session-timeout-dialog"

// Session configuration
const SESSION_CONFIG = {
    IDLE_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
    WARNING_TIMEOUT: 14 * 60 * 1000, // Show warning at 14 minutes
    WARNING_DURATION: 60, // Show warning for 60 seconds
}

export const SessionManager = () => {
    const { sessionInfo, refreshSession, logout } = useAuth()
    const [showTimeoutDialog, setShowTimeoutDialog] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(SESSION_CONFIG.WARNING_DURATION)

    // Check if user should see timeout warning
    const shouldShowWarning = useCallback((session: any) => {
        if (!session) return false

        const timeSinceLastActivity = Date.now() - session.lastActivity
        return timeSinceLastActivity >= SESSION_CONFIG.WARNING_TIMEOUT
    }, [])

    // Check if user is idle (should be logged out)
    const isUserIdle = useCallback((session: any) => {
        if (!session) return false

        const timeSinceLastActivity = Date.now() - session.lastActivity
        return timeSinceLastActivity >= SESSION_CONFIG.IDLE_TIMEOUT
    }, [])

    // Handle continue session
    const handleContinueSession = useCallback(async () => {
        try {
            const success = await refreshSession()
            if (!success) {
                console.error("Failed to refresh session")
                logout()
            }
        } catch (error) {
            console.error("Error refreshing session:", error)
            logout()
        }
    }, [refreshSession, logout])

    // Handle logout
    const handleLogout = useCallback(() => {
        logout()
    }, [logout])

    // Monitor session and show timeout dialog
    useEffect(() => {
        if (!sessionInfo) return

        const checkSession = () => {
            // Check if user should be logged out due to inactivity
            if (isUserIdle(sessionInfo)) {
                console.log("User idle timeout reached, logging out")
                logout()
                return
            }

            // Check if warning should be shown
            if (shouldShowWarning(sessionInfo) && !showTimeoutDialog) {
                console.log("Showing session timeout warning")
                setShowTimeoutDialog(true)
                setTimeRemaining(SESSION_CONFIG.WARNING_DURATION)
            }
        }

        // Check session every 30 seconds
        const interval = setInterval(checkSession, 30 * 1000)

        return () => clearInterval(interval)
    }, [sessionInfo, isUserIdle, shouldShowWarning, showTimeoutDialog, logout])

    // Hide dialog when user becomes active again
    useEffect(() => {
        if (!sessionInfo || !showTimeoutDialog) return

        const checkActivity = () => {
            const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity
            if (timeSinceLastActivity < SESSION_CONFIG.WARNING_TIMEOUT) {
                console.log("User became active, hiding timeout dialog")
                setShowTimeoutDialog(false)
            }
        }

        // Check activity every 5 seconds when dialog is shown
        const interval = setInterval(checkActivity, 5000)

        return () => clearInterval(interval)
    }, [sessionInfo, showTimeoutDialog])

    // Auto-logout when countdown reaches zero
    useEffect(() => {
        if (!showTimeoutDialog) return

        const countdown = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(countdown)
                    handleLogout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(countdown)
    }, [showTimeoutDialog, handleLogout])

    if (!sessionInfo) return null

    return (
        <SessionTimeoutDialog
            isOpen={showTimeoutDialog}
            onClose={() => setShowTimeoutDialog(false)}
            onContinue={handleContinueSession}
            onLogout={handleLogout}
            timeRemaining={timeRemaining}
        />
    )
} 