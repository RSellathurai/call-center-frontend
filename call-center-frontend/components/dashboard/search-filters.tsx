"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, SortDesc } from "lucide-react"

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  outcomeFilter: string
  onOutcomeChange: (value: string) => void
  sortOrder: string
  onSortOrderChange: () => void
  resultsCount: number
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  outcomeFilter,
  onOutcomeChange,
  sortOrder,
  onSortOrderChange,
  resultsCount,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-4 flex-1 w-full lg:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations, callers, outcomes, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="text-xs">
                {resultsCount} results
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-32 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={onOutcomeChange}>
          <SelectTrigger className="w-40 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="appointment">Appointments</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="information">Information</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={onSortOrderChange} className="bg-slate-50 border-slate-200">
          <SortDesc className={`h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""} transition-transform`} />
        </Button>
      </div>
    </div>
  )
}
