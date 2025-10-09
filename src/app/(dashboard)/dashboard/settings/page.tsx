'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@radix-ui/react-label'
import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/fetcher'
import Loader from '@/components/loader'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

function Settings() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res: any = await fetcher("/settings")
                if (res?.data) {
                    reset({
                        tagline: res.data.tagline || '',
                        currentVersion: res.data.currentVersion || '',
                        supportEmail: res.data.supportEmail || '',
                        releaseNote: res.data.releaseNote || '',
                        adminEmail: res.data.adminEmail || '',
                    })
                }
            } catch (error) {
                // console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [reset])

    const onSubmit = async (data: any) => {
        try {
            setSaving(true)
            const res = await fetcher("/settings", {
                method: "POST",
                data: data,
            })
            toast.success('Settings saved successfully!', {
                description: 'Your changes have been saved.',
                icon: <CheckCircle className="text-green-500 mr-4" />,
                className: 'bg-green-50 text-green-900 border font-rubik-400 px-3 border-green-200',
                duration: 4000,
                closeButton: true
            });
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-1 justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 font-rubik-400">
            <div className="bg-white w-full rounded-[20px] p-6 shadow">
                <h3 className="text-[16px] font-bold text-[#000000] mb-4">
                    General Settings
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div>
                        {/* App Tagline */}
                        <div className="mb-4">
                            <Label htmlFor="tagline" className="text-[14px] font-light text-[#484848] text-base">
                                App Tagline *
                            </Label>
                            <Input
                                id="tagline"
                                placeholder="Enter the app tagline"
                                {...register('tagline', {
                                    required: 'Tagline is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Tagline must be at least 3 characters',
                                    },
                                })}
                            />
                            {errors?.tagline ?
                                <p className="text-red-500 text-sm mt-1">{errors?.tagline?.message as string}</p>
                                :
                                <p className='text-sm mt-1 text-[#777777]'>Shown on Subscription page and marketing banners</p>
                            }
                        </div>

                        {/* Support Email */}
                        <div className="mb-4">
                            <Label htmlFor="supportEmail" className="text-[14px] font-light text-[#484848] text-base">
                                Support Email *
                            </Label>
                            <Input
                                id="supportEmail"
                                placeholder="Enter support email"
                                {...register('supportEmail', {
                                    required: 'Support email is required',
                                    pattern: {
                                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                        message: 'Invalid email format',
                                    },
                                })}
                            />
                            {errors.supportEmail && (
                                <p className="text-red-500 text-sm mt-1">{errors.supportEmail.message as string}</p>
                            )}
                        </div>

                        {/* Admin Email */}
                        <div className="mb-4">
                            <Label htmlFor="adminEmail" className="text-[14px] font-light text-[#484848] text-base">
                                Admin Email *
                            </Label>
                            <Input
                                id="adminEmail"
                                placeholder="Enter admin email"
                                {...register('adminEmail', {
                                    required: 'Admin email is required',
                                    pattern: {
                                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                        message: 'Invalid email format',
                                    },
                                })}
                            />
                            {errors.adminEmail && (
                                <p className="text-red-500 text-sm mt-1">{errors.adminEmail.message as string}</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Version */}
                        <div className="mb-4">
                            <Label htmlFor="currentVersion" className="text-[14px] font-light text-[#484848] text-base">
                                Current Version *
                            </Label>
                            <Input
                                id="currentVersion"
                                placeholder="Enter current version"
                                {...register('currentVersion', {
                                    required: 'Current version is required',
                                })}
                            />
                            {errors.currentVersion && (
                                <p className="text-red-500 text-sm mt-1">{errors.currentVersion.message as string}</p>
                            )}
                        </div>

                        {/* Release Note */}
                        <div className="mb-4">
                            <Label htmlFor="releaseNote" className="text-[14px] font-light text-[#484848] text-base">
                                Release Note
                            </Label>
                            <Textarea
                                id="releaseNote"
                                placeholder="Enter release notes"
                                {...register('releaseNote')}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        className={`w-full lg:w-44 text-white px-8 py-2 bg-[#2b7272] hover:bg-[#1f5d57] ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default Settings
