"use client"

import * as React from "react"
import {
    ColumnDef,
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
import { Button } from "@/components/ui/button"
import { fetcher } from "@/lib/fetcher"
import { sarLogsApi } from "@/lib/api"

export default function SarLogsTable() {
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [status, setStatus] = React.useState("")
    const [pagination, setPagination] = React.useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    })

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "userName",
            header: () => <div className="text-[#2B7272]">Name</div>,
            cell: ({ row }) => <div>{row.original.user.name}</div>,
        },
        {
            accessorKey: "userName",
            header: () => <div className="text-[#2B7272]">Email</div>,
            cell: ({ row }) => <div>{row.original.user.email}</div>,
        },
        {
            accessorKey: "askedDate",
            header: () => <div className="text-[#2B7272]">Asked Date</div>,
            cell: ({ row }) => (
                <div>
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            accessorKey: "document",
            header: () => <div className="text-[#2B7272]">Document</div>,
            cell: ({ row }) => (
                <Link
                    href={row.original.doc}
                    target="_blank"
                    className="text-[#2B7272] underline"
                >
                    View
                </Link>
            ),
        },
        {
            accessorKey: "status",
            header: () => <div className="text-[#2B7272]">Status</div>,
            cell: ({ row }) => (
                <Badge variant="outline" className="rounded-2xl">
                    {row.original.status}
                </Badge>
            ),
        },
    ], [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res: any = await fetcher(sarLogsApi.getAll, {
                    method: "GET",
                    params: { page, status },
                })
                if (res?.success) {
                    setData(res.logs)
                    setPagination(res.pagination)
                }
            } finally {
                setLoading(false)
            }
        })()
    }, [page, status])

    return (
        <div className="rounded-[20px] p-6">

            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader className="bg-[#DDF3E5] text-[#2B7272]">
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="bg-white">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    {loading ? "Loading ..." : "No data available"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {pagination.total === 0
                        ? "0 of 0"
                        : `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                        )} of ${pagination.total}`}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={pagination.page <= 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
