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
    Trash2,
} from "lucide-react"
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { fetcher } from '@/lib/fetcher'
import { apiUser, categoryApi, meditationApis } from '@/lib/api'
import CreateCategory from './_components/create_category'
import CreateSubCategory from './_components/create_subcategory'
import CreateTags from './_components/create_tags'
import { useRouter } from 'next/navigation'
import { Calendar24 } from './_components/date-scheduler'

function AddMeditation() {
    const router = useRouter()
    const [selectedType, setSelectedType] = useState("audio")
    const [tags, setTags] = useState<any>([])
    const [selectedTags, setSelectedTags] = useState<any>([])
    const [categories, setCategories] = useState<any>([])
    const [subcategories, setSubCategories] = useState<any>([])
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [submitType, setSubmitType] = useState('')
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState("")
    const [showCategory, setShowCategory] = useState(false)
    const [showedCategories, setShowCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState<any>('')
    const [showSubCategory, setShowSubCategory] = useState(false)
    const [showedSubCategories, setShowSubCategories] = useState<any[]>([])
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>('')
    const [showTags, setShowTags] = useState(false)
    const [showedTags, setShowedTags] = useState<any[]>([])
    const [pendingDelete, setPendingDelete] = useState<{ type: 'category' | 'subcategory' | 'tag'; id: string; name: string } | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const subCategoryRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

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

            // Auto-calculate duration from audio metadata
            const url = URL.createObjectURL(file)
            const audio = new Audio(url)
            audio.addEventListener('loadedmetadata', () => {
                const totalSeconds = Math.round(audio.duration)
                const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
                const secs = String(totalSeconds % 60).padStart(2, '0')
                setValue('duration', `${mins}:${secs}`, { shouldValidate: true })
                URL.revokeObjectURL(url)
            })
        }
    }

    const triggerUpload = () => {
        fileInputRef.current?.click()
    }

    const removeTag = (tagToRemove: any) => {
        setSelectedTags((prev: any) => prev.filter((tag: any) => tag.id !== tagToRemove.id))
    }

    const confirmDelete = async () => {
        if (!pendingDelete) return
        setDeleteLoading(true)
        const { type, id } = pendingDelete
        try {
            if (type === 'category') {
                await fetcher(categoryApi.deleteCategory(id), { method: 'DELETE' })
                setCategories((prev: any) => prev.filter((c: any) => c.id !== id))
                setShowCategories((prev: any) => prev.filter((c: any) => c.id !== id))
                if (selectedCategory?.id === id) { setSelectedCategory(''); setValue('category', '') }
                toast.success('Category deleted successfully')
            } else if (type === 'subcategory') {
                await fetcher(categoryApi.deleteSubCategory(id), { method: 'DELETE' })
                setSubCategories((prev: any) => prev.filter((c: any) => c.id !== id))
                setShowSubCategories((prev: any) => prev.filter((c: any) => c.id !== id))
                if (selectedSubCategory?.id === id) { setSelectedSubCategory(''); setValue('subcategory', '') }
                toast.success('Subcategory deleted successfully')
            } else {
                await fetcher(categoryApi.deleteTag(id), { method: 'DELETE' })
                setTags((prev: any) => prev.filter((t: any) => t.id !== id))
                setShowedTags((prev: any) => prev.filter((t: any) => t.id !== id))
                setSelectedTags((prev: any) => prev.filter((t: any) => t.id !== id))
                toast.success('Tag deleted successfully')
            }
        } finally {
            setDeleteLoading(false)
            setPendingDelete(null)
        }
    }

    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("duration", data.duration);
            formData.append("isPremium", submitType === "premium" ? "true" : "false");
            formData.append("active", "true");
            formData.append("active", "true");
            formData.append("schedule", data.schedule); // assuming selectedType is like "audio"

            const audioFile = fileInputRef.current?.files?.[0];
            if (audioFile) {
                formData.append("audioFile", audioFile);
            }

            // Append image file (thumbnail)
            const imageFile = imageInputRef.current?.files?.[0];
            if (imageFile) {
                formData.append("thumbnail", imageFile);
            }


            if (data.file) {
                formData.append("file", data.file);
            }

            if (data.category) {
                formData.append("categoryId", selectedCategory.id);
            }

            if (data.subcategory) {
                formData.append("subcategoryId", selectedSubCategory.id);
            }


            formData.append('tags', JSON.stringify({ tags: selectedTags.map((item: any) => item.id) }));

            const res = await fetcher(meditationApis.create, { method: 'POST', data: formData });
            if (res) {
                router.push("/dashboard/meditation")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

    };


    const addCategory = (item: any) => {
        setCategories((prev: any) => [item, ...prev])
    }

    const addSubCategory = (item: any) => {
        setSubCategories((prev: any) => [item, ...prev])
    }

    const categoryChange = (value: string) => {
        setShowCategory(true);
        setSelectedCategory(value)
        setShowCategories(
            categories.filter((item: any) =>
                item.name.toLowerCase().includes(value.trim().toLowerCase())
            )
        )
    }

    const onSelectCategory = async (value: any) => {
        try {
            setSelectedCategory(value)
            setShowCategory(false)
            setValue('category', value?.name, { shouldValidate: true })
            reset({ subcategory: '' })
            setSelectedSubCategory('')
            const res = await fetcher(categoryApi.getAllsubcategory(value.id), { method: 'GET' })
            setSubCategories(res)
        } catch (error) {
            setSubCategories([])
        }
    }

    const onSelectSubCategory = (value: any) => {
        setSelectedSubCategory(value)
        setShowSubCategory(false)
        setValue('subcategory', value?.name, { shouldValidate: true })
    }

    const subategoryChange = (value: string) => {
        setShowSubCategory(true);
        setSelectedSubCategory(value)
        setShowSubCategories(
            subcategories.filter((item: any) =>
                item.name.toLowerCase().includes(value.trim().toLowerCase())
            )
        )
    }

    const onSelectTags = (value: any) => {
        setSelectedTags((prev: any) => [value, ...prev]);
        setShowTags(false)
    }

    const tagsChange = (value: string) => {
        setShowTags(true);
        setShowedTags(
            tags.filter((item: any) =>
                item.name.toLowerCase().includes(value.trim().toLowerCase())
            )
        )
    }

    const handleSchedule = (schedule: any) => {
        setValue('schedule', schedule.toString())
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, tagRes] = await Promise.allSettled([
                    fetcher(categoryApi.getAll, { method: 'GET' }),
                    fetcher(categoryApi.createTag, { method: 'GET' })
                ])

                if (categoryRes.status === 'fulfilled') {
                    setCategories(categoryRes.value)
                } else {
                    console.error('Category fetch failed:', categoryRes.reason)
                }

                if (tagRes.status === 'fulfilled') {
                    setTags(tagRes.value)
                } else {
                    console.error('Tag fetch failed:', tagRes.reason)
                }

            } catch (error) {
                console.error('Unexpected fetch error:', error)
            }
        }

        fetchData()
    }, [])

    // Close all dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setShowCategory(false);
            }
            if (subCategoryRef.current && !subCategoryRef.current.contains(event.target as Node)) {
                setShowSubCategory(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowTags(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <>
            <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{pendingDelete?.name}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 p-3 mx-2 my-4 bg-white rounded-[20px] font-rubik-400">

                {/* Select Type */}
                <div className="mb-6">
                    <h3 className="text-[16px] font-rubik-400 font-medium text-[#000000] mb-4">Select Type</h3>
                    <div className="flex gap-4">
                        <Badge className='p-1 px-2 border-2 bg-[#DDF3E5] text-[#2B7272] font-rubik-500 rounded-full text-[12px]' >
                            <Volume2 className='h-12 w-12' /> Audio
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
                                    placeholder="Enter duration in minutes eg. 09:08"
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
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 lg:mt-12">
                    {/* Category */}
                    <div>
                        <label className="block text-base font-light text-[#000000] mb-2">Category</label>
                        <div className="relative lg:flex gap-2 w-full">
                            <div ref={categoryRef} className="relative w-full">
                                <Input
                                    placeholder="Select a category"
                                    className="w-full"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => categoryChange(e.target.value)}
                                    value={selectedCategory?.name || selectedCategory}
                                />

                                {showCategory && < div className="absolute top-full mt-1 w-full bg-white border hide-scrollbar  border-[#d9d9d9] rounded-md shadow-md max-h-60 overflow-y-auto z-10">
                                    {showedCategories.slice(0, 3).length > 0 ? (
                                        showedCategories.slice(0, 3).map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 capitalize font-rubik-400"
                                            >
                                                <span className="cursor-pointer flex-1" onClick={() => onSelectCategory(item)}>{item.name}</span>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setPendingDelete({ type: 'category', id: item.id, name: item.name }) }} className="text-red-400 hover:text-red-600 p-0.5 rounded flex-shrink-0"><Trash2 size={13} /></button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-2 py-2 text-sm text-gray-500 text-center font-rubik-400">
                                            No categories found
                                        </div>
                                    )}
                                </div>}
                            </div>

                            <div className="mt-2 lg:mt-0">
                                <CreateCategory addCategory={addCategory} />
                            </div>
                        </div>


                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>}
                        <input type="hidden" {...register("category", { required: "Category is required" })} />
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label className="block text-base font-light text-[#000000] mb-2">Sub Category</label>
                        <div className="relative lg:flex gap-2 w-full">
                            <div ref={subCategoryRef} className="relative w-full">
                                <Input
                                    placeholder="Select a subcategory"
                                    className="w-full"
                                    onChange={(e) => subategoryChange(e.target.value)}
                                    value={selectedSubCategory?.name || selectedSubCategory}
                                />

                                {showSubCategory && (
                                    <div
                                        className="absolute top-full mt-1 w-full bg-white border hide-scrollbar border-[#d9d9d9] rounded-md shadow-md max-h-60 overflow-y-auto z-10"
                                    >
                                        {showedSubCategories.length === 0 ? (
                                            <div className="px-2 py-1.5 text-sm text-gray-500 m-1">
                                                No subcategory found
                                            </div>
                                        ) : (
                                            showedSubCategories.slice(0, 3).map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 capitalize font-rubik-400"
                                                >
                                                    <span className="cursor-pointer flex-1" onClick={() => onSelectSubCategory(item)}>{item.name}</span>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); setPendingDelete({ type: 'subcategory', id: item.id, name: item.name }) }} className="text-red-400 hover:text-red-600 p-0.5 rounded flex-shrink-0"><Trash2 size={13} /></button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                            </div>

                            <div className="mt-2 lg:mt-0">
                                <CreateSubCategory addCategory={addSubCategory} categoryId={selectedCategory.id} />
                            </div>
                        </div>
                        {errors.subcategory && <p className="text-red-500 text-sm mt-1">{errors.subcategory.message as string}</p>}
                        <input type="hidden" {...register("subcategory", { required: "Subcategory is required" })} />
                    </div>
                </div>

                {/* Tags */}
                <div className="mt-8">
                    <label className="block text-base font-light text-[#000000] mb-2">Tags</label>

                    <div className="relative lg:flex gap-2 w-full">

                        <div ref={dropdownRef} className="relative w-full">
                            <Input
                                placeholder="Select a tag"
                                className="w-full"
                                onChange={(e) => tagsChange(e.target.value)}
                            />
                            {showTags && (
                                <div
                                    className="absolute top-full mt-1 w-full bg-white border hide-scrollbar border-[#d9d9d9] rounded-md shadow-md max-h-60 overflow-y-auto z-10"
                                >
                                    {showedTags.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm text-gray-500 m-1">
                                            No tags found
                                        </div>
                                    ) : (
                                        showedTags.slice(0, 3).map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 capitalize font-rubik-400"
                                            >
                                                <span className="cursor-pointer flex-1" onClick={() => onSelectTags(item)}>{item.name}</span>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setPendingDelete({ type: 'tag', id: item.id, name: item.name }) }} className="text-red-400 hover:text-red-600 p-0.5 rounded flex-shrink-0"><Trash2 size={13} /></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-2 lg:mt-0">
                            <CreateTags addCategory={(val: any) => {
                                setSelectedTags((prev: any) => [val, ...prev]);
                                setTags((prev: any) => [val, ...prev])
                            }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap my-2">
                        {
                            selectedTags.map((tag: any, index: number) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="font-rubik-400 text-[#2b7272] bg-white rounded-full border border-[#2b7272] px-3 py-1 capitalize"
                                >
                                    {tag.name}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-[#1f5d57]">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))
                        }
                    </div>
                    <Calendar24 handleSchedule={handleSchedule} errors={errors} />
                    <input type="hidden" {...register('schedule')} />
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row justify-end gap-4 mt-12">
                    <Button
                        type="submit"
                        onClick={() => setSubmitType("free")}
                        disabled={loading}
                        className={`w-full lg:w-44 text-white px-8 py-2 ${loading ? 'bg-[#2b7272]/50 cursor-not-allowed' : 'bg-[#2b7272] hover:bg-[#1f5d57]'
                            }`}
                    >
                        {loading && submitType === "free" ? 'Publishing...' : 'Publish as Free'}
                    </Button>

                    <Button
                        type="submit"
                        onClick={() => setSubmitType("premium")}
                        disabled={loading}
                        className={`w-full lg:w-44 text-white px-8 py-2 ${loading ? 'bg-[#fba515]/50 cursor-not-allowed' : 'bg-[#fba515] hover:bg-[#e8940f]'
                            }`}
                    >
                        {loading && submitType === "premium" ? 'Publishing...' : 'Publish as Premium'}
                    </Button>
                </div>
            </form >
        </>
    )
}

export default AddMeditation
