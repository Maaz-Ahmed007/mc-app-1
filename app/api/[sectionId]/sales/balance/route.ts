import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sectionId = searchParams.get('sectionId')
  const date = searchParams.get('date')

  if (!sectionId || !date) {
    return NextResponse.json({ error: "Section ID and date are required" }, { status: 400 })
  }

  try {
    const targetDate = new Date(date)
    const startOfCurrentMonth = startOfMonth(targetDate)
    const endOfPreviousMonth = endOfMonth(subMonths(startOfCurrentMonth, 1))
    
    // Calculate total sales up to the end of the previous month
    const totalSales = await prismadb.sale.aggregate({
      where: {
        sectionId,
        date: {
          lte: endOfPreviousMonth
        }
      },
      _sum: {
        total: true
      }
    })

    // Calculate total expenses up to the end of the previous month
    const totalExpenses = await prismadb.expensePayment.aggregate({
      where: {
        expense: {
          sectionId
        },
        date: {
          lte: endOfPreviousMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    // Calculate the cumulative balance
    const cumulativeBalance = (totalSales._sum.total || 0) - (totalExpenses._sum.amount || 0)

    // Get the last sale before the start of the current month
    const previousMonthSale = await prismadb.sale.findFirst({
      where: {
        sectionId,
        date: {
          lt: startOfCurrentMonth
        }
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        date: true
      }
    })

    return NextResponse.json({
      balance: cumulativeBalance,
      month: previousMonthSale?.date || null
    })
  } catch (error) {
    console.error("Error fetching previous balance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}