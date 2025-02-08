import { NextResponse } from "next/server"
import { prismadb, initializeDatabase } from "@/lib/prismadb"

export async function POST(req: Request) {
    try {
        await initializeDatabase()
        const body = await req.json()
        const { sectionName, telephone, mobileWazir, mobileDin, email } = body

        if (!sectionName) {
            return new NextResponse("Section name is required", { status: 400 })
        }
       
        const section = await prismadb.section.create({
            data: {
                sectionName,
                telephone,
                mobileWazir,
                mobileDin,
                email,
                password: "0000" // Default password
            }
        })
        return NextResponse.json(section)
       
    } catch (error) {
        console.error('[SECTIONS_POST]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function GET() {
    try {
        console.log("API: Fetching sections");
        const sections = await prismadb.section.findMany({
            select: {
                id: true,
                sectionName: true,
                telephone: true,
                mobileWazir: true,
                mobileDin: true,
                email: true
            }
        });
        console.log("API: Sections fetched", sections);
        return NextResponse.json(sections);
    } catch (error) {
        console.error("API: Error fetching sections", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}