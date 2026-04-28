'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Volume2,
    Paperclip,
    X,
    Images,
    CheckCircle,
} from "lucide-react"
import { Label } from '@/components/ui/label'
import { fetcher } from '@/lib/fetcher'
import { thoughtsApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { Calendar24 } from './_components/date-selector'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from '@/components/deleteAlert'
import HLSAudio from '@/components/hlsAudioPlayer'

function ThoughtDetails() {
    const router = useRouter()
    const params = useParams()
    const thoughtId = params?.id as string

    const [thought, setThought] = useState<any>(null)
    const [initialLoad, setInitialLoad] = useState(true)
    const [loading, setLoading] = useState(false)
    const [submitType, setSubmitType] = useState('')
    const [fileName, setFileName] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const imageInputRef = useRef<HTMLInputElement | null>(null)

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm()

    // Load thought on mount
    useEffect(() => {
        const load = async () => {
            try {
                const res: any = await fetcher(thoughtsApi.getById(thoughtId), { method: 'GET' })
                if (res?.success && res.thought) {
                    const t = res.thought
                    setThought(t)
                    setValue('title', t.title || '')
                    setValue('description', t.description || '')
                    if (t.duration != null) {
                        // duration stored as mm:ss string or integer seconds
                        if (typeof t.duration === 'number') {
                            const mins = String(Math.floor(t.duration / 60)).padStart(2, '0')
                            const secs = String(t.duration % 60).padStart(2, '0')
                            setValue('duration', `${mins}:${secs}`)
                        } else {
                            setValue('duration', t.duration)
                        }
                    }
                    if (t.thumbnail) setImagePreview(t.thumbnail)
                    if (t.link) setFileName(t.link)
                }
            } catch (error) {
                console.error('Failed to load thought:', error)
            } finally {
                setInitialLoad(false)
            }
        }
        load()
    }, [])

    const handleDivClick = () => imageInputRef.current?.click()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        if (imageInputRef.current) imageInputRef.current.value = ''
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            setValue('file', file)

            const audio = new Audio()
            audio.src = URL.createObjectURL(file)
            audio.addEventListener('loadedmetadata', () => {
                const totalSeconds = Math.round(audio.duration)
                const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
                const secs = String(totalSeconds % 60).padStart(2, '0')
                setValue('duration', `${mins}:${secs}`)
                URL.revokeObjectURL(audio.src)
            })
        }
    }

    const triggerUpload = () => fileInputRef.current?.click()

    const handleSchedule = (schedule: any) => {
        setValue('schedule', schedule.toString())
    }

    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            const formData = new FormData()

            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('duration', data.duration)

            const audioFile = fileInputRef.current?.files?.[0]
            if (audioFile) {
                formData.append('link', audioFile)
            }

            const imageFile = imageInputRef.current?.files?.[0]
            if (imageFile) {
                formData.append('thumbnail', imageFile)
            } else if (imagePreview) {
                formData.append('thumbnail', imagePreview)
            }

            if (submitType === 'now') {
                formData.append('scheduleNow', 'true')
            } else if (submitType === 'schedule') {
                if (!data?.schedule) {
                    setError('schedule', {
                        type: 'manual',
                        message: 'Scheduled date and time is required.',
                    })
                    setLoading(false)
                    return
                }
                formData.append('scheduledAt', data.schedule.toString())
            }

            const res: any = await fetcher(thoughtsApi.update(thoughtId), { method: 'PATCH', data: formData })
            if (res?.success) {
                toast.success('Thought updated successfully!', {
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true,
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setLoading(true)
            const res: any = await fetcher(thoughtsApi.delete(thoughtId), { method: 'DELETE' })
            if (res?.success) {
                toast.success('Thought deleted successfully!', {
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true,
                })
                router.push('/dashboard/thoughts')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (initialLoad) {
        return (
            <div className="flex flex-1 justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-3 mx-2 my-4 bg-white rounded-[20px] font-rubik-400">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[16px] font-rubik-400 font-medium text-[#000000]">Thought Details</h3>
                    <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">Update or delete this thought.</p>
                </div>
                <div className="flex gap-2">
                    <Badge className='p-1 px-2 border-2 bg-[#DDF3E5] text-[#2B7272] font-rubik-500 rounded-full text-[12px]'>
                        <Volume2 className='h-4 w-4 mr-1' /> Audio
                    </Badge>
                </div>
            </div>

            {/* Form Content */}
            <div className="gap-8">
                <div className="space-y-6 lg:flex gap-3">
                    {/* Thumbnail Upload */}
                    <div className="lg:w-[20%]">
                        <h4 className="text-base font-light text-[#000000] mb-2">Thumbnail Upload</h4>
                        <div className="flex w-full h-full">
                            {imagePreview ? (
                                <div className="relative w-full h-[200px]">
                                    <img
                                        src={imagePreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-full rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="cursor-pointer border-2 border-dashed border-[#D9D9D9] flex flex-col justify-center items-center rounded-lg p-8 text-center bg-[#ffffff] w-full"
                                    onClick={handleDivClick}
                                >
                                    <Images className="w-8 h-8 mx-auto mb-4" />
                                    <p className="text-[#777777] mb-2 font-rubik-400 text-[12px]">
                                        Drop here or Browse<br />images from device
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={imageInputRef}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Upload / Title / Duration */}
                    <div className='lg:w-[40%] flex flex-col justify-between'>
                        {/* Upload */}
                        <div className='relative'>
                            <Label className="text-base font-light text-[#000000] mb-1">
                                <Paperclip className="w-4 h-4 text-[#777777]" /> Upload File
                            </Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="audio/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {fileName ? (
                                <div className="flex flex-col gap-2">
                                    <HLSAudio fileName={fileName} />
                                    <button
                                        type="button"
                                        onClick={triggerUpload}
                                        className="text-sm text-[#2b7272] underline mt-1"
                                    >
                                        Replace Audio
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Input
                                        type="text"
                                        placeholder="Select file"
                                        readOnly
                                        className='w-full cursor-pointer'
                                        onClick={triggerUpload}
                                    />
                                    <p className='text-[#777777] text-[12px]'>Upload (MP3 or MP4)</p>
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <div className='my-1'>
                            <Label htmlFor="title" className='mb-1 text-[14px] font-light text-base'>Title</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Enter the title"
                                {...register('title', { required: 'Title is required' })}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor="duration" className='mb-1 text-[14px] font-light text-base'>Duration</Label>
                            <Input
                                id="duration"
                                type="text"
                                placeholder="Auto-detected from audio (mm:ss)"
                                readOnly
                                className="bg-gray-50 cursor-not-allowed"
                                {...register('duration', {
                                    required: 'Duration is required',
                                    pattern: {
                                        value: /^[0-9]{2}:[0-9]{2}$/,
                                        message: 'Format must be mm:ss',
                                    },
                                })}
                            />
                            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message as string}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className='lg:w-[40%] h-full'>
                        <div className="flex items-center gap-2 mb-1">
                            <Paperclip className="w-4 h-4 text-[#777777]" />
                            <span className="text-base font-light text-[#000000]">Short Description</span>
                        </div>
                        <Textarea
                            placeholder="Enter short description"
                            className="min-h-[200px] bg-[#ffffff] border-[#d9d9d9] resize-none"
                            {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
                    </div>
                </div>
            </div>

            {/* Schedule — only for PENDING thoughts */}
            {thought?.status !== 'POSTED' && (
                <div>
                    <Calendar24
                        handleSchedule={handleSchedule}
                        errors={errors}
                        defaultDate={thought?.scheduledAt ? new Date(thought.scheduledAt) : undefined}
                    />
                    <input type="hidden" {...register('schedule')} />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row justify-end gap-4 mt-12">
                <ConfirmDeleteDialog
                    onConfirm={handleDelete}
                    title="Delete Thought?"
                    description="This will permanently delete this thought. This action cannot be undone."
                    trigger={
                        <Button
                            type="button"
                            disabled={loading}
                            className={`text-white px-8 py-2 ${loading && submitType === 'delete' ? 'bg-red-500/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {loading && submitType === 'delete' ? 'Deleting...' : 'Delete'}
                        </Button>
                    }
                />
                {thought?.status === 'POSTED' ? (
                    <Button
                        type="submit"
                        onClick={() => setSubmitType('update')}
                        disabled={loading}
                        className={`text-white px-8 py-2 ${loading ? 'bg-[#2b7272]/50 cursor-not-allowed' : 'bg-[#2b7272] hover:bg-[#1f5d57]'}`}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                ) : (
                    <>
                        <Button
                            type="submit"
                            onClick={() => setSubmitType('now')}
                            disabled={loading}
                            className={`text-white px-8 py-2 ${loading && submitType === 'now' ? 'bg-[#2b7272]/50 cursor-not-allowed' : 'bg-[#2b7272] hover:bg-[#1f5d57]'}`}
                        >
                            {loading && submitType === 'now' ? 'Posting...' : 'Post Now'}
                        </Button>
                        <Button
                            type="submit"
                            onClick={() => setSubmitType('schedule')}
                            disabled={loading}
                            className={`text-white px-8 py-2 ${loading && submitType === 'schedule' ? 'bg-[#fba515]/50 cursor-not-allowed' : 'bg-[#fba515] hover:bg-[#e8940f]'}`}
                        >
                            {loading && submitType === 'schedule' ? 'Scheduling...' : 'Save and Schedule'}
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}

export default ThoughtDetails
