'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Volume2,
    Paperclip,
    Plus,
    X,
    Images,
} from "lucide-react"
import { Label } from '@/components/ui/label'
import { fetcher } from '@/lib/fetcher'
import { apiUser, categoryApi, meditationApis, thoughtsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Calendar24 } from './_components/date-selector'

function AddMeditation() {
    const router = useRouter()
    const [selectedType, setSelectedType] = useState("audio")
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [submitType, setSubmitType] = useState('')
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState("")

    const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm()

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleDivClick = () => {
        imageInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = ''; // reset file input
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            setValue("file", file)

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

    const triggerUpload = () => {
        fileInputRef.current?.click()
    }

    const handleSchedule = (schedule: any) => {
        setValue('schedule', schedule.toString())
    }


    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("duration", data.duration);

            const audioFile = fileInputRef.current?.files?.[0];
            if (audioFile) {
                formData.append("link", audioFile);
            }

            // Append image file (thumbnail)
            const imageFile = imageInputRef.current?.files?.[0];
            if (imageFile) {
                formData.append("thumbnail", imageFile);
            }

            if (submitType == 'now') {
                formData.append("scheduleNow", 'true');
            } else if (submitType == 'schedule') {
                if (!data?.schedule) {
                    setError('schedule', {
                        type: 'manual',
                        message: 'Scheduled date and time is required.',
                    });
                }
                formData.append("scheduledAt", data.schedule.toString());
            }
            const res: any = await fetcher(thoughtsApi.create, { method: 'POST', data: formData });
            if (res?.success) {
                router.push('/dashboard/thoughts')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-3 mx-2 my-4 bg-white rounded-[20px] font-rubik-400" >

            {/* Select Type */}
            < div className="mb-6" >
                <h3 className="text-[16px] font-rubik-400 font-medium text-[#000000] mb-4">Select Type</h3>
                <div className="flex gap-4">
                    <Badge className='p-1 px-2 border-2 bg-[#DDF3E5] text-[#2B7272] font-rubik-500 rounded-full text-[12px]' >
                        <Volume2 className='h-12 w-12' /> Audio
                    </Badge>
                </div>
            </div >

            {/* Form Content */}
            < div className="gap-8" >
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
                            <Input
                                type="text"
                                value={fileName}
                                placeholder="Select file"
                                readOnly
                                className='w-full cursor-pointer'
                                onClick={triggerUpload}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="audio/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <input type="hidden" {...register("file", { required: "Audio file is required" })} />
                            {errors.file ? < p className="text-red-500 text-sm mt-1">{errors.file.message as string}</p> : <p className='text-[#777777] text-[12px]'>Upload (MP3 or MP4)</p>
                            }
                        </div>

                        {/* Title */}
                        <div className='my-1'>
                            <Label htmlFor="title" className='mb-1 text-[14px] font-light text-base'>Title</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Enter the title of the meditation"
                                {...register("title", { required: "Title is required" })}
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
                                {...register("duration", {
                                    required: "Duration is required",
                                    pattern: {
                                        value: /^[0-9]{2}:[0-9]{2}$/,
                                        message: "Format must be mm:ss"
                                    }
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
                            {...register("description", { required: "Description is required" })}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
                    </div>
                </div>
            </div >

            <div>
                <Calendar24 handleSchedule={handleSchedule} errors={errors} />
                <input type="hidden" {...register('schedule')} />
            </div>

            {/* Action Buttons */}
            < div className="flex flex-col lg:flex-row justify-end gap-4 mt-12" >
                <Button
                    type="submit"
                    onClick={() => setSubmitType("now")}
                    disabled={loading}
                    className={` text-white px-8 py-2 ${loading ? 'bg-[#2b7272]/50 cursor-not-allowed' : 'bg-[#2b7272] hover:bg-[#1f5d57]'
                        }`}
                >
                    {loading && submitType === "now" ? 'Posting...' : 'Post Now'}
                </Button>

                <Button
                    type="submit"
                    onClick={() => setSubmitType("schedule")}
                    disabled={loading}
                    className={` text-white px-8 py-2 ${loading ? 'bg-[#fba515]/50 cursor-not-allowed' : 'bg-[#fba515] hover:bg-[#e8940f]'
                        }`}
                >
                    {loading && submitType === "premium" ? 'Scheduling...' : 'Save and Schedule'}
                </Button>
            </div >
        </form >

    )
}

export default AddMeditation
