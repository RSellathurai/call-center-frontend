"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Brain,
    MessageSquare,
    Activity,
    Download,
    PhoneCall,
    CheckCircle,
    CalendarIcon,
    TrendingUp,
    Clock,
    Sparkles,
    ChevronDown,
    TrendingDown,
    Settings,
    RefreshCw,
    Radio,
    Play,
    Pause,
    BarChart3,
    Search,
    Phone,
    LogOut,
} from "lucide-react"

// Import data
import type { Call, CallVolumeData, OutcomeData, PerformanceMetric } from "@/lib/types"
import { getDashboardData, getRecentCalls, getCallVolumeData, getOutcomeData, getPerformanceData } from "@/lib/data"

// Import components
import { StatsCard } from "@/components/dashboard/stats-card"
import { NaturalLanguageSearch } from "@/components/dashboard/natural-language-search"
import { ConversationTimelineItem } from "@/components/conversation/conversation-timeline-item"
import { LiveCallsTable } from "@/components/dashboard/live-calls-table"
import { PerformanceChart } from "@/components/analytics/performance-chart"
import { OutcomesChart } from "@/components/analytics/outcomes-chart"
import { PerformanceMetrics } from "@/components/analytics/performance-metrics"
import { formatDuration, calculateSuccessRate } from "@/lib/utils/formatters"
import { sortCalls } from "@/lib/utils/helpers"
import { searchConversations } from "@/lib/services/search-service"
import { useLiveData } from "@/hooks/use-live-data"
import { SearchFilters } from "@/components/dashboard/search-filters"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { SessionStatus } from "@/components/auth/session-status"

