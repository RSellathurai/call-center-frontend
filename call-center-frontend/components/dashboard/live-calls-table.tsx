"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Clock, MapPin, Star, Volume2, Radio, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import type { Call } from "@/lib/types"
import { getStatusColor, getSentimentColor, getPriorityGradient } from "@/lib/utils/helpers"
import { formatTimeAgo, formatDuration } from "@/lib/utils/formatters"
import { ConversationDetailModal } from "../conversation/conversation-detail-modal"

interface LiveCallsTableProps {
  calls: Call[]
  isLoading: boolean
  lastUpdated: Date | null
}

export function LiveCallsTable({ calls, isLoading, lastUpdated }: LiveCallsTableProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Calls</CardTitle>
              <CardDescription className="text-sm">Real-time incoming calls - updates every minute</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Checking for new calls...</span>
            </div>
          </div>
        )}

        {!isLoading && calls.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new calls in the last minute</p>
            <p className="text-xs mt-1">New calls will appear here automatically</p>
          </div>
        )}

        {!isLoading && calls.length > 0 && (
          <div className="space-y-0">
            {calls.map((call, index) => (
              <div
                key={call.id}
                className={`border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors ${
                  index === 0 ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Caller Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)} animate-pulse`}></div>

                    <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                      <AvatarFallback
                        className={`bg-gradient-to-r ${getPriorityGradient(call.priority)} text-white font-bold text-xs`}
                      >
                        {call.callerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{call.callerName}</h4>
                        <Badge className={`text-xs px-2 py-0.5 ${getSentimentColor(call.sentiment)} border-0`}>
                          {getSentimentIcon(call.sentiment)}
                          <span className="ml-1 capitalize">{call.sentiment}</span>
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="font-mono">{call.caller}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {call.callerLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(call.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Quick Metrics */}
                  <div className="flex items-center gap-4 mx-4">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                        {call.outcome}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900 font-mono">{formatDuration(call.duration)}</div>
                      <div className="text-xs text-slate-500">Duration</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">{call.messages}</div>
                      <div className="text-xs text-slate-500">Messages</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-slate-900">{call.satisfaction}</span>
                      </div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <ConversationDetailModal call={call} />
                  </div>
                </div>

                {/* Call Summary */}
                <div className="mt-2 ml-16">
                  <p className="text-xs text-slate-600 bg-slate-50 rounded p-2 border-l-2 border-blue-200">
                    {call.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
