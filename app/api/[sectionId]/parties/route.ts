import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const partySchema = z.object({
  name: z.string().min(1).transform(val => val.toUpperCase()),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name } = partySchema.parse(body)
   
    const party = await prismadb.party.create({
      data: { name },
    })
    
    return NextResponse.json(party)
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
  const sectionId = searchParams.get('sectionId')

  try {
    if (id) {
      const party = await prismadb.party.findUnique({ where: { id } })
      if (!party) {
        return NextResponse.json({ error: "Party not found" }, { status: 404 })
      }
      return NextResponse.json(party)
    } else {
      const parties = await prismadb.party.findMany({
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(parties)
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: "Party ID is required" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const validatedData = partySchema.partial().parse(body)
    
    const updatedParty = await prismadb.party.update({
      where: { id },
      data: validatedData,
    })
    
    return NextResponse.json(updatedParty)
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
    return NextResponse.json({ error: "Party ID required" }, { status: 400 })
  }

  try {
    // Check if the party has any payments or sales
    const paymentsCount = await prismadb.partyPayment.count({ where: { partyId: id } })
    const salesCount = await prismadb.sale.count({ where: { partyId: id } })

    if (paymentsCount > 0 || salesCount > 0) {
      return NextResponse.json({ error: "Cannot delete party with existing payments or sales" }, { status: 400 })
    }

    await prismadb.party.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}