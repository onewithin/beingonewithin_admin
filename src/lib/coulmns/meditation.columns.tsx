import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Volume2 } from "lucide-react";

export const mediationColumns: ColumnDef<any>[] = [
    {
        accessorKey: "title",
        size: 200,
        header: () => <div className="text-[#2B7272]">Title</div>,
        cell: ({ row }) => <div className="font-medium">
            <p className="capitalize truncate max-w-[190px]">{row.original.title}</p>
            <Badge
                variant="outline"
                className={`border ${!row.original.isPremium ? "border-[#2B7272] text-[#2B7272]" : "border-yellow-600 text-yellow-600"} font-rubik-400 rounded-2xl mt-1`}
            >
                {!row.original.isPremium ? "Free" : "Premium"}
            </Badge>
        </div>
    },
    {
        accessorKey: "category",
        size: 140,
        header: () => <div className="text-[#2B7272]">Category</div>,
        cell: ({ row }) => row.original.category?.name ?? "-",
    },
    {
        accessorKey: "subcategory",
        size: 140,
        header: () => <div className="text-[#2B7272]">Sub Category</div>,
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={`border font-rubik-400 rounded-2xl mt-1 capitalize`}
            >
                {row.original.subcategory?.name}
            </Badge>
        ),
    },
    {
        accessorKey: "Duration",
        size: 90,
        header: () => <div className="text-[#2B7272]">Duration</div>,
        cell: ({ row }) => {
            const totalSeconds = Number(row.original.duration)
            const minutes = String(Math.floor(totalSeconds)).padStart(2, "0")
            const seconds = String(Math.round((totalSeconds % 1) * 60)).padStart(2, "0")
            return `${minutes}:${seconds}`
        },
    },
    {
        accessorKey: "link",
        size: 100,
        header: () => <div className="text-[#2B7272]">Type</div>,
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={`border font-rubik-400 rounded-2xl mt-1 capitalize`}
            >
                <Volume2 className="h-8 w-8" />
                {row.original.type || "Audio"}
            </Badge>
        ),
    },
    {
        accessorKey: "tags",
        size: 160,
        header: () => <div className="text-[#2B7272]">Tags</div>,
        cell: ({ row }) => {
            const tags = row.original.meditationTags;

            return (
                <div className="flex flex-wrap gap-2">
                    {tags && tags.length > 0 ? (
                        tags.map((tag: any) => (
                            <Badge
                                key={tag.tag.id}
                                variant="outline"
                                className="border border-[#2B7272] text-[#2B7272] font-rubik-400 rounded-2xl mt-1 capitalize"
                            >
                                {tag.tag.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-gray-400 italic text-center">No tags</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "active",
        size: 90,
        header: () => (
            <div className="text-[#2B7272]">Active</div>
        ),
        cell: ({ row }) => {
            const status: string = row.getValue("active")
            const color = status ? "text-green-600" : status === "inactive" ? "text-yellow-600" : "text-red-600"
            return <div className={`capitalize font-semibold min-w-28 px-1 ${color}`}>{status ? "Active" : "Inactive"}</div>
        },
    },
    {
        accessorKey: "scheduledAt",
        size: 150,
        header: () => <div className="text-[#2B7272]">Scheduled</div>,
        cell: ({ row }) => {
            const scheduledAt: any = row.getValue("scheduledAt");
            if (!scheduledAt) return <div className="text-gray-400 italic">—</div>;
            const d = new Date(scheduledAt);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            return <div>{dd}/{mm}/{yyyy} {hh}:{min}</div>;
        },
    },
    {
        accessorKey: "createdAt",
        size: 120,
        header: () => <div className="text-[#2B7272]">Added</div>,
        cell: ({ row }) => {
            const d = new Date(row.getValue("createdAt"));
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return <div>{dd}/{mm}/{yyyy}</div>;
        },
    },
]