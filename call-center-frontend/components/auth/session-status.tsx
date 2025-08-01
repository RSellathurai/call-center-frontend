"use client"

import { useState, useEffect } from "react"
import { Clock, Shield, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export const SessionStatus = () => {
    const { sessionInfo } = useAuth()
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [status, setStatus] = useState<'active' | 'warning' | 'expired'>('active')

    useEffect(() => {
        if (!sessionInfo) return

        const updateStatus = () => {
            const now = Date.now()
            const timeUntilExpiry = sessionInfo.expiresAt - now
            const timeSinceActivity = now - sessionInfo.lastActivity

            // Calculate time remaining in minutes
            const minutesRemaining = Math.floor(timeUntilExpiry / (1000 * 60))
            setTimeRemaining(minutesRemaining)

            // Determine status
            if (timeSinceActivity >= 14 * 60 * 1000) { // 14 minutes idle
                setStatus('warning')
            } else if (timeUntilExpiry <= 0) {
                setStatus('expired')
            } else {
                setStatus('active')
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [sessionInfo])

    if (!sessionInfo) return null

    const getStatusIcon = () => {
        switch (status) {
            case 'active':
                return <Shield className="h-3 w-3" />
            case 'warning':
                return <AlertTriangle className="h-3 w-3" />
            case 'expired':
                return <Clock className="h-3 w-3" />
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200'
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'active':
                return `Session Active (${timeRemaining}m)`
            case 'warning':
                return `Session Expiring (${timeRemaining}m)`
            case 'expired':
                return 'Session Expired'
        }
    }

    return (
        <Badge
            variant="outline"
            className={`text-xs ${getStatusColor()} flex items-center gap-1`}
        >
            {getStatusIcon()}
            {getStatusText()}
        </Badge>
    )
} 