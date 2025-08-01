"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Target, TrendingUp, PieChartIcon, Activity } from "lucide-react"
import type { OutcomeData } from "@/lib/types"

interface OutcomesChartProps {
  data: OutcomeData[]
}

export function OutcomesChart({ data }: OutcomesChartProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Call Outcomes</CardTitle>
                <CardDescription className="text-slate-600">Distribution of conversation results</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <Target className="h-3 w-3 mr-1" />
              0 Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-slate-500">
            No outcome data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const topOutcome = data.reduce((max, item) => (item.value > max.value ? item : max), data[0])

  // Calculate angles for pie chart
  const dataWithAngles = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0
    const angle = (item.value / total) * 360
    return {
      ...item,
      percentage: Number(percentage.toFixed(1)),
      angle,
    }
  })

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Call Outcomes</CardTitle>
              <CardDescription className="text-slate-600">Distribution of conversation results</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <Target className="h-3 w-3 mr-1" />
            {total} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <Tabs defaultValue="pie" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-3 bg-white border border-slate-200">
            <TabsTrigger value="pie" className="flex items-center gap-2 text-sm">
              <PieChartIcon className="h-3 w-3" />
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-2 text-sm">
              <Activity className="h-3 w-3" />
              Bar Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="flex-1 flex flex-col">
            {/* Custom Pie Chart */}
            <div className="flex justify-center items-center bg-white rounded-lg p-6 border border-slate-200 flex-1">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {dataWithAngles.map((item, index) => {
                    const startAngle = dataWithAngles.slice(0, index).reduce((sum, d) => sum + d.angle, 0)
                    const endAngle = startAngle + item.angle

                    const startAngleRad = (startAngle * Math.PI) / 180
                    const endAngleRad = (endAngle * Math.PI) / 180

                    const x1 = 100 + 80 * Math.cos(startAngleRad)
                    const y1 = 100 + 80 * Math.sin(startAngleRad)
                    const x2 = 100 + 80 * Math.cos(endAngleRad)
                    const y2 = 100 + 80 * Math.sin(endAngleRad)

                    const largeArcFlag = item.angle > 180 ? 1 : 0

                    return (
                      <g key={index}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={item.color}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      </g>
                    )
                  })}
                  <circle cx="100" cy="100" r="30" fill="white" />
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-slate-200">
              {dataWithAngles.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-600">
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bar" className="flex-1 flex flex-col">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-end justify-between flex-1 gap-4 min-h-0">
                {dataWithAngles.map((item, index) => {
                  const maxValue = Math.max(...dataWithAngles.map((d) => d.value))
                  const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full bg-slate-100 rounded-t-sm flex-1" style={{ minHeight: "120px" }}>
                        <div
                          className="absolute bottom-0 w-full transition-all duration-500 rounded-t-sm"
                          style={{
                            backgroundColor: item.color,
                            height: `${height}%`,
                          }}
                        />
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.value} calls
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 font-mono text-center">
                        {item.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

