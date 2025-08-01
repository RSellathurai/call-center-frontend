import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import type { PerformanceMetric } from "@/lib/types"

interface PerformanceMetricsProps {
  data: PerformanceMetric[]
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Performance Metrics</CardTitle>
                <CardDescription className="text-slate-600">Key performance indicators vs targets</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
              <Target className="h-3 w-3 mr-1" />0 KPIs Tracked
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            No performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (value: number, target: number) => {
    if (value >= target) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value >= target * 0.8) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getStatusColor = (value: number, target: number) => {
    if (value >= target) return "bg-green-50 border-green-200 text-green-700"
    if (value >= target * 0.8) return "bg-yellow-50 border-yellow-200 text-yellow-700"
    return "bg-red-50 border-red-200 text-red-700"
  }

  const getProgressColor = (value: number, target: number) => {
    if (value >= target) return "bg-green-500"
    if (value >= target * 0.8) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Performance Metrics</CardTitle>
              <CardDescription className="text-slate-600">Key performance indicators vs targets</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
            <Target className="h-3 w-3 mr-1" />4 KPIs Tracked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((metric, index) => {
            const percentage = (metric.value / metric.target) * 100
            const isOnTrack = metric.value >= metric.target
            const isWarning = metric.value >= metric.target * 0.8 && metric.value < metric.target

            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.value, metric.target)}
                    <h3 className="font-semibold text-slate-900">{metric.metric}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(metric.value, metric.target)} border font-medium`}
                  >
                    {isOnTrack ? "On Track" : isWarning ? "Warning" : "Below Target"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
                      <span className="text-sm text-slate-500 ml-2">
                        {metric.metric.includes("Rate") || metric.metric.includes("Conversion")
                          ? "%"
                          : metric.metric.includes("Time")
                            ? "s"
                            : ""}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Target</div>
                      <div className="font-semibold text-slate-900">{metric.target}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(percentage, 100)} className="h-3 bg-slate-200" />
                      <div
                        className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(metric.value, metric.target)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span className="font-medium">Target: {metric.target}</span>
                    <span>{Math.max(metric.target * 1.2, metric.value * 1.1).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-green-600">{data.filter((m) => m.value >= m.target).length}</div>
            <div className="text-sm text-slate-600">Metrics On Track</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-yellow-600">
              {data.filter((m) => m.value >= m.target * 0.8 && m.value < m.target).length}
            </div>
            <div className="text-sm text-slate-600">Needs Attention</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-red-600">{data.filter((m) => m.value < m.target * 0.8).length}</div>
            <div className="text-sm text-slate-600">Below Target</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
