import { z } from "zod"
import { prismadb } from "@/lib/prismadb"
import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth } from "date-fns"

const saleSchema = z.object({
  sectionId: z.string(),
  partyId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  truckNumber: z.string().transform(val => val.toUpperCase()),
  truckWeight: z.number().positive(),
  rate: z.number().int().positive(),
  total: z.number().int().positive().optional(),
  balance: z.number().int().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = saleSchema.parse(body)
   
    const total = Math.round(validatedData.truckWeight * validatedData.rate)
   
    const startOfCurrentMonth = startOfMonth(validatedData.date)

    // Get the previous balance
    const previousSale = await prismadb.sale.findFirst({
      where: { 
        sectionId: validatedData.sectionId,
        date: { lt: startOfCurrentMonth }
      },
      orderBy: { date: 'desc' },
      select: { balance: true }
    })

    const previousBalance = previousSale?.balance || 0

    // Calculate the new balance
    const newBalance = previousBalance + total

    const sale = await prismadb.sale.create({
      data: {
        ...validatedData,
        total,
        balance: newBalance,
      },
    })

    // Update all subsequent sales
    await prismadb.$executeRaw`
      UPDATE Sale
      SET balance = balance + ${total}
      WHERE sectionId = ${validatedData.sectionId}
        AND date > ${sale.date}
    `
   
    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error creating sale:", error)
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
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!sectionId) {
    return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
  }

  try {
    if (id) {
      const sale = await prismadb.sale.findUnique({ 
        where: { id, sectionId },
        include: { party: true }
      })
      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 })
      }
      return NextResponse.json(sale)
    } else {
      const where: any = { sectionId }
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }

      const sales = await prismadb.sale.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { party: true }
      })
      return NextResponse.json(sales)
    }
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const sectionId = searchParams.get('sectionId')
 
  if (!id || !sectionId) {
    return NextResponse.json({ error: "Sale ID and Section ID are required" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const validatedData = saleSchema.partial().parse(body)
   
    const currentSale = await prismadb.sale.findUnique({ where: { id } })
    if (!currentSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    let newTotal = validatedData.total
    if (validatedData.truckWeight && validatedData.rate) {
      newTotal = Math.round(validatedData.truckWeight * validatedData.rate)
    }

    const balanceDifference = (newTotal || currentSale.total) - currentSale.total

    const updatedSale = await prismadb.sale.update({
      where: { id, sectionId },
      data: {
        ...validatedData,
        total: newTotal,
        balance: { increment: balanceDifference }
      },
    })

    // Update all subsequent sales
    await prismadb.$executeRaw`
      UPDATE Sale
      SET balance = balance + ${balanceDifference}
      WHERE sectionId = ${sectionId}
        AND date > ${updatedSale.date}
    `
   
    return NextResponse.json(updatedSale)
  } catch (error) {
    console.error("Error updating sale:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const sectionId = searchParams.get('sectionId')

  if (!id || !sectionId) {
    return NextResponse.json({ error: "Sale ID and Section ID are required" }, { status: 400 })
  }

  try {
    const deletedSale = await prismadb.sale.delete({
      where: { id, sectionId }
    })

    // Update all subsequent sales
    await prismadb.$executeRaw`
      UPDATE Sale
      SET balance = balance - ${deletedSale.total}
      WHERE sectionId = ${sectionId}
        AND date > ${deletedSale.date}
    `
   
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}