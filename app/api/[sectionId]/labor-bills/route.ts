import { isValid, parse } from "date-fns"
import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const laborBillSchema = z.object({
  laborId: z.string(),
  date: z.string().refine((dateStr) => {
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate);
  }, {
    message: "Invalid date format. Use YYYY-MM-DD"
  }).transform((dateStr) => {
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  }),
  amount: z.number().positive(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = laborBillSchema.parse(body)
   
    const bill = await prismadb.laborBill.create({
      data: {
        ...validatedData,
        date: validatedData.date,
      },
    })
   
    return NextResponse.json(bill)
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
      const bill = await prismadb.laborBill.findUnique({ where: { id } })
      if (!bill) {
        return NextResponse.json({ error: "Labor Bill not found" }, { status: 404 })
      }
      return NextResponse.json(bill)
    } else {
      const bills = await prismadb.laborBill.findMany({
        orderBy: { date: 'desc' },
      })
      return NextResponse.json(bills)
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
 
  if (!id) {
    return NextResponse.json({ error: "Labor Bill ID is required" }, { status: 400 })
  }
  try {
    const body = await req.json()
    const validatedData = laborBillSchema.partial().parse(body)
   
    const updatedBill = await prismadb.laborBill.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? validatedData.date : undefined,
      },
    })
   
    return NextResponse.json(updatedBill)
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
    return NextResponse.json({ error: "Labor Bill ID(s) required" }, { status: 400 })
  }
  try {
    await prismadb.laborBill.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}