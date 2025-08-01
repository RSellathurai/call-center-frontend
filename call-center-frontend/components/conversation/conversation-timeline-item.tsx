"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Phone,
  Clock,
  MapPin,
  Star,
  Volume2,
  ChevronRight,
  MoreVertical,
  Copy,
  Download,
  Share,
  Bot,
  AlertCircle,
  MessageSquare,
  Brain,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import type { Call } from "@/lib/types"
import { getStatusColor, getSentimentColor, getPriorityGradient } from "@/lib/utils/helpers"
import { formatTimeAgo, formatDuration } from "@/lib/utils/formatters"
import { ConversationDetailModal } from "./conversation-detail-modal"

interface ConversationTimelineItemProps {
  call: Call
  index: number
  isSelected: boolean
  onSelect: (selected: boolean) => void
}

export function ConversationTimelineItem({ call, index, isSelected, onSelect }: ConversationTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showWaveform, setShowWaveform] = useState(false)

  const waveformData = Array.from({ length: 50 }, () => Math.random() * 100)

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4" />
      case "negative":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div
      className={`group relative border-b border-slate-100 transition-all duration-300 ${
        isHovered ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50" : "hover:bg-slate-50/50"
      } ${isSelected ? "bg-blue-50 border-blue-200" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline Connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>

      {/* Timeline Dot with Status */}
      <div
        className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getStatusColor(call.status)} z-10`}
      >
        <div className={`absolute inset-0 rounded-full ${getStatusColor(call.status)} animate-ping opacity-20`}></div>
      </div>

      <div className="pl-12 pr-6 py-4">
        {/* Main Content Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Caller Info */}
          <div className="flex items-center gap-4 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className={`transition-opacity ${isHovered ? "opacity-100" : "opacity-60"}`}
            />

            <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
              <AvatarFallback
                className={`bg-gradient-to-r ${getPriorityGradient(call.priority)} text-white font-bold text-sm`}
              >
                {call.callerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-slate-900 text-lg">{call.callerName}</h3>
                {call.isBookmarked && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                <Badge className={`text-xs px-2 py-1 ${getSentimentColor(call.sentiment)} border-0`}>
                  {getSentimentIcon(call.sentiment)}
                  <span className="ml-1 capitalize">{call.sentiment}</span>
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600">
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
          <div className="flex items-center gap-6 mx-6">
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                {call.outcome}
              </div>
              <div className="text-xs text-slate-500 mt-1">Outcome</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-slate-900 font-mono">{formatDuration(call.duration)}</div>
              <div className="text-xs text-slate-500">Duration</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{call.messages}</div>
              <div className="text-xs text-slate-500">Messages</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-slate-900">{call.satisfaction}</span>
              </div>
              <div className="text-xs text-slate-500">Rating</div>
            </div>
          </div>

          {/* Right: Actions and Status */}
          <div className="flex items-center gap-3">
            {/* Always visible action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowWaveform(!showWaveform)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>

              <ConversationDetailModal call={call} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download Audio
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Conversation Summary */}
        <div className="mb-3">
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border-l-4 border-blue-200">
            {call.summary}
          </p>
        </div>

        {/* Tags and Department */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
              <Bot className="h-3 w-3 mr-1" />
              {call.agent}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
              {call.department}
            </Badge>
            {call.tags.slice(0, 3).map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                #{tag}
              </Badge>
            ))}
            {call.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                +{call.tags.length - 3} more
              </Badge>
            )}
          </div>

          {call.hasFollowUp && (
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Follow-up Required
            </Badge>
          )}
        </div>

        {/* Audio Waveform Visualization */}
        {showWaveform && (
          <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-600" />
                Audio Waveform - {call.audioSize}
              </h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-end gap-1 h-16">
              {waveformData.map((height, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-400 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    width: "100%",
                    maxWidth: "4px",
                    minHeight: "2px",
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 space-y-4">
            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm font-medium text-slate-600">Response Time</div>
                <div className="text-lg font-bold text-slate-900">{call.responseTime}s</div>
                <div className="text-xs text-green-600">Excellent</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm font-medium text-slate-600">Call Type</div>
                <div className="text-lg font-bold text-slate-900 capitalize">{call.callType}</div>
                <div className="text-xs text-blue-600">Standard</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm font-medium text-slate-600">Priority</div>
                <div
                  className={`text-lg font-bold capitalize ${
                    call.priority === "high"
                      ? "text-red-600"
                      : call.priority === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {call.priority}
                </div>
                <div className="text-xs text-slate-500">Level</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-sm font-medium text-slate-600">Satisfaction</div>
                <div className="text-lg font-bold text-slate-900">{call.satisfaction}/5</div>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(call.satisfaction) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                AI Analysis
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Key Topics:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {call.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Conversation Flow:</span>
                  <div className="mt-1 text-slate-700">
                    {call.status === "success" ? "Smooth progression to resolution" : "Interrupted before completion"}
                  </div>
                </div>
              </div>
            </div>

            {/* Last Message Preview */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-900">Last Message</span>
              </div>
              <p className="text-sm text-slate-700 italic">"{call.lastMessage}"</p>
            </div>
          </div>
        )}
      </div>
      {call.hasRealAudio && (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
          <Volume2 className="h-3 w-3 mr-1" />
          Live Audio
        </Badge>
      )}
    </div>
  )
}
