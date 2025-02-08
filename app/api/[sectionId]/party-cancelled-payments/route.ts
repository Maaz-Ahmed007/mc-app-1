import { parse } from "date-fns"
import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const partyCancelledPaymentSchema = z.object({
  partyId: z.string(),
  sectionId: z.string(),
  date: z.string().transform((str) => {
    try {
      return parse(str, 'dd-MM-yyyy', new Date())
    } catch (error) {
      console.error("Date parsing error:", error)
      throw new Error("Invalid date format. Expected dd-MM-yyyy")
    }
  }),
  amount: z.number().positive(),
  details: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = partyCancelledPaymentSchema.parse(body)
   
    const payment = await prismadb.partyCancelledPayment.create({
      data: validatedData,
    })
   
    return NextResponse.json(payment)
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
      const payment = await prismadb.partyCancelledPayment.findUnique({ where: { id } })
      if (!payment) {
        return NextResponse.json({ error: "Cancelled Payment not found" }, { status: 404 })
      }
      return NextResponse.json(payment)
    } else if (sectionId) {
      const payments = await prismadb.partyCancelledPayment.findMany({
        where: { sectionId },
        orderBy: { date: 'desc' },
      })
      return NextResponse.json(payments)
    } else {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
 
  if (!id) {
    return NextResponse.json({ error: "Cancelled Payment ID is required" }, { status: 400 })
  }
  try {
    const body = await req.json()
    const validatedData = partyCancelledPaymentSchema.partial().parse(body)
   
    const updatedPayment = await prismadb.partyCancelledPayment.update({
      where: { id },
      data: validatedData,
    })
   
    return NextResponse.json(updatedPayment)
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
    return NextResponse.json({ error: "Cancelled Payment ID required" }, { status: 400 })
  }
  try {
    await prismadb.partyCancelledPayment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}