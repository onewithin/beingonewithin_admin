"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function Calendar24({
    handleSchedule,
    errors,
    defaultDate,
}: {
    handleSchedule: (schedule: Date) => void
    errors: any
    defaultDate?: Date
}) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(defaultDate)

    const pad = (num: number) => num.toString().padStart(2, "0")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = new Date()
    const currentTimeStr = now.toTimeString().split(" ")[0]
    const minTime = date && date.toDateString() === today.toDateString() ? currentTimeStr : "00:00:00"

    const getInitialTime = () => {
        if (defaultDate) {
            return `${pad(defaultDate.getHours())}:${pad(defaultDate.getMinutes())}:${pad(defaultDate.getSeconds())}`
        }
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
        return `${pad(oneHourLater.getHours())}:${pad(oneHourLater.getMinutes())}:${pad(oneHourLater.getSeconds())}`
    }

    const [time, setTime] = React.useState(getInitialTime)

    React.useEffect(() => {
        if (date && time) {
            const [hours, minutes, seconds] = time.split(":").map(Number)
            const scheduled = new Date(date)
            scheduled.setHours(hours)
            scheduled.setMinutes(minutes)
            scheduled.setSeconds(seconds)
            handleSchedule(scheduled)
        }
    }, [date, time])

    return (
        <>
            <Label className="text-[14px] font-light text-base mb-1 mt-8">
                Schedule Posting
            </Label>
            <div className="flex gap-4 font-rubik-400">
                <div className="flex flex-col gap-3 flex-1">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker"
                                className="w-full justify-between font-normal"
                            >
                                {date
                                    ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
                                    : "Select date"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(d) => {
                                    setDate(d)
                                    setOpen(false)
                                }}
                                disabled={{ before: today }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.schedule && (
                        <p className="text-red-500 text-sm">{errors.schedule.message as string}</p>
                    )}
                </div>
                <div className="flex flex-col gap-3 flex-1">
                    <Input
                        type="time"
                        id="time-picker"
                        step="1"
                        min={minTime}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>
        </>
    )
}
