'use client'

import { Button } from '@/components/ui'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type EmptyStateProps = {
    title?: string
    description?: string
    actionText?: string
    actionHref?: string
    icon?: React.ReactNode
    showAction?: boolean
}

const EmptyState = ({
    title = "No posts yet",
    description = "Be the first to share your thoughts and experiences.",
    actionText = "Create Post",
    actionHref = "/editor",
    icon,
    showAction = true
}: EmptyStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 rounded-full bg-muted/50 p-6"
            >
                {icon || <FileText className="h-12 w-12 text-muted-foreground" />}
            </motion.div>

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl font-semibold mb-2"
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-muted-foreground mb-6 max-w-md"
            >
                {description}
            </motion.p>

            {showAction && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link
                        href={actionHref}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        {actionText}
                    </Link>
                </motion.div>
            )}
        </motion.div>
    )
}

export default EmptyState
