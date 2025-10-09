'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
    CheckCircle,
} from "lucide-react"
import { Label } from '@/components/ui/label'
import { fetcher } from '@/lib/fetcher'
import { apiUser, categoryApi, meditationApis } from '@/lib/api'
import CreateCategory from './_components/create_category'
import CreateSubCategory from './_components/create_subcategory'
import CreateTags from './_components/create_tags'
import { useParams, useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from '@/components/deleteAlert'
import HLSAudio from '@/components/hlsAudioPlayer'
import { format } from 'date-fns'

function MediationDetails() {
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
    const [meditation, setMeditation] = useState<any>(null)
    const [initalLoad, setInitalLoad] = useState(true)
    const [showCategory, setShowCategory] = useState(false)
    const [showedCategories, setShowCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState<any>('')
    const [showSubCategory, setShowSubCategory] = useState(false)
    const [showedSubCategories, setShowSubCategories] = useState<any[]>([])
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>('')
    const [showTags, setShowTags] = useState(false)
    const [showedTags, setShowedTags] = useState<any[]>([])
    const params = useParams()
    const meditationId = params?.id as string

    const { register, handleSubmit, setValue, getValues, reset, control, formState: { errors } } = useForm()

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const subCategoryRef = useRef<HTMLDivElement>(null);

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
            const previewUrl = URL.createObjectURL(file) // Create a temporary URL
            setFileName(previewUrl)
            setValue("file", file)
        }
    }


    const triggerUpload = () => {
        fileInputRef.current?.click()
    }

    const removeTag = (tagToRemove: any) => {
        setSelectedTags((prev: any) => prev.filter((tag: any) => tag.id !== tagToRemove.id))
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
            formData.append("type", selectedType); // assuming selectedType is like "audio"

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

            if (data.premium) {
                const isPremium = data.premium !== 'free';
                formData.set("isPremium", isPremium.toString());
            }

            selectedTags.forEach((tag: any, index: number) => {
                formData.append(`tags[${index}]`, tag.id);
            });

            const res = await fetcher(meditationApis.updateMeditaion(meditationId), { method: 'PATCH', data: formData });
            if (res) {
                toast.success('Meditation updated successfully!', {
                    description: 'Your changes have been saved.',
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true
                });
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true)
            setSubmitType('delete')
            const res = await fetcher(meditationApis.deleteMeditation(meditationId), { method: 'DELETE' })
            if (res) {
                toast.success('Meditation deleted successfully!', {
                    description: 'Your changes have been saved.',
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true
                });
                router.push('/dashboard/meditation')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, tagRes, meditationRes] = await Promise.allSettled([
                    fetcher(categoryApi.getAll, { method: 'GET' }),
                    fetcher(categoryApi.createTag, { method: 'GET' }),
                    fetcher(meditationApis.getMediation(meditationId), { method: 'GET' })
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

                if (meditationRes.status === 'fulfilled') {
                    const meditation = meditationRes.value as any;

                    // Set form values
                    setValue('id', meditation?.id
                    )
                    setValue('title', meditation.title || '');
                    setValue('description', meditation.description || '');
                    setValue('duration', meditation.duration || '');
                    setValue('category', meditation.category || null);
                    setValue('subcategory', meditation.subcategory || null);
                    setMeditation(meditation)


                    // Set selected type (audio, video, etc.)
                    setSelectedType(meditation.type || 'audio');

                    // Set selected tags
                    if (meditation.meditationTags && Array.isArray(meditation.meditationTags)) {
                        setSelectedTags(meditation?.meditationTags?.map((item: any) => item.tag));
                    }

                    // Set image preview (thumbnail URL)
                    if (meditation.thumbnail) {
                        setImagePreview(meditation.thumbnail);
                    }

                    // Set file name if possible (e.g. meditation.audioFileName)
                    if (meditation.link) {
                        setFileName(meditation.link);
                    }
                    if (meditation?.category) {
                        setValue('category', meditation?.category.name)
                        setSelectedCategory(meditation?.category)
                    }

                    if (meditation?.subcategory) {
                        setValue('subcategory', meditation?.subcategory.name)
                        const res = await fetcher(categoryApi.getAllsubcategory(meditation?.category?.id), { method: 'GET' })
                        setSubCategories(res)
                        setSelectedSubCategory(meditation?.subcategory)
                    }

                    if (typeof meditation?.isPremium == 'boolean') {
                        setValue('premium', meditation?.isPremium ? 'premium' : 'free')
                    }
                }

            } catch (error) {
                console.error('Unexpected fetch error:', error)
            } finally {
                setInitalLoad(false)
            }
        }

        fetchData()
    }, [])


    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowTags(false);
            }
        }

        if (showTags) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showTags, setShowTags]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                subCategoryRef.current &&
                !subCategoryRef.current.contains(event.target as Node)
            ) {
                setShowSubCategory(false);
            }
        }

        if (showSubCategory) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSubCategory, setShowSubCategory]);

    if (initalLoad) {
        return (
            <div className="flex flex-1 justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    return (
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="audio/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {fileName ? (
                                // Show audio filename + audio player
                                <div className="flex flex-col gap-2">
                                    {/* <audio controls className="w-full mt-1"
                                        key={fileName}
                                        controlsList="nodownload noplaybackrate"
                                    >
                                        <source src={fileName} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio> */}
                                    <HLSAudio fileName={fileName} />
                                    {/* Button to replace audio */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // setFileName(''); // reset filename to allow upload
                                            triggerUpload()
                                        }}
                                        className="text-sm text-[#2b7272] underline mt-1"
                                    >
                                        Replace Audio
                                    </button>
                                </div>
                            ) : (
                                // Show the input to select file
                                <>
                                    <Input
                                        type="text"
                                        value={fileName}
                                        placeholder="Select file"
                                        readOnly
                                        className='w-full cursor-pointer'
                                        onClick={triggerUpload}
                                    />
                                    {/* <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    /> */}
                                    <input type="hidden" {...register("file", { required: "Audio file is required" })} />
                                    {errors.file ? (
                                        <p className="text-red-500 text-sm mt-1">{errors.file.message as string}</p>
                                    ) : (
                                        <p className='text-[#777777] text-[12px]'>Upload (MP3 or MP4)</p>
                                    )}
                                </>
                            )}
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
                        <div className="relative w-full">
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
                                            className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 cursor-pointer capitalize font-rubik-400"
                                            onClick={() => onSelectCategory(item)}
                                        >
                                            {item.name}
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
                        <div className="relative w-full">
                            <Input
                                placeholder="Select a subcategory"
                                className="w-full"
                                onChange={(e) => subategoryChange(e.target.value)}
                                value={selectedSubCategory?.name || selectedSubCategory}
                            />

                            {showSubCategory && (
                                <div
                                    ref={subCategoryRef}
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
                                                className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 cursor-pointer capitalize font-rubik-400"
                                                onClick={() => onSelectSubCategory(item)}
                                            >
                                                {item.name}
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

                    <div className="relative w-full">
                        <Input
                            placeholder="Select a tag"
                            className="w-full"
                            onChange={(e) => tagsChange(e.target.value)}
                        />
                        {showTags && (
                            <div
                                ref={dropdownRef}
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
                                            className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 cursor-pointer capitalize font-rubik-400"
                                            onClick={() => onSelectTags(item)}
                                        >
                                            {item.name}
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
            </div>
            <div className='mt-6'>
                <label className="block text-base font-light text-[#000000] mb-2">Pricing Type</label>
                <Controller
                    name="premium"
                    control={control}
                    rules={{ required: "Pricing type is required" }}
                    defaultValue=""
                    render={({ field }) => (
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger id="premium" className="w-full">
                                <SelectValue placeholder="Select access type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free" className='font-rubik-400'>Free</SelectItem>
                                <SelectItem value="premium" className='font-rubik-400'>Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.premium && <p className="text-red-500 text-sm mt-1">{errors.premium.message as string}</p>}
            </div>
            {
                !meditation?.active && meditation?.scheduledAt &&
                <div className='my-2 mx-1'>
                    <p className='text-sm text-green-500'>Scheduled on date: {format(new Date(meditation?.scheduledAt), 'EEEE, dd MMMM yyyy HH:mm:ss')}</p>
                </div>
            }

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row justify-end gap-4 mt-12">
                <ConfirmDeleteDialog onConfirm={handleDelete} trigger={<Button
                    type="button"
                    disabled={loading}
                    className={` text-white px-8 py-2 ${loading ? 'bg-red-500/50 cursor-not-allowed' : 'bg-red-600 '
                        }`}
                >
                    {loading && submitType == 'delete' ? 'Deleting...' : 'Delete'}
                </Button>
                } />


                <Button
                    type="submit"
                    disabled={loading}
                    className={` text-white px-8 py-2 ${loading ? 'bg-[#fba515]/50 cursor-not-allowed' : 'bg-[#fba515] hover:bg-[#e8940f]'
                        }`}
                    onClick={() => setSubmitType('update')}
                >
                    {loading && submitType == 'update' ? 'Updating...' : 'Update Meditation'}
                </Button>
            </div>
        </form >

    )
}

export default MediationDetails
