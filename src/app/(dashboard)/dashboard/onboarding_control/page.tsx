'use client'
import { CustomModal } from '@/components/custom-modal'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { FileQuestion, Plus, CheckCircle2, XCircle, LayoutList, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'

interface Tag {
    id: string;
    name: string;
}
interface Option {
    id: string;
    option: string;
    tags: { tag: Tag }[];
}
interface Question {
    id: string;
    question: string;
    active: boolean;
    options: Option[];
}
interface Stats {
    total: number;
    active: number;
    inactive: number;
}

function Onboarding_control() {
    const [tags, setTags] = useState<Tag[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 })
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const openModalWithQuestion = (question: Question) => {
        setSelectedQuestion({
            id: question.id,
            question: question.question,
            options: question.options.map((item) => ({
                optionText: item.option,
                tags: item.tags.map((t) => t.tag),
            })),
        })
        setModalOpen(true)
    }

    const onUpdate = (data: Question) => {
        setQuestions((prev) => prev.map((item) => (item.id === data.id ? data : item)))
        setStats((prev) => {
            const wasActive = questions.find((q) => q.id === data.id)?.active
            const isActive = data.active
            if (wasActive === isActive) return prev
            return {
                total: prev.total,
                active: prev.active + (isActive ? 1 : -1),
                inactive: prev.inactive + (isActive ? -1 : 1),
            }
        })
    }

    const onDelete = (id: string) => {
        const removed = questions.find((q) => q.id === id)
        setQuestions((prev) => prev.filter((item) => item.id !== id))
        setStats((prev) => ({
            total: prev.total - 1,
            active: removed?.active ? prev.active - 1 : prev.active,
            inactive: !removed?.active ? prev.inactive - 1 : prev.inactive,
        }))
    }

    const onCreate = (data: Question) => {
        setQuestions((prev) => [data, ...prev])
        setStats((prev) => ({
            total: prev.total + 1,
            active: data.active ? prev.active + 1 : prev.active,
            inactive: !data.active ? prev.inactive + 1 : prev.inactive,
        }))
        setModalOpen(false)
    }

    const handleToggleStatus = async (question: Question, e: React.MouseEvent) => {
        e.stopPropagation()
        setTogglingId(question.id)
        try {
            const res: any = await fetcher(onboardingApis.toggleStatus(question.id), { method: 'PATCH' })
            const updated: Question = res.data
            setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
            setStats((prev) => ({
                total: prev.total,
                active: prev.active + (updated.active ? 1 : -1),
                inactive: prev.inactive + (updated.active ? -1 : 1),
            }))
            toast.success(updated.active ? 'Question activated' : 'Question deactivated')
        } catch (err: any) {
            toast.error(err?.message || 'Failed to toggle status')
        } finally {
            setTogglingId(null)
        }
    }

    const handleModalChange = (isOpen: boolean) => {
        setModalOpen(isOpen)
        if (!isOpen) setSelectedQuestion(null)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const results = await Promise.allSettled([
                    fetcher<Tag[]>(categoryApi.createTag, { method: 'GET' }),
                    fetcher<{ data: Question[] }>(onboardingApis.getAll, { method: 'GET' }),
                    fetcher<{ data: Stats }>(onboardingApis.getStats, { method: 'GET' }),
                ])
                const [tagsResult, questionsResult, statsResult] = results
                if (tagsResult.status === 'fulfilled') setTags(tagsResult.value as Tag[])
                if (questionsResult.status === 'fulfilled') setQuestions((questionsResult.value as any).data)
                if (statsResult.status === 'fulfilled') setStats((statsResult.value as any).data)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredQuestions = questions.filter((q) => {
        if (filter === 'active') return q.active
        if (filter === 'inactive') return !q.active
        return true
    })

    const columns: ColumnDef<Question>[] = React.useMemo(() => [
        {
            accessorKey: 'question',
            header: () => <div className="text-[#2B7272]">Question</div>,
            cell: ({ row }) => (
                <p className="text-sm max-w-[280px] truncate font-rubik-400">{row.original.question}</p>
            ),
        },
        {
            accessorKey: 'options',
            header: () => <div className="text-[#2B7272]">Options</div>,
            cell: ({ row }) => (
                <ul className="list-none space-y-1 max-w-[240px] text-sm text-gray-600">
                    {row.original.options.map((opt, idx) => (
                        <li key={idx} className="flex items-center gap-1 truncate">
                            <span className="w-5 h-5 rounded-full bg-[#DDF3E5] text-[#2B7272] text-xs flex items-center justify-center font-rubik-500 flex-shrink-0">
                                {idx + 1}
                            </span>
                            {opt.option}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            accessorKey: 'tags',
            header: () => <div className="text-[#2B7272]">Tags</div>,
            cell: ({ row }) => {
                const uniqueTags = new Map<string, string>()
                row.original.options.forEach((opt) =>
                    opt.tags.forEach((t) => { if (t.tag?.id) uniqueTags.set(t.tag.id, t.tag.name) })
                )
                return (
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {[...uniqueTags.entries()].map(([id, name]) => (
                            <Badge key={id} variant="outline" className="border-[#2B7272] text-[#2B7272] font-rubik-400 rounded-2xl text-xs capitalize">
                                {name}
                            </Badge>
                        ))}
                    </div>
                )
            },
        },
        {
            accessorKey: 'active',
            header: () => <div className="text-[#2B7272]">Status</div>,
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={`rounded-2xl text-xs font-rubik-400 ${row.original.active
                        ? 'border-green-500 text-green-600 bg-green-50'
                        : 'border-gray-400 text-gray-500 bg-gray-50'
                        }`}
                >
                    {row.original.active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-[#2B7272]">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="font-rubik-400 rounded-2xl text-[13px] font-light cursor-pointer"
                        onClick={() => openModalWithQuestion(row.original)}
                    >
                        Edit
                    </Badge>
                    <button
                        onClick={(e) => handleToggleStatus(row.original, e)}
                        disabled={togglingId === row.original.id}
                        title={row.original.active ? 'Deactivate' : 'Activate'}
                        className="flex items-center justify-center disabled:opacity-50"
                    >
                        {togglingId === row.original.id ? (
                            <Loader2 size={18} className="animate-spin text-[#2B7272]" />
                        ) : row.original.active ? (
                            <ToggleRight size={22} className="text-green-600" />
                        ) : (
                            <ToggleLeft size={22} className="text-gray-400" />
                        )}
                    </button>
                </div>
            ),
        },
    ], [togglingId, questions])

    const table = useReactTable({
        data: filteredQuestions,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="p-6 font-rubik-400">
            {/* Header */}
            <div className="mb-6 bg-white p-5 rounded-3xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DDF3E5] flex items-center justify-center">
                            <FileQuestion size={20} className="text-[#2B7272]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-rubik-500 text-[#2b7272]">Onboarding Control</h1>
                            <p className="text-sm text-[#777777]">Manage questions shown to users during onboarding</p>
                        </div>
                    </div>
                    <Button
                        className="bg-[#2B7272] text-white hover:bg-[#1f5d57] flex items-center gap-2 rounded-xl"
                        onClick={() => { setSelectedQuestion(null); setModalOpen(true) }}
                    >
                        <Plus size={16} />
                        Add Question
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e8f4fe] flex items-center justify-center">
                        <LayoutList size={20} className="text-[#4a90d9]" />
                    </div>
                    <div>
                        <p className="text-2xl font-rubik-500 text-[#2b7272]">{loading ? '—' : stats.total}</p>
                        <p className="text-sm text-[#777777]">Total Questions</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#DDF3E5] flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-rubik-500 text-green-600">{loading ? '—' : stats.active}</p>
                        <p className="text-sm text-[#777777]">Active</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef3e8] flex items-center justify-center">
                        <XCircle size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-rubik-500 text-orange-400">{loading ? '—' : stats.inactive}</p>
                        <p className="text-sm text-[#777777]">Inactive</p>
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
                {(['all', 'active', 'inactive'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-rubik-400 transition-colors ${filter === f
                            ? 'bg-[#2B7272] text-white'
                            : 'bg-white text-[#2B7272] border border-[#2B7272] hover:bg-[#DDF3E5]'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#DDF3E5]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-rubik-500">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-[#f9fffe]">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 font-rubik-400">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-[#aaa] font-rubik-400">
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin text-[#2B7272]" />
                                            Loading questions...
                                        </div>
                                    ) : 'No questions found'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal */}
            <CustomModal
                open={modalOpen}
                onOpenChange={handleModalChange}
                title={selectedQuestion ? 'Edit Question' : 'Add Question'}
            >
                <Question
                    initialData={selectedQuestion}
                    tagsList={tags}
                    closeModal={() => { setModalOpen(false); setSelectedQuestion(null) }}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onCreate={onCreate}
                />
            </CustomModal>
        </div>
    )
}

export default Onboarding_control


function Onboarding_control() {

    const [tags, setTags] = useState<any[]>([])
    const [questions, setQuestions] = useState<any[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true)

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

    const extendedColumns = React.useMemo(() => [
        ...onboardingColumns,
        {
            accessorKey: "action",
            header: ({ column }) => (
                <div className="text-[#2B7272]">Action</div>
            ),
            cell: ({ row }) => <div className="capitalize cursor-pointer">
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
        data: questions,
        columns: extendedColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='p-6' >
            <div className='flex justify-end'>
                <Button className="font-rubik-400 bg-[#2B7272] py-3 text-white hover:bg-[#2B7272]" onClick={() => setModalOpen(true)}>Add Questions</Button>
            </div >
            <div className="rounded-md border my-3">
                <Table>
                    <TableHeader className="bg-[#DDF3E5] font-rubik-600 text-[#2B7272]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 font-rubik-400 bg-white ">
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
                                <TableCell colSpan={onboardingColumns.length} className="h-24 text-center font-rubik-400">
                                    {loading ? "Loading ..." : "No data available"}
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