export function AIAgentDashboard() {
    const { user, logout, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [recentCalls, setRecentCalls] = useState<Call[]>([])
    const [isLoadingCalls, setIsLoadingCalls] = useState(true)
    const [callsError, setCallsError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchCriteria, setSearchCriteria] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [sortBy, setSortBy] = useState<"timestamp" | "duration" | "status" | "outcome">("timestamp")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [selectedCalls, setSelectedCalls] = useState<string[]>([])

    // Dynamic data state
    const [dashboardData, setDashboardData] = useState({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        unknownCalls: 0,
        avgCallDuration: 0,
        totalCallTime: 0,
        appointmentsScheduled: 0,
        prescriptionRefills: 0,
        totalMessages: 0,
    })
    const [callVolumeData, setCallVolumeData] = useState<CallVolumeData[]>([])
    const [outcomeData, setOutcomeData] = useState<OutcomeData[]>([])
    const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Live data hook
    const {
        liveCalls,
        isLoading: isLoadingLive,
        lastUpdated,
        error: liveError,
        isEnabled,
        toggleLiveUpdates,
        clearLiveCalls,
        manualRefresh: refreshLive,
    } = useLiveData()

    // Load all data on mount
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoadingData(true)
            try {
                const [dashboard, volume, outcomes, performance] = await Promise.all([
                    getDashboardData(),
                    getCallVolumeData(),
                    getOutcomeData(),
                    getPerformanceData(),
                ])

                setDashboardData(dashboard)
                setCallVolumeData(volume)
                setOutcomeData(outcomes)
                setPerformanceData(performance)
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
            } finally {
                setIsLoadingData(false)
            }
        }

        loadAllData()
    }, [])

    // Load recent calls
    useEffect(() => {
        const loadRecentCalls = async () => {
            setIsLoadingCalls(true)
            setCallsError(null)

            try {
                const calls = await getRecentCalls()
                if (calls.length > 0) {
                    setRecentCalls(calls)
                } else {
                    setRecentCalls([]) // Show empty state if no calls
                    setCallsError("No recent calls found.")
                }
            } catch (error) {
                console.error("Failed to load recent calls:", error)
                setCallsError("Failed to load conversations from API")
                setRecentCalls([]) // Show empty state on error
            } finally {
                setIsLoadingCalls(false)
                setIsInitialLoad(false)
            }
        }

        loadRecentCalls()
    }, [])

    const handleSearch = (query: string, criteria: any) => {
        setSearchQuery(query)
        setSearchCriteria(criteria)
        setIsSearching(true)

        // Simulate search delay
        setTimeout(() => {
            setIsSearching(false)
        }, 1000)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const calls = await getRecentCalls()
            if (calls.length > 0) {
                setRecentCalls(calls)
                setCallsError(null)
            } else {
                setRecentCalls([])
                setCallsError("No recent calls found after refresh.")
            }
            setCallsError(null)
        } catch (error) {
            console.error("Failed to refresh calls:", error)
            setCallsError("Failed to refresh conversations")
            setRecentCalls([]) // Show empty state on error
        } finally {
            setIsRefreshing(false)
        }
    }

    // Handle logout
    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const successRate = calculateSuccessRate(dashboardData.successfulCalls, dashboardData.totalCalls)
    const avgDurationMin = Math.floor(dashboardData.avgCallDuration / 60)
    const avgDurationSec = dashboardData.avgCallDuration % 60

    // Show loading screen during initial load
    if (isInitialLoad) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-3 sm:p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto space-y-4 lg:space-y-6">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">AI Agent Dashboard</h1>
                            <p className="text-xs text-slate-600">
                                Real-time conversation monitoring and analysis
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {user && (
                            <div className="flex items-center gap-2 mr-2">
                                <span className="text-sm text-slate-600">Welcome, {user.name}</span>
                                <SessionStatus />
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                >
                                    <LogOut className="h-3 w-3 mr-1" />
                                    Logout
                                </Button>
                            </div>
                        )}
                        {callsError && (
                            <Badge variant="destructive" className="text-xs">
                                {callsError}
                            </Badge>
                        )}
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoadingCalls}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs"
                        >
                            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Calls"
                        value={dashboardData.totalCalls.toString()}
                        subtitle="Last 24 hours"
                        icon={PhoneCall}
                        gradient="from-blue-500 to-blue-600"
                        trend={{ value: "+12% from yesterday", icon: TrendingUp, positive: true }}
                    />
                    <StatsCard
                        title="Success Rate"
                        value={`${successRate}%`}
                        subtitle="Call completion rate"
                        icon={CheckCircle}
                        gradient="from-green-500 to-green-600"
                        trend={{ value: "+5.2% from yesterday", icon: TrendingUp, positive: true }}
                    />
                    <StatsCard
                        title="Avg Duration"
                        value={`${avgDurationMin}m ${avgDurationSec}s`}
                        subtitle="Average call length"
                        icon={Clock}
                        gradient="from-purple-500 to-purple-600"
                        trend={{ value: "-8.1% from yesterday", icon: TrendingDown, positive: false }}
                    />
                    <StatsCard
                        title="Appointments"
                        value={dashboardData.appointmentsScheduled.toString()}
                        subtitle="Scheduled today"
                        icon={CalendarIcon}
                        gradient="from-orange-500 to-orange-600"
                        trend={{ value: "+23% from yesterday", icon: TrendingUp, positive: true }}
                    />
                </div>

                {/* Main Content */}
                <Tabs defaultValue="conversations" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 shadow-sm">
                        <TabsTrigger
                            value="conversations"
                            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Conversations
                        </TabsTrigger>
                        <TabsTrigger
                            value="live"
                            className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200"
                        >
                            <Radio className="h-4 w-4" />
                            Live Calls
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger
                            value="search"
                            className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </TabsTrigger>
                    </TabsList>

                    {/* Conversations Tab */}
                    <TabsContent value="conversations" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Recent Conversations */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            Recent Conversations
                                        </CardTitle>
                                        <CardDescription>
                                            Latest AI agent conversations and their outcomes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingCalls ? (
                                            <div className="space-y-3">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : recentCalls.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentCalls.slice(0, 5).map((call) => (
                                                    <ConversationTimelineItem key={call.id} call={call} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No conversations found</p>
                                                <p className="text-sm">Recent conversations will appear here</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button className="w-full justify-start" variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Data
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Settings
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Call Volume Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Call Volume
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <PerformanceChart data={callVolumeData} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Live Calls Tab */}
                    <TabsContent value="live" className="space-y-4">
                        <LiveCallsTable
                            calls={liveCalls}
                            isLoading={isLoadingLive}
                            lastUpdated={lastUpdated}
                            error={liveError}
                            isEnabled={isEnabled}
                            onToggleLive={toggleLiveUpdates}
                            onClearCalls={clearLiveCalls}
                            onRefresh={refreshLive}
                        />
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PerformanceMetrics data={performanceData} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Call Outcomes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <OutcomesChart data={outcomeData} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Natural Language Search
                                </CardTitle>
                                <CardDescription>
                                    Search conversations using natural language queries
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NaturalLanguageSearch onSearch={handleSearch} />
                                <SearchFilters
                                    onSearch={handleSearch}
                                    isSearching={isSearching}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 