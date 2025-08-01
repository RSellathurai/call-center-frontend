"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Sparkles, Loader2, X, Brain, Filter, Clock, TrendingUp, AlertCircle } from "lucide-react"
import {
  parseNaturalLanguageQuery,
  generateSearchSuggestions,
  parseQueryWithPatterns,
  testAIConnection,
} from "@/lib/services/search-service"
import type { Call } from "@/lib/types"

interface NaturalLanguageSearchProps {
  onSearch: (query: string, criteria: any) => void
  calls: Call[]
  isLoading?: boolean
  resultsCount?: number
}

export function NaturalLanguageSearch({
  onSearch,
  calls,
  isLoading = false,
  resultsCount = 0,
}: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeCriteria, setActiveCriteria] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(true)

  useEffect(() => {
    // Test AI connection first, then generate suggestions
    const initializeSearch = async () => {
      try {
        const isAIWorking = await testAIConnection()
        setAiAvailable(isAIWorking)

        if (isAIWorking) {
          const suggestions = await generateSearchSuggestions(calls)
          setSuggestions(suggestions)
        } else {
          // Use fallback suggestions
          setSuggestions([
            "Show me failed calls from today",
            "Find all appointment bookings",
            "Positive feedback conversations",
            "Urgent prescription calls",
            "Calls with Dr. Smith",
            "Incomplete conversations",
            "High priority calls",
            "Recent information inquiries",
          ])
        }
      } catch (error) {
        console.error("Search initialization failed:", error)
        setAiAvailable(false)
        setSuggestions([
          "Show me failed calls from today",
          "Find all appointment bookings",
          "Positive feedback conversations",
          "Urgent prescription calls",
          "Calls with Dr. Smith",
          "Incomplete conversations",
          "High priority calls",
          "Recent information inquiries",
        ])
      }
    }

    initializeSearch()
  }, [calls])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsProcessing(true)
    try {
      let criteria
      if (aiAvailable) {
        try {
          criteria = await parseNaturalLanguageQuery(searchQuery)
        } catch (error) {
          console.error("AI parsing failed, using pattern matching:", error)
          criteria = parseQueryWithPatterns(searchQuery)
          setAiAvailable(false)
        }
      } else {
        criteria = parseQueryWithPatterns(searchQuery)
      }

      setActiveCriteria(criteria)
      onSearch(searchQuery, criteria)
      setShowSuggestions(false)
    } catch (error) {
      console.error("Search error:", error)
      // Even if everything fails, try basic keyword search
      const basicCriteria = {
        keywords: searchQuery.split(" ").filter((word) => word.length > 2),
      }
      setActiveCriteria(basicCriteria)
      onSearch(searchQuery, basicCriteria)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const clearSearch = () => {
    setQuery("")
    setActiveCriteria(null)
    onSearch("", null)
  }

  return (
    <div className="space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <div className="relative">
          <Brain
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${aiAvailable ? "text-blue-500" : "text-orange-500"}`}
          />
          <Input
            placeholder={
              aiAvailable
                ? "Ask me anything about your conversations... (e.g., 'Show me failed calls from yesterday')"
                : "Search conversations using keywords and patterns..."
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(e.target.value.length === 0)
            }}
            onFocus={() => setShowSuggestions(query.length === 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(query)
              }
            }}
            className="pl-10 pr-24 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 focus:bg-white transition-all duration-200 text-base"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {!aiAvailable && (
              <div className="flex items-center gap-1 text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3" />
                Pattern Mode
              </div>
            )}
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || isProcessing}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-8"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* AI Processing Indicator */}
        {isProcessing && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm font-medium text-blue-900">
                  {aiAvailable ? "AI is analyzing your query..." : "Processing search patterns..."}
                </span>
              </div>
              <div className="flex-1 bg-blue-200 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Status Banner */}
      {!aiAvailable && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                AI search is temporarily unavailable. Using pattern-based search instead.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {aiAvailable ? "Try these AI-powered searches:" : "Try these search patterns:"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 bg-white/50"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Search Criteria */}
      {activeCriteria && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active Search Filters:</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {resultsCount} results
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6 w-6 p-0 hover:bg-green-100">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeCriteria.keywords && activeCriteria.keywords.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                  Keywords: {activeCriteria.keywords.join(", ")}
                </Badge>
              )}
              {activeCriteria.sentiment && activeCriteria.sentiment !== "any" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
                  Sentiment: {activeCriteria.sentiment}
                </Badge>
              )}
              {activeCriteria.outcome && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                  Outcome: {activeCriteria.outcome}
                </Badge>
              )}
              {activeCriteria.priority && activeCriteria.priority !== "any" && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
                  Priority: {activeCriteria.priority}
                </Badge>
              )}
              {activeCriteria.status && activeCriteria.status !== "any" && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  Status: {activeCriteria.status}
                </Badge>
              )}
              {activeCriteria.department && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-300">
                  Department: {activeCriteria.department}
                </Badge>
              )}
              {activeCriteria.callerInfo && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-300">
                  Caller: {activeCriteria.callerInfo}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Summary */}
      {query && !isProcessing && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Search: <span className="font-medium">"{query}"</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">
              {isLoading ? "Searching..." : `Found ${resultsCount} results`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
