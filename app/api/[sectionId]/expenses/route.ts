import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { z } from "zod"

const expenseSchema = z.object({
  name: z.string().min(1).transform(val => val.toUpperCase()),
  sectionId: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = expenseSchema.parse(body)
   
    const expense = await prismadb.expense.create({
      data: validatedData,
    })
   
    return NextResponse.json(expense)
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
      const expense = await prismadb.expense.findUnique({ where: { id } });
      if (!expense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }
      return NextResponse.json(expense);
    } else {
      const expenses = await prismadb.expense.findMany({
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(expenses);
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
 
  if (!id) {
    return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
  }
  try {
    const body = await req.json()
    const validatedData = expenseSchema.partial().parse(body)
   
    const updatedExpense = await prismadb.expense.update({
      where: { id },
      data: validatedData,
    })
   
    return NextResponse.json(updatedExpense)
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
    return NextResponse.json({ error: "Expense ID required" }, { status: 400 })
  }
  try {
    await prismadb.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}