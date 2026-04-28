'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { onboardingApis } from '@/lib/api';
import { toast } from 'sonner';

interface Tag {
    id: string;
    name: string;
}

interface OptionData {
    optionText: string;
    tags: Tag[];
}

interface QuestionFormData {
    id?: string;
    question: string;
    options: OptionData[];
}

interface Props {
    initialData?: Partial<QuestionFormData>;
    tagsList?: Tag[];
    closeModal: () => void;
    onUpdate?: (data: any) => void;
    onDelete?: (id: string) => void;
    onCreate?: (data: any) => void
}

export default function QuestionWithOptionsAndTags({
    initialData,
    tagsList = [],
    closeModal,
    onUpdate,
    onDelete,
    onCreate
}: Props) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors, isDirty },
    } = useForm<QuestionFormData>({
        defaultValues: {
            question: initialData?.question || '',
            options: initialData?.options || [
                { optionText: '', tags: [] },
                { optionText: '', tags: [] },
                { optionText: '', tags: [] },
                { optionText: '', tags: [] },
            ],
        },
    });

    const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
    const [showTagsIndexes, setShowTagsIndexes] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const clickedInsideAny = dropdownRefs.current.some(
                (ref) => ref && ref.contains(event.target as Node)
            );
            if (!clickedInsideAny) {
                setShowTagsIndexes([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function openDropdown(index: number) {
        setShowTagsIndexes((prev) => [...prev, index]);
    }

    function closeDropdown(index: number) {
        setShowTagsIndexes((prev) => prev.filter((i) => i !== index));
    }

    function isDropdownOpen(index: number) {
        return showTagsIndexes.includes(index);
    }

    function getFilteredTags(index: number, value: string) {
        setValue(`options.${index}.tag` as any, value);
        setFilteredTags(
            tagsList.filter((tag) =>
                tag?.name?.toLowerCase().includes(value.toLowerCase())
            )
        );
    }

    function handleTagSelect(index: number, tag: Tag) {
        const currentTags = getValues(`options.${index}.tags`) || [];
        if (!currentTags.find((t: Tag) => t.id === tag.id)) {
            setValue(`options.${index}.tags`, [...currentTags, tag], {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
        closeDropdown(index);
    }

    function removeTagSelect(index: number, tag: Tag) {
        const currentTags = getValues(`options.${index}.tags`) || [];
        const updatedTags = currentTags.filter((t: Tag) => t.id !== tag.id);
        setValue(`options.${index}.tags`, updatedTags, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    const onFormSubmit: SubmitHandler<QuestionFormData> = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                question: data.question,
                options: data.options.map((opt) => ({
                    option: opt.optionText,
                    tags: opt.tags.map((t) => t.id),
                })),
            };

            const apiUrl = initialData?.id
                ? onboardingApis.update(initialData.id)
                : onboardingApis.create;

            const response: any = await fetcher(apiUrl, {
                method: initialData?.id ? 'PUT' : 'POST',
                data: payload,
            });

            if (response) {
                toast.success('Saved successfully!', {
                    description: 'Your changes have been saved.',
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true,
                });
                initialData?.id ? onUpdate?.(response?.data) : onCreate?.(response.data);
            }
        } catch (error: any) {
            toast.error(
                error?.message || 'Failed to save the question. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
            closeModal();
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        setIsDeleting(true);
        try {
            const response: any = await fetcher(onboardingApis.delete(initialData.id), {
                method: 'DELETE',
            });

            if (response) {
                toast.success('Question deleted successfully.', {
                    description: 'Your changes have been saved.',
                    icon: <CheckCircle className="text-green-500 mr-4" />,
                    className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                    duration: 4000,
                    closeButton: true,
                });
                onDelete?.(initialData.id);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete question.');
        } finally {
            setIsDeleting(false);
            closeModal();
        }
    };

    const isFormBusy = isSubmitting || isDeleting;

    return (
        <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="font-rubik-400 space-y-4  mx-auto"
            noValidate
        >
            {/* Question */}
            <div>
                <Label htmlFor="question" className="text-[14px] font-light text-[#484848]">
                    Question
                </Label>
                <Input
                    id="question"
                    placeholder="Enter your question"
                    {...register('question', { required: 'Question is required' })}
                    aria-invalid={!!errors.question}
                    disabled={isFormBusy}
                />
                {errors.question && (
                    <p role="alert" className="text-red-500 text-sm mt-1">
                        {errors.question.message}
                    </p>
                )}
            </div>

            {/* Options with tags */}
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
                        <div>
                            <Label htmlFor={`optionText-${index}`} className="text-[14px] font-light text-[#484848]">
                                Option {index + 1}
                            </Label>
                            <Input
                                id={`optionText-${index}`}
                                placeholder={`Enter option ${index + 1}`}
                                {...register(`options.${index}.optionText`, {
                                    required: `Option ${index + 1} is required`,
                                })}
                                aria-invalid={!!errors.options?.[index]?.optionText}
                                disabled={isFormBusy}
                            />
                            {errors.options?.[index]?.optionText && (
                                <p role="alert" className="text-red-500 text-sm mt-1">
                                    {errors.options[index]?.optionText?.message}
                                </p>
                            )}
                        </div>

                        {/* Tag input */}
                        <div className="relative">
                            <Label htmlFor={`tag-${index}`} className="text-[14px] font-light text-[#484848]">
                                Tag {index + 1}
                            </Label>
                            <Input
                                id={`tag-${index}`}
                                placeholder="Select a tag"
                                autoComplete="off"
                                {...register(`options.${index}.tag` as any)}
                                onFocus={() => openDropdown(index)}
                                onChange={(e) => {
                                    getFilteredTags(index, e.target.value || '');
                                    openDropdown(index);
                                }}
                                aria-invalid={!!(errors.options?.[index] as any)?.tag}
                                disabled={isFormBusy}
                            />
                            {(errors.options?.[index] as any)?.tag && (
                                <p role="alert" className="text-red-500 text-sm mt-1">
                                    {(errors.options?.[index] as any)?.tag?.message}
                                </p>
                            )}

                            {isDropdownOpen(index) && (
                                <div
                                    ref={(el) => (dropdownRefs.current[index] = el) as any}
                                    className="absolute top-full mt-1 w-full bg-white border border-[#d9d9d9] rounded-md shadow-md max-h-60 overflow-y-auto z-10 hide-scrollbar"
                                >
                                    {filteredTags.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm text-gray-500 m-1">
                                            No tags found
                                        </div>
                                    ) : (
                                        filteredTags.slice(0, 5).map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md m-1 cursor-pointer capitalize font-rubik-400"
                                                onClick={() => handleTagSelect(index, tag)}
                                            >
                                                {tag.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {(getValues(`options.${index}.tags`) ?? []).map((tag: Tag, tagIndex: number) => (
                            <span
                                key={tagIndex}
                                className="font-rubik-400 inline-flex items-center text-xs text-[#2b7272] bg-white rounded-full border border-[#2b7272] px-2.5 py-0.5 capitalize"
                            >
                                {tag.name}
                                <button
                                    type="button"
                                    onClick={() => removeTagSelect(index, tag)}
                                    className="ml-2 hover:text-[#1f5d57]"
                                    disabled={isFormBusy}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            ))}

            {/* Footer buttons */}
            <div className="flex justify-end gap-2">
                {initialData?.id && (
                    <Button
                        type="button"
                        disabled={isFormBusy}
                        onClick={handleDelete}
                        className="font-rubik-400 bg-red-600 py-3 text-white flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 className="animate-spin w-5 h-5" />}
                        Delete
                    </Button>
                )}

                <Button
                    type="submit"
                    disabled={isFormBusy || !isDirty}
                    className="font-rubik-400 bg-[#2B7272] py-3 text-white hover:bg-[#1f5d57] flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
                    {initialData ? 'Update' : 'Submit'}
                </Button>
            </div>
        </form>
    );
}
