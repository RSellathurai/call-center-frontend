"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Eye, MessageSquare, Download, Search, Copy, Star, RefreshCw, AlertCircle, Phone } from "lucide-react"
import type { Call } from "@/lib/types"
import { ApiService } from "@/lib/services/api-service"
import { TranscriptView } from "./transcript-view"
import { AudioPlayer } from "../audio/audio-player"
import { formatDuration } from "@/lib/utils/formatters"

interface ConversationDetailModalProps {
  call: Call
}

interface ConversationDetails {
  conversation_id: string
  agent_id: string
  agent_name: string
  status: string
  call_successful: boolean
  start_time: string
  call_duration_secs: number
  message_count: number
  transcript: Array<{
    role: string
    message: string
    time_in_call_secs?: number
  }>
  has_audio: boolean
  has_user_audio: boolean
  has_response_audio: boolean
  metadata?: any
}

interface AudioInfo {
  conversation_id: string
  has_audio: boolean
  content_type?: string
  size_bytes?: number
  filename?: string
}

interface PhoneNumber {
  phone_number: string
  description?: string
  label?: string
  provider?: string
  supports_inbound?: boolean
  supports_outbound?: boolean
  assigned_agent?: {
    agent_id: string
    agent_name: string
  }
  phone_number_id?: string
}

export function ConversationDetailModal({ call }: ConversationDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null)
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null)
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [isLoadingPhones, setIsLoadingPhones] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversation details when modal opens
  useEffect(() => {
    if (isOpen && call.id) {
      loadConversationData()
    }
  }, [isOpen, call.id])

  const loadConversationData = async () => {
    setIsLoadingDetails(true)
    setError(null)

    try {
      // Load conversation details
      const details = await ApiService.getConversationDetails(call.id) as ConversationDetails
      setConversationDetails(details)

      // Load audio info
      setIsLoadingAudio(true)
      const audio = await ApiService.getConversationAudio(call.id) as AudioInfo
      setAudioInfo(audio)

      // Load phone numbers
      setIsLoadingPhones(true)
      const phones = await ApiService.getPhoneNumbers() as PhoneNumber[]
      setPhoneNumbers(phones)

    } catch (err) {
      console.error("Failed to load conversation data:", err)
      setError("Failed to load conversation details")
    } finally {
      setIsLoadingDetails(false)
      setIsLoadingAudio(false)
      setIsLoadingPhones(false)
    }
  }

  const handleRefresh = () => {
    loadConversationData()
  }

  // Transform API transcript to component format
  const transformTranscript = (transcript: any[]) => {
    return transcript.map((msg, index) => ({
      id: index + 1,
      speaker: (msg.role === "user" ? "USER" : "AGENT") as "USER" | "AGENT",
      message: msg.message,
      timestamp: msg.time_in_call_secs || 0,
      timeInCall: formatTimeInCall(msg.time_in_call_secs || 0),
      confidence: 0.95, // Default confidence
    }))
  }

  const formatTimeInCall = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <span>Conversation with {call.callerName}</span>
              <p className="text-sm font-normal text-slate-500 mt-1">
                {new Date(call.timestamp).toLocaleString()} • {call.department}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoadingDetails}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDetails ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <Tabs defaultValue="transcript" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="mt-6 h-full">
            <div className="flex gap-6 h-[600px]">
              <div className="flex-1 min-w-0">
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">Loading transcript...</p>
                    </div>
                  </div>
                ) : conversationDetails?.transcript ? (
                  <TranscriptView messages={transformTranscript(conversationDetails.transcript)} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No transcript available</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-80 space-y-4 overflow-y-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Messages</span>
                      <span className="font-semibold">
                        {conversationDetails?.message_count || call.messages}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold">
                        {conversationDetails?.call_duration_secs 
                          ? formatDuration(conversationDetails.call_duration_secs)
                          : formatDuration(call.duration)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Response Time</span>
                      <span className="font-semibold">{call.responseTime}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{call.satisfaction}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Key Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {call.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Transcript Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Transcript
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Search className="h-4 w-4 mr-2" />
                      Search in Transcript
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            {isLoadingAudio ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">Loading audio information...</p>
                </div>
              </div>
            ) : audioInfo?.has_audio ? (
              <AudioPlayer
                audioUrl={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/conversations/${call.id}/audio`}
                conversationId={call.id}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No audio available for this conversation</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Overall Sentiment</span>
                      <Badge
                        variant={
                          call.sentiment === "positive"
                            ? "default"
                            : call.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {call.sentiment}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Positive</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Neutral</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Negative</span>
                        <span>5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Customer Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{call.satisfaction}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Response Time</span>
                      <span className="font-semibold">{call.responseTime}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Resolution</span>
                      <Badge variant={call.status === "success" ? "default" : "destructive"}>{call.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Call Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Caller</span>
                      <p className="font-semibold">{call.callerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Phone</span>
                      <p className="font-mono text-xs">{call.caller}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Location</span>
                      <p className="font-medium">{call.callerLocation}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Department</span>
                      <p className="font-medium">{call.department}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Agent</span>
                      <p className="font-medium">{conversationDetails?.agent_name || call.agent}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Call Type</span>
                      <p className="font-medium capitalize">{call.callType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Audio Size</span>
                      <p className="font-semibold">
                        {audioInfo?.size_bytes 
                          ? `${(audioInfo.size_bytes / 1024 / 1024).toFixed(1)} MB`
                          : call.audioSize
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Format</span>
                      <p className="font-mono">
                        {audioInfo?.content_type?.split('/')[1]?.toUpperCase() || 'MP3'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Quality</span>
                      <p className="font-medium">44.1kHz</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Conversation ID</span>
                      <p className="font-mono text-xs">{call.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {phoneNumbers.length > 0 && (
                <Card className="col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Available Phone Numbers</CardTitle>
                        <CardDescription className="text-xs">
                          {phoneNumbers.length} phone number{phoneNumbers.length !== 1 ? 's' : ''} configured
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPhones ? (
                      <div className="flex items-center justify-center gap-3 py-8">
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-600">Loading phone numbers...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {phoneNumbers.map((phone, index) => (
                          <div key={index} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                            <div className="flex items-start justify-between">
                              {/* Phone Number Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-mono font-semibold text-slate-900 text-sm">
                                      {phone.phone_number}
                                    </span>
                                  </div>
                                  {phone.label && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                      {phone.label}
                                    </Badge>
                                  )}
                                  {phone.provider && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                      {phone.provider}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Capabilities */}
                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                  {phone.supports_inbound && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span>Inbound</span>
                                    </div>
                                  )}
                                  {phone.supports_outbound && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span>Outbound</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Assigned Agent */}
                              {phone.assigned_agent && (
                                <div className="text-right">
                                  <div className="text-xs text-slate-500 mb-1">Assigned Agent</div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {phone.assigned_agent.agent_name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-900">
                                        {phone.assigned_agent.agent_name}
                                      </div>
                                      <div className="text-xs text-slate-500 font-mono">
                                        {phone.assigned_agent.agent_id.slice(-8)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Phone Number ID */}
                            {phone.phone_number_id && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500">Phone ID:</span>
                                  <span className="font-mono text-slate-600">
                                    {phone.phone_number_id.slice(-12)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
