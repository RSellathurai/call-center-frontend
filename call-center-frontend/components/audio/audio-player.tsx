"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, PlayCircle, Pause, Download, Share, RefreshCw } from "lucide-react"
import { formatTime } from "@/lib/utils/formatters"
import { ApiService } from "@/lib/services/api-service"

interface AudioPlayerProps {
  audioUrl: string
  conversationId: string
}

interface AudioInfo {
  conversation_id: string
  has_audio: boolean
  content_type?: string
  size_bytes?: number
  filename?: string
}

export function AudioPlayer({ audioUrl, conversationId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null)
  const [isLoadingAudioInfo, setIsLoadingAudioInfo] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch audio information from API
  useEffect(() => {
    const loadAudioInfo = async () => {
      setIsLoadingAudioInfo(true)
      setError(null)
      
      try {
        const audioData = await ApiService.getConversationAudio(conversationId) as AudioInfo
        setAudioInfo(audioData)
        console.log(`Audio info for ${conversationId}:`, audioData)
      } catch (err) {
        console.error("Failed to load audio info:", err)
        setError("Failed to load audio information")
      } finally {
        setIsLoadingAudioInfo(false)
      }
    }

    if (conversationId) {
      loadAudioInfo()
    }
  }, [conversationId])

  // Construct the actual audio URL based on API data
  const getActualAudioUrl = () => {
    if (!audioInfo?.has_audio) {
      return null
    }
    
    // Use the API endpoint to get the audio file
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseUrl}/api/conversations/${conversationId}/audio/file`
  }

  const actualAudioUrl = getActualAudioUrl()
  const hasRealAudio = audioInfo?.has_audio || false

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      audio.volume = volume
      audio.playbackRate = playbackRate
    }
  }, [volume, playbackRate])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      setError(null)

      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)

        if (audioRef.current.readyState < 2) {
          await new Promise((resolve, reject) => {
            const audio = audioRef.current!

            const onCanPlay = () => {
              audio.removeEventListener("canplay", onCanPlay)
              audio.removeEventListener("error", onError)
              resolve(void 0)
            }

            const onError = (e: Event) => {
              audio.removeEventListener("canplay", onCanPlay)
              audio.removeEventListener("error", onError)
              reject(new Error("Failed to load audio"))
            }

            audio.addEventListener("canplay", onCanPlay)
            audio.addEventListener("error", onError)
            audio.load()
          })
        }

        await audioRef.current.play()
        setIsPlaying(true)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Audio playback error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown audio error"
      setError(`Playback failed: ${errorMessage}`)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio loading error:", e)
    const target = e.currentTarget as HTMLAudioElement
    let errorMessage = "Audio file could not be loaded"

    if (target && target.error) {
      switch (target.error.code) {
        case target.error.MEDIA_ERR_ABORTED:
          errorMessage = "Audio loading was aborted"
          break
        case target.error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio"
          break
        case target.error.MEDIA_ERR_DECODE:
          errorMessage = "Audio file is corrupted or unsupported"
          break
        case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported"
          break
        default:
          errorMessage = "Unknown audio error"
      }
    }

    setError(errorMessage)
    setIsLoading(false)
    setIsPlaying(false)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleDownload = async () => {
    if (!hasRealAudio || !actualAudioUrl) {
      setError("No audio available for download")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(actualAudioUrl)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = audioInfo?.filename || `conversation_${conversationId}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log("Audio downloaded successfully")
    } catch (err) {
      console.error("Download failed:", err)
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    // Reload audio info
    const loadAudioInfo = async () => {
      setIsLoadingAudioInfo(true)
      setError(null)
      
      try {
        const audioData = await ApiService.getConversationAudio(conversationId) as AudioInfo
        setAudioInfo(audioData)
      } catch (err) {
        console.error("Failed to reload audio info:", err)
        setError("Failed to reload audio information")
      } finally {
        setIsLoadingAudioInfo(false)
      }
    }

    loadAudioInfo()
  }

  if (isLoadingAudioInfo) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Volume2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Audio Recording</h4>
              <p className="text-sm text-slate-500">Loading audio information...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 space-y-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Volume2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Audio Recording</h4>
            <p className="text-sm text-slate-500">
              Conversation {conversationId.slice(-8)}...
              {audioInfo && (
                <span className="text-blue-500 ml-2">
                  ({audioInfo.content_type?.split('/')[1]?.toUpperCase() || 'AUDIO'})
                </span>
              )}
            </p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {formatTime(duration)}
          </Badge>
          {hasRealAudio && (
            <Select
              value={playbackRate.toString()}
              onValueChange={(value) => changePlaybackRate(Number.parseFloat(value))}
            >
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasRealAudio && actualAudioUrl ? (
        <>
          <audio
            ref={audioRef}
            src={actualAudioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={handleError}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
            crossOrigin="anonymous"
          />

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                disabled={isLoading || !!error}
                className="flex-shrink-0 bg-white hover:bg-slate-50 border-slate-300"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="ml-2 text-sm">Pause</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    <span className="ml-2 text-sm">Play</span>
                  </>
                )}
              </Button>

              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={!duration || !!error}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background:
                        duration > 0
                          ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%, #e2e8f0 100%)`
                          : "#e2e8f0",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number.parseFloat(e.target.value))}
                  className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isLoading || !hasRealAudio}>
                  {isLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Volume2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Audio not available for this conversation</p>
          <p className="text-xs mt-1">
            {audioInfo ? "This conversation doesn't have audio recording" : "Failed to load audio information"}
          </p>
        </div>
      )}
    </div>
  )
}
