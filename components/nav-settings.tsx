"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"
import { useParams, usePathname } from "next/navigation"

export function NavSettings({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const params = useParams()
    const pathname = usePathname()
    const isActive = pathname === `/${params.sectionId}/settings`

    return (
        <Link
            href={`/${params.sectionId}/settings`}
            className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground",
                className
            )}
            {...props}
        >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
        </Link>
    )
}