import { NextResponse } from "next/server"
import { prismadb, initializeDatabase } from "@/lib/prismadb"

export async function PATCH(
    req: Request,
    { params }: { params: { sectionId: string } }
) {
    try {
        await initializeDatabase()
        const body = await req.json()
        const { sectionName, telephone, mobileWazir, mobileDin, email, password, currentPassword } = body

        if (!sectionName) {
            return new NextResponse("Section name is required", { status: 400 })
        }
       
        if (!params.sectionId) {
            return new NextResponse("Section id is required", { status: 400 })
        }

        // Verify current password
        const currentSection = await prismadb.section.findUnique({
            where: { id: params.sectionId },
            select: { password: true }
        });

        if (!currentSection || currentSection.password !== currentPassword) {
            return new NextResponse("Invalid current password", { status: 401 })
        }
       
        const section = await prismadb.section.update({
            where: {
                id: params.sectionId
            },
            data: {
                sectionName,
                telephone,
                mobileWazir,
                mobileDin,
                email,
                ...(password && { password })
            }
        })
        return NextResponse.json(section)
       
    } catch (error) {
        console.error('[SECTION_PATCH]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { sectionId: string } }
) {
    try {
        await initializeDatabase()
        if (!params.sectionId) {
            return new NextResponse("Section id is required", { status: 400 })
        }
        const section = await prismadb.section.delete({
            where: {
                id: params.sectionId
            }
        })
       
        return NextResponse.json(section)
    } catch (error) {
        console.error('[SECTION_DELETE]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}