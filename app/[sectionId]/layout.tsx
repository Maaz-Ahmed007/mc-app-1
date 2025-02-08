import { redirect } from "next/navigation"

import { prismadb }from "@/lib/prismadb"

import NavbarServer from "@/components/navbar-server"

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { sectionId: string }
}) {
    const section = await prismadb.section.findFirst({
        where: {
            id: params.sectionId
        }
    })

    if (!section) {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex flex-col">
            <NavbarServer />
            <main className="flex-grow pt-16">
                {children}
            </main>
            {/* Footer if needed */}
        </div>
    )
}