import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, Clock, ImageIcon } from "lucide-react";

export const thoughtColumns: ColumnDef<any>[] = [
    {
        accessorKey: "title",
        header: () => <div className="text-[#2B7272]">Title</div>,
        cell: ({ row }) => (
            <div className="font-medium max-w-[200px]">
                <p className="capitalize truncate overflow-hidden whitespace-nowrap">{row.original.title}</p>
                {/* <Badge
                    variant="outline"
                    className={`border ${row.original.status === "PENDING"
                        ? "border-yellow-600 text-yellow-600"
                        : "border-green-600 text-green-600"
                        } font-rubik-400 rounded-2xl mt-1`}
                >
                    {row.original.status === "PENDING" ? "Scheduled" : "Posted"}
                </Badge> */}
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: () => <div className="text-[#2B7272] max-w-[200px]">Description</div>,
        cell: ({ row }) => (
            <p className="text-sm truncate max-w-[250px] text-gray-600">
                {row.original.description}
            </p>
        ),
    },
    {
        accessorKey: "duration",
        header: () => <div className="text-[#2B7272] ">Duration</div>,
        cell: ({ row }) => (
            < p className="text-sm truncate  text-gray-600" >
                {row.original.duration}
            </p >
        ),
    },
    {
        accessorKey: "scheduledAt",
        header: () => <div className="text-[#2B7272]">Scheduled At</div>,
        cell: ({ row }) => {
            const val = row.original.scheduledAt;
            if (!val) return <span className="italic text-gray-400">N/A</span>;

            const date = new Date(val);
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();
            return (
                <div className="flex items-center gap-2">
                    {`${dd}/${mm}/${yyyy}`}{" "}
                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => <div className="text-[#2B7272] ">Status</div>,
        cell: ({ row }) => (
            < Badge
                variant="outline"
                className={`border ${row.original.status === "PENDING"
                    ? "border-yellow-600 text-yellow-600"
                    : "border-green-600 text-green-600"
                    } font-rubik-400 rounded-2xl mt-1`
                }
            >
                {row.original.status === "PENDING" ? "Scheduled" : "Posted"}
            </Badge >
        ),
    },
];
