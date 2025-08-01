"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Brain } from "lucide-react"
import { testAIConnection } from "@/lib/services/search-service"

export function AIConnectionTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [lastTested, setLastTested] = useState<Date | null>(null)

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const isConnected = await testAIConnection()
      setConnectionStatus(isConnected)
      setLastTested(new Date())
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus(false)
      setLastTested(new Date())
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" />
          AI Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connectionStatus === null ? (
              <Badge variant="outline" className="bg-slate-50">
                Not Tested
              </Badge>
            ) : connectionStatus ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="h-7 bg-transparent"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>
        {lastTested && <p className="text-xs text-slate-500">Last tested: {lastTested.toLocaleTimeString()}</p>}
      </CardContent>
    </Card>
  )
}
