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
import { ImagePlus, Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { fetcher } from '@/lib/fetcher'
import { categoryApi } from '@/lib/api'
import { toast } from 'sonner'

type FormData = {
    title: string
}

function CreateCategory({ addCategory }: { addCategory: (item: any) => void }) {
    const [open, setOpen] = useState(false)
    const [color, setColor] = useState('#2b7272')
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const iconInputRef = useRef<HTMLInputElement | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setPreviewUrl(URL.createObjectURL(file))
    }

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setIconPreviewUrl(URL.createObjectURL(file))
    }

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

    const { ref: titleRef, ...titleRest } = register('title', { required: 'Category name is required' })

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('name', data.title)
            formData.append('color', color)
            if (fileInputRef.current?.files?.[0]) formData.append('backgroundImage', fileInputRef.current.files[0])
            if (iconInputRef.current?.files?.[0]) formData.append('icon', iconInputRef.current.files[0])

            const res = await fetcher(categoryApi.createCategory, { method: 'POST', data: formData })
            if (res) {
                addCategory(res)
                setOpen(false)
                reset()
                setPreviewUrl(null)
                setIconPreviewUrl(null)
                setColor('#2b7272')
                toast.success('Category created successfully')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus()
    }, [open])

    const UploadZone = ({
        label, previewUrl, onClear, onClickZone, accept, inputRef, onChange
    }: {
        label: string
        previewUrl: string | null
        onClear: () => void
        onClickZone: () => void
        accept: string
        inputRef: React.RefObject<HTMLInputElement | null>
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }) => (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 font-rubik-400">{label}</Label>
            {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32 flex items-center justify-center">
                    <img src={previewUrl} alt={label} className="max-h-28 max-w-full object-contain" />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-2 right-2 bg-white border border-gray-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={onClickZone}
                    className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-[#2b7272] hover:bg-[#f0fafa] transition-colors group"
                >
                    <ImagePlus className="w-7 h-7 text-gray-300 group-hover:text-[#2b7272] mb-2 transition-colors" />
                    <p className="text-xs text-gray-400 group-hover:text-[#2b7272] transition-colors font-rubik-400">Click to upload</p>
                </div>
            )}
            <input type="file" accept={accept} ref={inputRef} onChange={onChange} className="hidden" />
        </div>
    )

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2b7272] my-1 lg:my-0 hover:bg-[#1f5d57] text-white px-3 font-rubik-400">
                        <Plus className="w-4 h-4 mr-1" /> Add New
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <DialogTitle className="text-lg font-semibold text-gray-900 font-rubik-400">Create New Category</DialogTitle>
                        <p className="text-sm text-gray-500 font-rubik-400 mt-0.5">Fill in the details below to add a new meditation category.</p>
                    </DialogHeader>

                    <form noValidate onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 font-rubik-400 max-h-[70vh] overflow-y-auto hide-scrollbar">

                        {/* Category Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Category Name</Label>
                            <Input
                                id="title"
                                ref={(el) => { titleRef(el); (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el }}
                                type="text"
                                placeholder="e.g. Sleep, Stress Relief…"
                                className="rounded-lg border-gray-200 focus-visible:ring-[#2b7272] h-10"
                                {...titleRest}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-0.5">{errors.title.message}</p>}
                        </div>

                        {/* Images side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <UploadZone
                                label="Background Image"
                                previewUrl={previewUrl}
                                onClear={() => { setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                onClickZone={() => fileInputRef.current?.click()}
                                accept="image/*"
                                inputRef={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <UploadZone
                                label="Icon Image"
                                previewUrl={iconPreviewUrl}
                                onClear={() => { setIconPreviewUrl(null); if (iconInputRef.current) iconInputRef.current.value = '' }}
                                onClickZone={() => iconInputRef.current?.click()}
                                accept="image/*"
                                inputRef={iconInputRef}
                                onChange={handleIconChange}
                            />
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
                            {loading ? 'Saving…' : 'Save Category'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateCategory
