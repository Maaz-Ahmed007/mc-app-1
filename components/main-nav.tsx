"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const params = useParams()
    const pathname = usePathname()

    const routes = [
        {
            href: `/${params.sectionId}/sales`,
            label: 'Sales',
            active: pathname === `/${params.sectionId}/sales`,
        },
        {
            href: `/${params.sectionId}/parties`,
            label: 'Parties',
            active: pathname === `/${params.sectionId}/parties`,
        },
        {
            href: `/${params.sectionId}/labors`,
            label: 'Labors',
            active: pathname === `/${params.sectionId}/labors`,
        },
        {
            href: `/${params.sectionId}/expenses`,
            label: 'Expenses',
            active: pathname === `/${params.sectionId}/expenses`,
        },
    ]

    const mainRoutes = [
        {
            href: `/${params.sectionId}/main-sales`,
            label: 'Main Sales',
            active: pathname === `/${params.sectionId}/main-sales`,
        },
        {
            href: `/${params.sectionId}/main-parties`,
            label: 'Main Parties',
            active: pathname === `/${params.sectionId}/main-parties`,
        }
    ]

    return (
        <nav
            className={cn(
                "flex items-center space-x-1 lg:space-x-2",
                className
            )}
            {...props}
        >
            <div className="flex items-center">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            "px-3 py-2 rounded-md",
                            route.active
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </div>

            <div className="h-6 w-px bg-muted-foreground/20 mx-2 lg:mx-4" />

            <div className="flex items-center">
                {mainRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            "px-3 py-2 rounded-md",
                            route.active
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </div>
        </nav>
    )
}