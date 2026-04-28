'use client';

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';

import { ReactNode } from 'react';

interface CustomModalProps {
    title?: string;
    description?: string;
    trigger?: ReactNode; // Trigger element (e.g., button)
    children: ReactNode; // Modal body content
    footer?: ReactNode;  // Optional footer content
    open?: boolean;      // Optional controlled open state
    onOpenChange?: (open: boolean) => void; // Callback when open state changes
}

export function CustomModal({
    title,
    description,
    trigger,
    children,
    footer,
    open,
    onOpenChange,
}: CustomModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="flex flex-col max-h-[90vh] p-0 gap-0 sm:max-w-2xl max-w-5xl">
                <DialogHeader className="px-6 pt-6 pb-3 border-b flex-shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">{children}</div>

                {footer && <div className="px-6 pb-5 pt-3 border-t flex-shrink-0">{footer}</div>}
            </DialogContent>
        </Dialog>
    );
}
