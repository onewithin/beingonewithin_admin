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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { meditationApis, categoryApi } from "@/lib/api"
import { fetcher } from "@/lib/fetcher"
import { mediationColumns } from "@/lib/coulmns/meditation.columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"


export default function MeditationTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [pagination, setPagination] = React.useState<any>({
        "total": 0,
        "page": 0,
        "limit": 10,
        "totalPages": 0
    })
    const [sortValue, setSortValue] = React.useState<any>({
        field: '',
        order: 'desc'
    })
    const [search, setSearch] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [isPremium, setIsPremium] = React.useState<string>('')
    const [categoryId, setCategoryId] = React.useState<string>('')
    const [categories, setCategories] = React.useState<any[]>([])
    const [categoryOpen, setCategoryOpen] = React.useState(false)
    const [categorySearch, setCategorySearch] = React.useState('')

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    React.useEffect(() => {
        fetcher(categoryApi.getAll, { method: 'GET' })
            .then((res: any) => { if (res) setCategories(res.data ?? res) })
            .catch(() => { })
    }, [])

    const extendedColumns = React.useMemo(() => [
        ...mediationColumns,
        {
            accessorKey: "action",
            size: 80,
            header: () => (
                <div className="text-[#2B7272]">Action</div>
            ),
            cell: ({ row }) => <div className="capitalize cursor-pointer"><Badge variant={"outline"} className="text-rubik-400 rounded-2xl"><span className="text-[14px] font-light"><Link href={`/dashboard/meditation/${row.original.id}`}>View</Link></span></Badge></div>,
        },
    ], [mediationColumns, data]);

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
                const res: any = await fetcher(meditationApis.create, {
                    method: 'GET',
                    params: {
                        limit: 10,
                        order: sortValue.order,
                        sort: sortValue.field,
                        page: page,
                        search: debouncedSearch || undefined,
                        isPremium: isPremium !== '' ? isPremium : undefined,
                        categoryId: categoryId || undefined,
                    }
                });
                if (res) {
                    setData(res.data)
                    setPagination(res.pagination)
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false)
            }
        })();
    }, [page, sortValue.field, sortValue.order, debouncedSearch, isPremium, categoryId])

    return (
        <div className="p-6">
            {/* Page heading */}
            <div className="mb-1">
                <h1 className="text-xl font-extrabold text-[#2B7272] font-rubik-400">Meditations</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">Manage and browse all meditation content.</p>
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
                    <Select value={isPremium} onValueChange={(v) => { setIsPremium(v); setPage(1) }}>
                        <SelectTrigger className="w-full sm:w-44 bg-white">
                            <SelectValue placeholder="Access" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="false" className="font-rubik-400">Free</SelectItem>
                            <SelectItem value="true" className="font-rubik-400">Premium</SelectItem>
                            <div className="border-t my-1" />
                            <div
                                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400"
                                onClick={() => { setIsPremium(''); setPage(1) }}
                            >
                                Clear Selection
                            </div>
                        </SelectContent>
                    </Select>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={categoryOpen}
                                className="w-full sm:w-44 bg-white justify-between font-rubik-400 font-normal"
                            >
                                <span className="truncate">
                                    {categoryId
                                        ? categories.find((c) => c.id === categoryId)?.name
                                        : "Category"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-0">
                            <Command>
                                <CommandInput
                                    placeholder="Search category..."
                                    value={categorySearch}
                                    onValueChange={setCategorySearch}
                                    className="font-rubik-400"
                                />
                                <CommandList>
                                    <CommandEmpty className="py-3 text-center text-sm font-rubik-400">No category found.</CommandEmpty>
                                    <CommandGroup>
                                        {categories
                                            .filter((c) =>
                                                c.name.toLowerCase().includes(categorySearch.toLowerCase())
                                            )
                                            .map((cat: any) => (
                                                <CommandItem
                                                    key={cat.id}
                                                    value={cat.id}
                                                    onSelect={() => {
                                                        setCategoryId(cat.id === categoryId ? '' : cat.id)
                                                        setPage(1)
                                                        setCategoryOpen(false)
                                                        setCategorySearch('')
                                                    }}
                                                    className="capitalize font-rubik-400"
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", categoryId === cat.id ? "opacity-100" : "opacity-0")} />
                                                    {cat.name}
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                    {categoryId && (
                                        <>
                                            <div className="border-t border-gray-200" />
                                            <div
                                                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400"
                                                onClick={() => { setCategoryId(''); setPage(1); setCategoryOpen(false); setCategorySearch('') }}
                                            >
                                                Clear Selection
                                            </div>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <Select value={sortValue?.field ? `${sortValue.field}-${sortValue.order}` : ""} onValueChange={handleSort}>
                        <SelectTrigger className="w-full sm:w-44 bg-white">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="px-2 py-1">
                                <p className="text-sm text-gray-500 px-2 font-rubik-400">Added Date</p>
                                <SelectItem value="createdAt-asc" className="font-rubik-400 pl-6">Ascending</SelectItem>
                                <SelectItem value="createdAt-desc" className="font-rubik-400 pl-6">Descending</SelectItem>
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
                    <Link href="/dashboard/meditation/add">Add Meditation</Link>
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[900px]">
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
