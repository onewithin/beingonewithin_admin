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
}

function CreateTags({ addCategory }: { addCategory: (item: any) => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true)

            const body = {
                name: data.title,
            }
            const res = await fetcher(categoryApi.createTag, {
                method: 'POST',
                data: body,
            })

            console.log(res)

            if (res) {
                addCategory(res)
                setOpen(false)
                toast.success('Tag created successfully')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2b7272] my-1 lg:my-0 hover:bg-[#1f5d57] text-white px-3 font-rubik-400">
                        <Plus className="w-4 h-4 mr-1" /> Add New
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto hide-scrollbar">

                    <form noValidate className="font-rubik-400">
                        {/* Title */}
                        <div className="my-3">
                            <Label htmlFor="title" className="mb-1 text-[14px] font-light text-base">
                                Tagname
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Enter the tag name"
                                {...register('title', { required: 'Title is required' })}
                                aria-invalid={errors.title ? 'true' : 'false'}
                                aria-describedby="title-error"
                            />
                            {errors.title && (
                                <p id="title-error" className="text-red-600 text-sm mt-1">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>
                        {/* Submit Button */}
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="bg-[#2b7272] my-3 hover:bg-[#1f5d57] text-white px-3 font-rubik-400"
                        >
                            {loading ? 'Saving...' : 'Save Tag'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateTags
