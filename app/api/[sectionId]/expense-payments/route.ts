import { parse, isValid } from "date-fns"
import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const expensePaymentSchema = z.object({
  expenseId: z.string(),
  date: z.string().refine((dateStr) => {
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate);
  }, {
    message: "Invalid date format. Use YYYY-MM-DD"
  }).transform((dateStr) => {
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  }),
  amount: z.number().positive(),
  details: z.string()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = expensePaymentSchema.parse(body)
   
    const payment = await prismadb.expensePayment.create({
      data: {
        ...validatedData,
        date: validatedData.date,
      },
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

  try {
    if (id) {
      const payment = await prismadb.expensePayment.findUnique({ where: { id } })
      if (!payment) {
        return NextResponse.json({ error: "Expense Payment not found" }, { status: 404 })
      }
      return NextResponse.json(payment)
    } else {
      const payments = await prismadb.expensePayment.findMany({
        orderBy: { date: 'desc' },
      })
      return NextResponse.json(payments)
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
 
  if (!id) {
    return NextResponse.json({ error: "Expense Payment ID is required" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const validatedData = expensePaymentSchema.partial().parse(body)
   
    const updatedPayment = await prismadb.expensePayment.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? validatedData.date : undefined,
      },
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
    return NextResponse.json({ error: "Expense Payment ID required" }, { status: 400 })
  }
  
  try {
    await prismadb.expensePayment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}