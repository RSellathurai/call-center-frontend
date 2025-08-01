"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

interface SessionTimeoutDialogProps {
    isOpen: boolean
    onClose: () => void
    onContinue: () => void
    onLogout: () => void
    timeRemaining: number
}

export const SessionTimeoutDialog = ({
    isOpen,
    onClose,
    onContinue,
    onLogout,
    timeRemaining
}: SessionTimeoutDialogProps) => {
    const [countdown, setCountdown] = useState(timeRemaining)
    const router = useRouter()

    useEffect(() => {
        if (!isOpen) return

        setCountdown(timeRemaining)

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onLogout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isOpen, timeRemaining, onLogout])

    const handleContinue = async () => {
        onContinue()
        onClose()
    }

    const handleLogout = () => {
        onLogout()
        onClose()
        router.push("/login")
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                Session Timeout Warning
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600">
                                Your session will expire due to inactivity
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Time Remaining:</span>
                            <span className="font-mono text-lg">{formatTime(countdown)}</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-2">
                            You've been inactive for 15 minutes. Choose an option to continue your session or you'll be automatically logged out.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900">Continue Session</h4>
                                <p className="text-sm text-blue-700">
                                    Extend your session and continue working. Your session will be refreshed.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <LogOut className="h-5 w-5 text-gray-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-gray-900">Logout Now</h4>
                                <p className="text-sm text-gray-700">
                                    End your session and return to the login page. Any unsaved work may be lost.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Continue Session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 