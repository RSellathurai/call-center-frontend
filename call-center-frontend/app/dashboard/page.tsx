"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AIAgentDashboard } from "@/components/dashboard/ai-agent-dashboard"

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <AIAgentDashboard />
        </ProtectedRoute>
    )
} 