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

export default function AIAgentDashboard() {
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

  // Show loading screen during initial load
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 mx-auto">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Loading AI Agent Dashboard</h2>
            <p className="text-slate-600">Fetching conversation data and analytics...</p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Apply search and sorting
  const filteredCalls = searchCriteria
    ? sortCalls(searchConversations(recentCalls, searchCriteria), sortBy, sortOrder)
    : sortCalls(recentCalls, sortBy, sortOrder)

  const handleSearch = (query: string, criteria: any) => {
    setIsSearching(true)
    setSearchQuery(query)
    setSearchCriteria(criteria)

    // Simulate search delay for better UX
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const calls = await getRecentCalls()
      if (calls.length > 0) {
        setRecentCalls(calls)
      } else {
        setRecentCalls([]) // Show empty state if no calls after refresh
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

  const successRate = calculateSuccessRate(dashboardData.successfulCalls, dashboardData.totalCalls)
  const avgDurationMin = Math.floor(dashboardData.avgCallDuration / 60)
  const avgDurationSec = dashboardData.avgCallDuration % 60

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

          {/* Conversations Tab - Optimized Layout */}
          <TabsContent value="conversations" className="space-y-3">
            {/* Combined Search and Filters Section */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Natural Language Search - Compact */}
                  <div className="border-b border-slate-100 pb-3">
                    <NaturalLanguageSearch
                      onSearch={handleSearch}
                      calls={recentCalls}
                      isLoading={isSearching || isLoadingCalls}
                      resultsCount={filteredCalls.length}
                    />
                  </div>
                  
                  {/* Search Filters - Compact */}
                  <div>
                    <SearchFilters
                      searchTerm={searchQuery}
                      onSearchChange={setSearchQuery}
                      statusFilter="all"
                      onStatusChange={() => {}}
                      outcomeFilter="all"
                      onOutcomeChange={() => {}}
                      sortOrder={sortOrder}
                      onSortOrderChange={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      resultsCount={filteredCalls.length}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Calls Table - Compact Header */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Recent Conversations</CardTitle>
                      <CardDescription className="text-xs">
                        {filteredCalls.length} conversations • Latest call center outcomes
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              </CardHeader>
              <CardContent className="p-0">
                <LiveCallsTable
                  calls={recentCalls}
                  isLoading={isLoadingCalls}
                  lastUpdated={null}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Calls Tab */}
          <TabsContent value="live" className="space-y-3">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                      <Radio className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Live Call Monitoring</CardTitle>
                      <CardDescription className="text-xs">
                        {liveCalls.length} active calls • Real-time updates every 5 minutes
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={toggleLiveUpdates}
                      variant={isEnabled ? "default" : "outline"}
                      size="sm"
                      className={`h-8 px-3 text-xs ${isEnabled ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      {isEnabled ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                    {isEnabled && (
                      <Button
                        onClick={clearLiveCalls}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs bg-white hover:bg-red-50 text-red-600 border-red-200"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LiveCallsTable
                  calls={liveCalls}
                  isLoading={isLoadingLive}
                  lastUpdated={lastUpdated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-3">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Call Volume Chart */}
              <div className="h-[400px]">
                {isLoadingData ? (
                  <div className="h-full bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">Loading call volume data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <PerformanceChart data={callVolumeData} />
                  </div>
                )}
              </div>

              {/* Outcomes Chart */}
              <div className="h-[400px]">
                {isLoadingData ? (
                  <div className="h-full bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">Loading outcomes data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <OutcomesChart data={outcomeData} />
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              {isLoadingData ? (
                <div className="h-32 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading performance metrics...</p>
                  </div>
                </div>
              ) : (
                <PerformanceMetrics data={performanceData} />
              )}
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-3">
            {/* Conversation Timeline */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-white" />  
                    </div>
                    <div>
                      <CardTitle className="text-base">Conversation Timeline</CardTitle>
                      <CardDescription className="text-xs">
                        {searchQuery
                          ? `AI search: "${searchQuery}"`
                          : "Historical conversation monitoring"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {filteredCalls.length} conversations
                    </Badge>
                    {searchQuery && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Search
                      </Badge>
                    )}
                    {isLoadingCalls && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Loading
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCalls ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">Loading conversations...</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredCalls.map((call, index) => (
                      <ConversationTimelineItem
                        key={call.id}
                        call={call}
                        index={index}
                        isSelected={selectedCalls.includes(call.id)}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedCalls([...selectedCalls, call.id])
                          } else {
                            setSelectedCalls(selectedCalls.filter((id) => id !== call.id))
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
