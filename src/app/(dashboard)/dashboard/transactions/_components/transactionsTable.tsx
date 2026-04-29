"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import { transactionApi } from "@/lib/api";
import { Search, Loader2 } from "lucide-react";

interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
    type: string;
    description: string | null;
    stripeInvoiceId: string | null;
    createdAt: string;
    user?: { name: string | null; email: string };
    subscription?: { plan?: { name: string } | null } | null;
}

const STATUS_STYLES: Record<string, string> = {
    SUCCEEDED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-600",
};

export function TransactionsTable() {
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [pagination, setPagination] = React.useState({ total: 0, totalPages: 0, page: 1, limit: 10 });

    React.useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    React.useEffect(() => {
        setPage(1);
    }, [status]);

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res: any = await fetcher(transactionApi.getAdminTransactions, {
                    method: "GET",
                    params: {
                        page,
                        limit: 10,
                        status: status || undefined,
                        search: debouncedSearch || undefined,
                    },
                });
                const data = res?.data?.transactions ?? [];
                const pag = res?.data?.pagination ?? {};
                setTransactions(data);
                setPagination({
                    total: pag.total ?? 0,
                    totalPages: pag.pages ?? pag.totalPages ?? 1,
                    page: pag.page ?? page,
                    limit: pag.limit ?? 10,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [page, status, debouncedSearch]);

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "user",
            size: 160,
            header: () => <div className="text-[#2B7272]">User</div>,
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-sm truncate max-w-[140px]">{row.original.user?.name ?? "—"}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[140px]">{row.original.user?.email ?? row.original.userId}</div>
                </div>
            ),
        },
        {
            accessorKey: "plan",
            size: 130,
            header: () => <div className="text-[#2B7272]">Plan</div>,
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.subscription?.plan?.name ?? <span className="text-gray-400">—</span>}
                </div>
            ),
        },
        {
            accessorKey: "amount",
            size: 120,
            header: () => <div className="text-[#2B7272]">Amount</div>,
            cell: ({ row }) => (
                <div className="font-medium text-sm whitespace-nowrap">
                    {row.original.currency.toUpperCase()} {row.original.amount.toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "status",
            size: 120,
            header: () => <div className="text-[#2B7272]">Status</div>,
            cell: ({ row }) => (
                <Badge className={`font-rubik-400 rounded-2xl ${STATUS_STYLES[row.original.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            size: 160,
            header: () => <div className="text-[#2B7272]">Date</div>,
            cell: ({ row }) => {
                const d = new Date(row.original.createdAt);
                const dd = String(d.getDate()).padStart(2, "0");
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const yyyy = d.getFullYear();
                return (
                    <div className="whitespace-nowrap text-sm">
                        {`${dd}/${mm}/${yyyy}`} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="py-4 font-rubik-400 flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                    <Input
                        placeholder="Search by user or invoice…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 font-rubik-400 w-64 bg-white"
                    />
                </div>
                <Select value={status} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
                    <SelectTrigger className="w-44 bg-white">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL" className="font-rubik-400">All Statuses</SelectItem>
                        <SelectItem value="SUCCEEDED" className="font-rubik-400">Succeeded</SelectItem>
                        <SelectItem value="PENDING" className="font-rubik-400">Pending</SelectItem>
                        <SelectItem value="FAILED" className="font-rubik-400">Failed</SelectItem>
                        <SelectItem value="REFUNDED" className="font-rubik-400">Refunded</SelectItem>
                        <div className="border-t my-1" />
                        <div
                            className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400"
                            onClick={() => setStatus("")}
                        >
                            Clear Selection
                        </div>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[780px]">
                    <TableHeader className="bg-[#DDF3E5] font-rubik-600 text-[#2B7272]">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="divide-x divide-gray-200">
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id} style={{ width: h.column.getSize() }}>
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center font-rubik-400">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                    Loading transactions…
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center font-rubik-400">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="divide-x divide-gray-200">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="py-4 font-rubik-400 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground font-rubik-400">
                    {pagination.total === 0
                        ? "0 of 0"
                        : `${(page - 1) * pagination.limit + 1} – ${Math.min(page * pagination.limit, pagination.total)} of ${pagination.total}`}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
