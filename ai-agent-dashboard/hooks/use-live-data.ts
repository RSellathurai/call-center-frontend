"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { fetchNewCalls } from "@/lib/services/live-data-service"
import type { Call } from "@/lib/types"

export function useLiveData() {
  const [liveCalls, setLiveCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [consecutiveEmptyFetches, setConsecutiveEmptyFetches] = useState(0)
  
  // Use ref to track if a fetch is in progress
  const isFetchingRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (!isEnabled || isFetchingRef.current) return

    // Set fetching flag to prevent concurrent calls
    isFetchingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const newCalls = await fetchNewCalls(lastFetchTime)

      if (newCalls.length > 0) {
        // Add new calls to the beginning of the list
        setLiveCalls((prev) => {
          const combined = [...newCalls, ...prev]
          // Keep only the last 20 calls to prevent memory issues
          return combined.slice(0, 20)
        })
        
        // Reset consecutive empty fetches when we find new calls
        setConsecutiveEmptyFetches(0)
        
        // Only update lastFetchTime if we found new calls or this is the first fetch
        if (!hasInitialized) {
          setLastFetchTime(new Date())
        }
      } else {
        // Increment consecutive empty fetches
        setConsecutiveEmptyFetches(prev => prev + 1)
        
        // If we've had 3 consecutive empty fetches, pause live updates
        if (consecutiveEmptyFetches >= 2 && hasInitialized) {
          console.log("🔄 Live Data: Pausing live updates due to no new calls")
          setIsEnabled(false)
        }
      }
      
      setLastUpdated(new Date())
      setHasInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch new calls")
      console.error("Error fetching live data:", err)
    } finally {
      setIsLoading(false)
      // Clear fetching flag after completion
      isFetchingRef.current = false
    }
  }, [lastFetchTime, isEnabled, hasInitialized, consecutiveEmptyFetches])

  // Set up polling interval
  useEffect(() => {
    if (!isEnabled) return

    // Initial fetch
    fetchData()

    // Set up interval for every 5 minutes (300000ms)
    const interval = setInterval(() => {
      // Only fetch if not currently fetching and we've initialized
      if (!isFetchingRef.current && hasInitialized) {
        fetchData()
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchData, isEnabled, hasInitialized])

  const toggleLiveUpdates = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  const clearLiveCalls = useCallback(() => {
    setLiveCalls([])
  }, [])

  const manualRefresh = useCallback(() => {
    // Only allow manual refresh if not currently fetching
    if (!isFetchingRef.current) {
      fetchData()
    }
  }, [fetchData])

  return {
    liveCalls,
    isLoading,
    lastUpdated,
    error,
    isEnabled,
    toggleLiveUpdates,
    clearLiveCalls,
    manualRefresh,
  }
}
