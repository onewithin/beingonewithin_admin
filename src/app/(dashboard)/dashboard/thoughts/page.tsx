"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { thoughtsApi } from "@/lib/api"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { thoughtColumns } from "@/lib/coulmns/thoughtOfTheDay"


export default function ThoughtOfTheDayTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [status, setStatus] = React.useState<string>('')
    const [search, setSearch] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [pagination, setPagination] = React.useState<any>({
        total: 0,
        page: 0,
        limit: 10,
        totalPages: 0,
    })
    const [sortValue, setSortValue] = React.useState<any>({
        field: '',
        order: 'desc'
    })

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const extendedColumns = React.useMemo(() => [
        ...thoughtColumns,
        {
            accessorKey: "action",
            size: 80,
            header: () => <div className="text-[#2B7272]">Action</div>,
            cell: ({ row }) => (
                <div className="capitalize cursor-pointer">
                    <Badge variant="outline" className="text-rubik-400 rounded-2xl">
                        <span className="text-[14px] font-light">
                            <Link href={`/dashboard/thoughts/${row.original.id}`}>View</Link>
                        </span>
                    </Badge>
                </div>
            ),
        },
    ], [thoughtColumns, data])

    const table = useReactTable({
        data,
        columns: extendedColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleSort = (value: string) => {
        const [field, order] = value.split("-")
        setSortValue({ field, order })
        setPage(1)
    }

    const handleSortClear = () => {
        setSortValue({ field: '', order: 'desc' })
    }

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res: any = await fetcher(thoughtsApi.getAll, {
                    method: 'GET',
                    params: {
                        page,
                        status: status || undefined,
                        search: debouncedSearch || undefined,
                        order: sortValue.order,
                        sort: sortValue.field,
                    }
                })
                if (res?.success) {
                    setData(res.thoughts.data)
                    setPagination(res.thoughts.pagination)
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setLoading(false)
            }
        })()
    }, [page, status, debouncedSearch, sortValue.field, sortValue.order])

    return (
        <div className="p-6">
            {/* Page heading */}
            <div className="mb-1">
                <h1 className="text-xl font-extrabold text-[#2B7272] font-rubik-400">Thoughts of the Day</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">Manage and browse all thought of the day content.</p>
            </div>

            {/* Toolbar */}
            <div className="py-4 font-rubik-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                        <Input
                            placeholder="Search title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 font-rubik-400 w-full bg-white"
                        />
                    </div>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                        <SelectTrigger className="w-full sm:w-44 bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING" className="font-rubik-400">Scheduled</SelectItem>
                            <SelectItem value="POSTED" className="font-rubik-400">Posted</SelectItem>
                            <div className="border-t my-1" />
                            <div
                                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400"
                                onClick={() => { setStatus(''); setPage(1) }}
                            >
                                Clear Selection
                            </div>
                        </SelectContent>
                    </Select>
                    <Select value={sortValue?.field ? `${sortValue.field}-${sortValue.order}` : ""} onValueChange={handleSort}>
                        <SelectTrigger className="w-full sm:w-44 bg-white">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <div className="px-2 py-1">
                                <p className="text-sm text-gray-500 px-2 font-rubik-400">Created At</p>
                                <SelectItem value="createdAt-asc" className="font-rubik-400 pl-6">Ascending</SelectItem>
                                <SelectItem value="createdAt-desc" className="font-rubik-400 pl-6">Descending</SelectItem>
                            </div> */}
                            <div className="px-2 py-1">
                                <p className="text-sm text-gray-500 px-2 font-rubik-400">Scheduled At</p>
                                <SelectItem value="scheduledAt-asc" className="font-rubik-400 pl-6">Ascending</SelectItem>
                                <SelectItem value="scheduledAt-desc" className="font-rubik-400 pl-6">Descending</SelectItem>
                            </div>
                            <div className="border-t border-gray-200 my-1" />
                            <div
                                className="cursor-pointer px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md font-rubik-400"
                                onClick={handleSortClear}
                            >
                                Clear Selection
                            </div>
                        </SelectContent>
                    </Select>
                </div>
                <Button className="font-rubik-400 bg-[#2B7272] py-3 text-white hover:bg-[#1f5d57] w-full md:w-auto">
                    <Link href="/dashboard/thoughts/add">Add Thought</Link>
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-[#DDF3E5] font-rubik-600 text-[#2B7272]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="divide-x divide-gray-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="bg-white divide-x divide-gray-200">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="py-4 font-rubik-400 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={extendedColumns.length} className="h-24 text-center font-rubik-400">
                                    {loading ? "Loading..." : "No data available"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground font-rubik-400">
                    {pagination.total === 0
                        ? '0 of 0'
                        : `${(pagination.page - 1) * pagination.limit + 1} – ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => setPage(prev => prev - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
