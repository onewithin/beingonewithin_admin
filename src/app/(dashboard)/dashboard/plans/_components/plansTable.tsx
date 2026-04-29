"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import { subscriptionApi } from "@/lib/api";
import { PlanDetails } from "./planDetails";
import { Plus, Loader2, Search } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    intervalCount: number;
    trialDays: number | null;
    stripePriceId: string | null;
    visible: boolean;
    createdAt: string;
}

const emptyPlan = {
    name: "",
    price: "",
    currency: "usd",
    interval: "month",
    intervalCount: "1",
    trialDays: "",
};

export function PlansTable() {
    const [plans, setPlans] = React.useState<Plan[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editPlan, setEditPlan] = React.useState<Plan | null>(null);
    const [form, setForm] = React.useState(emptyPlan);
    const [search, setSearch] = React.useState("");
    const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);

    const fetchPlans = React.useCallback(async () => {
        try {
            setLoading(true);
            const res: any = await fetcher(subscriptionApi.getPlans, {
                params: { includeHidden: true },
            });
            // getPlans returns array or object with plans
            const data = Array.isArray(res) ? res : res?.plans ?? res?.data ?? [];
            setPlans(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // Keep selectedPlan in sync whenever the plans list refreshes
    React.useEffect(() => {
        if (!selectedPlan) return;
        const updated = plans.find((p) => p.id === selectedPlan.id);
        if (updated) setSelectedPlan(updated);
    }, [plans]);

    const openCreate = () => {
        setEditPlan(null);
        setForm(emptyPlan);
        setDialogOpen(true);
    };

    const openEdit = (plan: Plan) => {
        setEditPlan(plan);
        setForm({
            name: plan.name,
            price: String(plan.price),
            currency: plan.currency,
            interval: plan.interval,
            intervalCount: String(plan.intervalCount),
            trialDays: plan.trialDays != null ? String(plan.trialDays) : "",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                name: form.name,
                price: parseFloat(form.price),
                currency: form.currency,
                interval: form.interval,
                intervalCount: parseInt(form.intervalCount),
                trialDays: form.trialDays ? parseInt(form.trialDays) : null,
            };
            if (editPlan) {
                await fetcher(subscriptionApi.updatePlan(editPlan.id), { method: "PUT", data: payload });
            } else {
                await fetcher(subscriptionApi.createPlan, { method: "POST", data: payload });
            }
            setDialogOpen(false);
            fetchPlans();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleVisibility = async (plan: Plan) => {
        try {
            await fetcher(subscriptionApi.toggleVisibility(plan.id), {
                method: "PATCH",
                data: { visible: !plan.visible },
            });
            fetchPlans();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (plan: Plan) => {
        try {
            await fetcher(subscriptionApi.deletePlan(plan.id), { method: "DELETE" });
            fetchPlans();
        } catch (e) {
            console.error(e);
        }
    };

    const columns: ColumnDef<Plan>[] = [
        {
            accessorKey: "name",
            size: 160,
            header: () => <div className="text-[#2B7272]">Plan Name</div>,
            cell: ({ row }) => <div className="font-medium truncate max-w-[150px]">{row.original.name}</div>,
        },
        {
            accessorKey: "price",
            size: 120,
            header: () => <div className="text-[#2B7272]">Price</div>,
            cell: ({ row }) => (
                <div className="text-sm whitespace-nowrap">
                    {row.original.currency.toUpperCase()} {row.original.price.toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "interval",
            size: 150,
            header: () => <div className="text-[#2B7272]">Billing Cycle</div>,
            cell: ({ row }) => (
                <div className="text-sm">
                    {`Every ${row.original.intervalCount} ${row.original.interval}${row.original.intervalCount > 1 ? "s" : ""}`}
                </div>
            ),
        },
        {
            accessorKey: "trialDays",
            size: 120,
            header: () => <div className="text-[#2B7272]">Trial Period</div>,
            cell: ({ row }) =>
                row.original.trialDays ? (
                    <Badge variant="outline" className="border-[#2B7272] text-[#2B7272] font-rubik-400 rounded-2xl">
                        {row.original.trialDays} days
                    </Badge>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                ),
        },
        {
            accessorKey: "visible",
            size: 110,
            header: () => <div className="text-[#2B7272]">Visibility</div>,
            cell: ({ row }) => (
                <Badge
                    variant={row.original.visible ? "default" : "secondary"}
                    className={row.original.visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}
                >
                    {row.original.visible ? "Visible" : "Hidden"}
                </Badge>
            ),
        },
        {
            id: "actions",
            size: 90,
            header: () => <div className="text-[#2B7272]">Action</div>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="rounded-2xl cursor-pointer"
                        onClick={() => setSelectedPlan(row.original)}
                    >
                        <span className="text-[14px] font-light">View</span>
                    </Badge>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: plans,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { globalFilter: search },
        onGlobalFilterChange: setSearch,
        globalFilterFn: "includesString",
        initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
    });

    const { pageIndex, pageSize } = table.getState().pagination;
    const totalRows = plans.length;
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, totalRows);

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="py-4 font-rubik-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                    <Input
                        placeholder="Search plans…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 font-rubik-400 w-64 bg-white"
                    />
                </div>
                <Button onClick={openCreate} className="font-rubik-400 bg-[#2B7272] py-3 text-white hover:bg-[#1f5d57] w-full md:w-auto">
                    <Plus size={16} /> Add Plan
                </Button>
            </div>

            <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#DDF3E5] font-rubik-600 text-[#2B7272]">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="divide-x divide-gray-200">
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
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
                                    Loading plans…
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center font-rubik-400">
                                    No plans found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="bg-white divide-x divide-gray-200">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 font-rubik-400 align-top">
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
                    {totalRows === 0 ? "0 of 0" : `${from} – ${to} of ${totalRows}`}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-rubik-400 py-3"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-1.5">
                            <Label>Plan Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Monthly Premium"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="9.99"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Currency</Label>
                                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usd" className="font-rubik-400">USD</SelectItem>
                                        <SelectItem value="eur" className="font-rubik-400">EUR</SelectItem>
                                        <SelectItem value="gbp" className="font-rubik-400">GBP</SelectItem>
                                        <SelectItem value="inr" className="font-rubik-400">INR</SelectItem>
                                        <SelectItem value="aud" className="font-rubik-400">AUD</SelectItem>
                                        <SelectItem value="cad" className="font-rubik-400">CAD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Interval</Label>
                                <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day" className="font-rubik-400">Day</SelectItem>
                                        <SelectItem value="week" className="font-rubik-400">Week</SelectItem>
                                        <SelectItem value="month" className="font-rubik-400">Month</SelectItem>
                                        <SelectItem value="year" className="font-rubik-400">Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Interval Count</Label>
                                <Input
                                    type="number"
                                    value={form.intervalCount}
                                    onChange={(e) => setForm({ ...form, intervalCount: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Trial Days (optional)</Label>
                            <Input
                                type="number"
                                value={form.trialDays}
                                onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                                placeholder="e.g. 7"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !form.name || !form.price}
                            className="bg-[#2B7272] hover:bg-[#1F5D57] text-white"
                        >
                            {saving && <Loader2 className="animate-spin mr-2" size={14} />}
                            {editPlan ? "Save Changes" : "Create Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <PlanDetails
                plan={selectedPlan}
                onClose={() => setSelectedPlan(null)}
                onEdit={openEdit}
                onRefresh={fetchPlans}
            />
        </div>
    );
}
