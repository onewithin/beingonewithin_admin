'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HexColorPicker } from 'react-colorful'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { fetcher } from '@/lib/fetcher'
import { categoryApi } from '@/lib/api'
import { toast } from 'sonner'

type FormData = {
    title: string
    description: string
    category: Record<any, any> | string
}

function CreateSubCategory({ addCategory, categoryId }: { addCategory: (item: any) => void, categoryId: string }) {
    const [open, setOpen] = useState(false)
    const [color, setColor] = useState('#2b7272')
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()
    const { ref: titleRef, ...titleRest } = register('title', { required: 'Subcategory name is required' })

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true)
            const body = { name: data.title, description: data.description, categoryId, color }
            const res = await fetcher(categoryApi.createSubCategory, { method: 'POST', data: body })
            if (res) {
                addCategory(res)
                setOpen(false)
                reset()
                setColor('#2b7272')
                toast.success('Subcategory created successfully')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus()
    }, [open])

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2b7272] my-1 lg:my-0 hover:bg-[#1f5d57] text-white px-3 font-rubik-400">
                        <Plus className="w-4 h-4 mr-1" /> Add New
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <DialogTitle className="text-lg font-semibold text-gray-900 font-rubik-400">Create New Subcategory</DialogTitle>
                        <p className="text-sm text-gray-500 font-rubik-400 mt-0.5">Fill in the details to add a new subcategory.</p>
                    </DialogHeader>

                    <form noValidate onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 font-rubik-400 max-h-[70vh] overflow-y-auto hide-scrollbar">

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Subcategory Name</Label>
                            <Input
                                id="title"
                                ref={(el) => { titleRef(el); (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el }}
                                type="text"
                                placeholder="e.g. Morning Calm, Deep Focus…"
                                className="rounded-lg border-gray-200 focus-visible:ring-[#2b7272] h-10"
                                {...titleRest}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-0.5">{errors.title.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                            <textarea
                                id="description"
                                rows={3}
                                placeholder="Brief description of this subcategory…"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b7272] resize-none font-rubik-400"
                                {...register('description', { required: 'Description is required' })}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description.message}</p>}
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Brand Color</Label>
                            <div className="flex gap-4 items-start">
                                <HexColorPicker color={color} onChange={setColor} style={{ width: '160px', height: '140px' }} />
                                <div className="flex flex-col gap-2 justify-start pt-1">
                                    <div className="w-16 h-16 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: color }} />
                                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5">
                                        <span className="text-xs text-gray-400 uppercase font-mono">#</span>
                                        <input
                                            type="text"
                                            value={color.replace('#', '')}
                                            onChange={(e) => setColor('#' + e.target.value.replace('#', '').slice(0, 6))}
                                            className="text-xs w-16 outline-none font-mono text-gray-700 bg-transparent"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg font-rubik-400" disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="bg-[#2b7272] hover:bg-[#1f5d57] text-white rounded-lg px-6 font-rubik-400"
                        >
                            {loading ? 'Saving…' : 'Save Subcategory'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateSubCategory
