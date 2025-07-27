import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Bot } from "lucide-react"
import type { TranscriptMessage } from "@/lib/types"

interface TranscriptViewProps {
  messages: TranscriptMessage[]
}

export function TranscriptView({ messages }: TranscriptViewProps) {
  const avgConfidence = Math.round((messages.reduce((acc, msg) => acc + msg.confidence, 0) / messages.length) * 100)

  return (
    <div className="h-full flex flex-col border rounded-lg bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b bg-slate-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Conversation Transcript</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
            <Badge variant="outline" className="text-xs">
              {messages[messages.length - 1]?.timeInCall || "0:00"} duration
            </Badge>
          </div>
        </div>
      </div>

      {/* Scrollable Content - This should take up remaining space */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {messages.map((message, index) => (
              <div key={message.id} className={`flex gap-3 ${message.speaker === "USER" ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback
                    className={message.speaker === "USER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
                  >
                    {message.speaker === "USER" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-[80%] ${message.speaker === "USER" ? "text-right" : ""}`}>
                  <div className={`flex items-center gap-2 mb-2 ${message.speaker === "USER" ? "justify-end" : ""}`}>
                    <span className="text-sm font-semibold text-slate-700">{message.speaker}</span>
                    <span className="text-xs text-slate-500 font-mono">{message.timeInCall}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(message.confidence * 100)}%
                    </Badge>
                  </div>
                  <div
                    className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                      message.speaker === "USER"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 p-3 border-t bg-slate-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing all {messages.length} messages • Scroll to navigate</span>
          <span>Confidence: {avgConfidence}% avg</span>
        </div>
      </div>
    </div>
  )
}
