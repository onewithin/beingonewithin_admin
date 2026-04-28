import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const onboardingColumns: ColumnDef<any>[] = [
    {
        accessorKey: "question",
        size: 220,
        header: () => <div className="text-[#2B7272]">Question</div>,
        cell: ({ row }) => (
            <p className="text-sm break-words whitespace-normal">{row.original.question}</p>
        ),
    },
    {
        accessorKey: "options",
        size: 280,
        header: () => <div className="text-[#2B7272]">Options</div>,
        cell: ({ row }) => (
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                {row.original.options.map((option: any, idx: number) => (
                    <li key={idx} className="break-words whitespace-normal">{option.option}</li>
                ))}
            </ul>
        ),
    },
    {
        accessorKey: "topic",
        size: 220,
        header: () => <div className="text-[#2B7272]">Topic</div>,
        cell: ({ row }) => {
            const uniqueTags = new Map();

            // Flatten all tags from all options and store by tag ID to avoid duplicates
            row.original.options?.forEach((option: any) => {
                option.tags?.forEach((tagObj: any) => {
                    const tag = tagObj.tag;
                    if (tag?.id && !uniqueTags.has(tag.id)) {
                        uniqueTags.set(tag.id, tag.name);
                    }
                });
            });

            return (
                <div className="flex flex-wrap gap-1.5">
                    {[...uniqueTags.entries()].map(([tagId, tagName]) => (
                        <Badge
                            key={tagId}
                            variant="outline"
                            className="border border-[#2B7272] text-[#2B7272] font-rubik-400 rounded-2xl capitalize"
                        >
                            {tagName}
                        </Badge>
                    ))}
                </div>
            );
        }
    },
    {
        accessorKey: "createdAt",
        size: 150,
        header: () => <div className="text-[#2B7272]">Added Date</div>,
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"))
            return <div className="whitespace-nowrap text-sm">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        },
    },
];
