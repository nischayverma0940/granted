import React, { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type Column<T> = {
    key: keyof T
    label: string
    sortable?: boolean
    format?: (val: any, row: T) => React.ReactNode
    className?: string
}

export type Filter<T> = {
    key: string
    label?: string
    type: "text" | "number" | "date" | "select"
    options?: string[]
    placeholder?: string
    filterFn?: (row: T, value: string) => boolean
}

type DataTableProps<T> = {
    data: T[]
    columns: Column<T>[]
    filters?: Filter<T>[]
    defaultSort?: keyof T
    title?: string
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    filters = [],
    defaultSort,
    title,
}: DataTableProps<T>) {
    const [filterValues, setFilterValues] = useState<Record<string, string>>(
        Object.fromEntries(filters.map(f => [f.key, ""]))
    )

    const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: "asc" | "desc" }>({
        key: defaultSort || null,
        direction: "asc",
    })

    const updateFilter = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const requestSort = (key: keyof T) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key ? (prev.direction === "asc" ? "desc" : "asc") : "asc",
        }))
    }

    const processed = useMemo(() => {
        let filtered = data.filter(row => {
            return filters.every(f => {
                const fv = filterValues[f.key]
                if (!fv) return true

                if (f.filterFn) {
                    return f.filterFn(row, fv)
                }

                const val = row[f.key as keyof T]
                
                if (f.type === "text") return String(val).toLowerCase().includes(fv.toLowerCase())
                if (f.type === "number") return val >= +fv
                if (f.type === "date") return new Date(val) >= new Date(fv)
                if (f.type === "select") return fv === "all" || val === fv

                return true
            })
        })

        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key!]
                const bVal = b[sortConfig.key!]

                if (aVal instanceof Date && bVal instanceof Date)
                    return sortConfig.direction === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime()
                if (typeof aVal === "number" && typeof bVal === "number")
                    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal
                return sortConfig.direction === "asc"
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal))
            })
        }

        return filtered
    }, [data, filterValues, sortConfig, filters])

    const arrow = (key: keyof T) => (sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : "")

    const isRangeFilter = (key: string) => 
        key.endsWith("Min") || key.endsWith("Max") || key === "dateFrom" || key === "dateTo"

    return (
        <div className="w-full px-6 py-4">
            {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}

            {filters.length > 0 && (
                <>
                    {/* First row: text & select filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-2">
                        {filters
                            .filter(f => !isRangeFilter(f.key))
                            .map(f => (
                                <div key={f.key}>
                                    <label className="text-sm font-medium block mb-2">{f.label || f.key}</label>
                                    {f.type === "text" && (
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                className="pl-8"
                                                placeholder={f.placeholder}
                                                value={filterValues[f.key]}
                                                onChange={e => updateFilter(f.key, e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {f.type === "select" && (
                                        <Select
                                            value={filterValues[f.key] || "all"}
                                            onValueChange={v => updateFilter(f.key, v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                {f.options?.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Second row: range filters */}
                    {filters.some(f => isRangeFilter(f.key)) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-4">
                            {filters
                                .filter(f => isRangeFilter(f.key))
                                .map(f => (
                                    <div key={f.key}>
                                        <label className="text-sm font-medium block mb-2">{f.label || f.key}</label>
                                        {f.type === "number" && (
                                            <Input
                                                type="number"
                                                placeholder={f.placeholder}
                                                value={filterValues[f.key]}
                                                onChange={e => updateFilter(f.key, e.target.value)}
                                            />
                                        )}
                                        {f.type === "date" && (
                                            <Input
                                                type="date"
                                                value={filterValues[f.key]}
                                                onChange={e => updateFilter(f.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>S.No</TableHead>
                        {columns.map(col => (
                            <TableHead
                                key={col.key as string}
                                onClick={col.sortable ? () => requestSort(col.key) : undefined}
                                className={`${col.sortable ? "cursor-pointer" : ""} ${col.className || ""}`}
                            >
                                {col.label}
                                {col.sortable && arrow(col.key)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processed.length ? (
                        processed.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                {columns.map(col => (
                                    <TableCell key={col.key as string} className={col.className}>
                                        {col.format ? col.format(row[col.key], row) : row[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="text-center py-4 text-gray-500">
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex flex-row items-end justify-end w-full text-xs my-4">
                <b>{processed.length}</b>&nbsp;result(s) found
            </div>
        </div>
    )
}