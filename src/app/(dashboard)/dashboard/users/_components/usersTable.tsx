"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
import { fetcher } from "@/lib/fetcher"
import { apiUser } from "@/lib/api"
import { columns, User } from "@/lib/coulmns/user.columns"
import UserDetails from "./userDetails"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"


export function DataTableDemo() {
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<Record<string, any> | null>(null);
    const [search, setSearch] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [signupMethod, setSignupMethod] = React.useState<string>('')
    const [subscriptionType, setSubscriptionType] = React.useState<string>('')
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

    const handleChangeSubscription = (val: string) => {
        setSubscriptionType(val)
    }

    const handleClearSubscription = () => {
        setSubscriptionType('')
    }

    const handleChange = (value: string) => {
        setSignupMethod(value)
    }

    const handleClear = () => {
        setSignupMethod('')
    }


    const handleSort = (value: string) => {
        const [field, order] = value.split("-")
        setSortValue({
            field,
            order
        })
    }

    const handleSortClear = () => {
        setSortValue({
            field: '',
            order: 'desc'
        })
    }

    // Debounce search — wait 400ms after user stops typing before hitting the API
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    // Reset page to 1 whenever a filter changes
    React.useEffect(() => {
        setPage(1)
    }, [signupMethod, subscriptionType, sortValue.field, sortValue.order])

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res: any = await fetcher(apiUser.getUser, {
                    method: 'GET',
                    params: {
                        order: sortValue.order,
                        sort: sortValue.field,
                        subscriptionType: subscriptionType,
                        signupMethod,
                        page,
                        search: debouncedSearch || undefined,
                    }
                });
                if (res && res?.success) {
                    setUsers(res.users.data)
                    setPagination(res.users.pagination)
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false)
            }
        })();
    }, [signupMethod, subscriptionType, sortValue.field, sortValue.order, page, debouncedSearch])

    const extendedColumns = React.useMemo(() => [
        ...columns,
        {
            accessorKey: "action",
            size: 80,
            header: () => (
                <div className="text-[#2B7272]">Action</div>
            ),
            cell: ({ row }) => (
                <div className="capitalize cursor-pointer">
                    <Badge variant="outline" className="text-rubik-400 rounded-2xl" onClick={() => setSelectedUser(row.original)}>
                        <span className="text-[14px] font-light">View</span>
                    </Badge>
                </div>
            ),
        },
    ], [columns, users]);



    const table = useReactTable({
        data: users,
        columns: extendedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const handleAction = (id: string, status: boolean) => {
        setUsers((prev: any[]) =>
            prev.map((item: any) =>
                item.id === id ? { ...item, active: status } : item
            )
        );

    }


    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="py-4 font-rubik-400 flex flex-col md:flex-row md:items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                    <Input
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 font-rubik-400 w-64 bg-white"
                    />
                </div>
                <Select value={signupMethod} onValueChange={handleChange}>
                    <SelectTrigger className="w-44 bg-white">
                        <SelectValue placeholder="Signup Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="email" className="font-rubik-400">Email</SelectItem>
                        <SelectItem value="google" className="font-rubik-400">Google</SelectItem>
                        <div className="border-t my-1" />
                        <div className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400" onClick={handleClear}>
                            Clear Selection
                        </div>
                    </SelectContent>
                </Select>

                <Select value={subscriptionType} onValueChange={handleChangeSubscription}>
                    <SelectTrigger className="w-44 bg-white">
                        <SelectValue placeholder="Subscription" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="free" className="font-rubik-400">Free</SelectItem>
                        <SelectItem value="premium" className="font-rubik-400">Premium</SelectItem>
                        <div className="border-t my-1" />
                        <div className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400" onClick={handleClearSubscription}>
                            Clear Selection
                        </div>
                    </SelectContent>
                </Select>

                <Select value={sortValue?.field ? `${sortValue.field}-${sortValue.order}` : ""} onValueChange={handleSort}>
                    <SelectTrigger className="w-44 bg-white">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="px-2 py-1">
                            <p className="text-sm text-gray-500 px-2 font-rubik-400">Created At</p>
                            <SelectItem value="createdAt-asc" className="font-rubik-400 pl-6">Ascending</SelectItem>
                            <SelectItem value="createdAt-desc" className="font-rubik-400 pl-6">Descending</SelectItem>
                        </div>
                        <div className="border-t border-gray-200 my-1" />
                        <div className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-rubik-400 select-none" onClick={handleSortClear}>
                            Clear Selection
                        </div>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[780px]">
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
                                <TableRow key={row.id} className="divide-x divide-gray-200">
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

            <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} handleAction={handleAction} />
        </div>
    )
}
