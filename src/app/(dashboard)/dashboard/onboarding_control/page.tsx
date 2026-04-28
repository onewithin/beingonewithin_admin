'use client'
import { CustomModal } from '@/components/custom-modal'
import { Button } from '@/components/ui/button'
import React, { useEffect, useMemo, useState } from 'react'
import Question from './_components/question'
import { fetcher } from '@/lib/fetcher'
import { categoryApi, onboardingApis } from '@/lib/api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { onboardingColumns } from '@/lib/coulmns/onboardingColumns'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

function Onboarding_control() {

    const [tags, setTags] = useState<any[]>([])
    const [questions, setQuestions] = useState<any[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortOrder, setSortOrder] = useState<string>('')

    const openModalWithQuestion = (question: any) => {
        setSelectedQuestion({
            id: question.id,
            question: question.question,
            options: question.options.map((item: any) => {
                return {
                    optionText: item.option,
                    tags: item.tags.map((item: any) => item.tag)
                }
            })
        });
        setModalOpen(true);
    };

    const onUpdate = (data: any) => {
        setQuestions((prev) => prev.map((item) => {
            if (item.id === data.id) {
                return data
            }
            return item
        }))
    }

    const onDelete = (id: string) => {
        setQuestions((prev) => prev.filter((item) => item.id !== id));
    }

    const onCreate = (data: any) => {
        setQuestions((prev) => [...prev, data])
        setModalOpen(false)
    }

    const handleModalChange = (isOpen: boolean) => {
        setModalOpen(isOpen);
        if (!isOpen) {
            setSelectedQuestion(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const results = await Promise.allSettled([
                    fetcher(categoryApi.createTag, { method: 'GET' }),
                    fetcher(onboardingApis.getAll, { method: 'GET' }),
                ])

                const [tagsResult, categoriesResult] = results

                if (tagsResult.status === 'fulfilled') {
                    setTags(tagsResult.value as any)
                } else {
                    console.error('Failed to fetch tags:', tagsResult.reason)
                }

                if (categoriesResult.status === 'fulfilled') {
                    setQuestions((categoriesResult.value as any).data)
                } else {
                    console.error('Failed to fetch categories:', categoriesResult.reason)
                }
            } catch (err) {
                // console.error('Unexpected error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Client-side search + sort
    const processedQuestions = useMemo(() => {
        let result = [...questions]

        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter((item) =>
                item.question?.toLowerCase().includes(q) ||
                item.options?.some((opt: any) => opt.option?.toLowerCase().includes(q))
            )
        }

        if (sortOrder === 'newest' || sortOrder === 'oldest') {
            result.sort((a, b) => {
                const aTime = new Date(a.createdAt).getTime()
                const bTime = new Date(b.createdAt).getTime()
                return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
            })
        }

        return result
    }, [questions, search, sortOrder])

    const extendedColumns = React.useMemo(() => [
        ...onboardingColumns,
        {
            accessorKey: "action",
            size: 80,
            header: () => (
                <div className="text-[#2B7272]">Action</div>
            ),
            cell: ({ row }: any) => <div className="capitalize cursor-pointer flex">
                <Badge
                    variant="outline"
                    className="text-rubik-400 rounded-2xl text-[14px] font-light"
                    onClick={() => openModalWithQuestion(row.original)}
                >
                    View
                </Badge>
            </div>,
        },
    ], [onboardingColumns, questions]);

    const table = useReactTable({
        data: processedQuestions,
        columns: extendedColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='p-6'>
            {/* Page heading */}
            <div className="mb-1">
                <h1 className="text-xl font-bold text-[#2B7272] font-rubik-400">Onboarding Questions</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">Manage questions and options shown during user onboarding.</p>
            </div>

            {/* Toolbar */}
            <div className="py-4 font-rubik-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                        <Input
                            placeholder="Search questions or options…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 font-rubik-400 w-80 bg-white "
                        />
                    </div>

                    {/* Sort */}
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v)}>
                        <SelectTrigger className="w-44 bg-white">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest" className="font-rubik-400">Newest first</SelectItem>
                            <SelectItem value="oldest" className="font-rubik-400">Oldest first</SelectItem>
                            <div className="border-t my-1" />
                            <div
                                className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-md font-rubik-400"
                                onClick={() => setSortOrder('')}
                            >
                                Clear Selection
                            </div>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="font-rubik-400 bg-[#2B7272] py-3 text-white hover:bg-[#1f5d57]"
                    onClick={() => setModalOpen(true)}
                >
                    Add Questions
                </Button>
            </div>

            {/* Result count */}
            {search.trim() && (
                <p className="text-sm text-[#777] font-rubik-400 mb-2">
                    {processedQuestions.length} result{processedQuestions.length !== 1 ? 's' : ''} for &quot;{search}&quot;
                </p>
            )}

            <div className="rounded-xl border border-gray-200 shadow-sm my-1 overflow-hidden">
                <Table className="min-w-[950px]">
                    <TableHeader className="bg-[#DDF3E5] font-rubik-600 text-[#2B7272]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="divide-x divide-gray-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.column.getSize() }}
                                    >
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className=" bg-white divide-x divide-gray-200">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                            className="py-4 font-rubik-400 align-top"
                                        >
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
                                <TableCell colSpan={extendedColumns.length} className="h-24 text-center font-rubik-400">
                                    {loading ? "Loading ..." : search.trim() ? `No questions match "${search}"` : "No data available"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CustomModal
                open={modalOpen}
                onOpenChange={handleModalChange}
                title="View Question"
            >
                <Question initialData={selectedQuestion} tagsList={tags} closeModal={() => { setModalOpen(false); setSelectedQuestion(null); }} onUpdate={onUpdate} onDelete={onDelete} onCreate={onCreate} />
            </CustomModal>
        </div >
    )
}

export default Onboarding_control