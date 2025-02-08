import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const laborSchema = z.object({
  name: z.string().min(1).transform(val => val.toUpperCase()),
  sectionId: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = laborSchema.parse(body)
   
    const labor = await prismadb.labor.create({
      data: validatedData,
    })
   
    return NextResponse.json(labor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const labor = await prismadb.labor.findUnique({ where: { id } })
      if (!labor) {
        return NextResponse.json({ error: "Labor not found" }, { status: 404 })
      }
      return NextResponse.json(labor)
    } else {
      const labors = await prismadb.labor.findMany({
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(labors)
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
 
  if (!id) {
    return NextResponse.json({ error: "Labor ID is required" }, { status: 400 })
  }
  try {
    const body = await req.json()
    const validatedData = laborSchema.partial().parse(body)
   
    const updatedLabor = await prismadb.labor.update({
      where: { id },
      data: validatedData,
    })
   
    return NextResponse.json(updatedLabor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: "Labor ID(s) required" }, { status: 400 })
  }
  try {
    await prismadb.labor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}