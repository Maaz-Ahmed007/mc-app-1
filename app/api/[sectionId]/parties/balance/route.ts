import { NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const sectionId = searchParams.get('sectionId')
        const date = searchParams.get('date')

        if (!sectionId || !date) {
            return NextResponse.json(
                { error: "Section ID and date are required" },
                { status: 400 }
            )
        }

        const currentDate = parseISO(date)
        const previousMonth = subMonths(currentDate, 1)
        const startDate = startOfMonth(previousMonth)
        const endDate = endOfMonth(previousMonth)

        // Get all parties data for previous month
        const [parties, labors, expenses] = await Promise.all([
            prismadb.party.findMany({
                include: {
                    payments: {
                        where: {
                            sectionId,
                            date: {
                                lte: endDate,
                            }
                        }
                    },
                    cancelledPayments: {
                        where: {
                            sectionId,
                            date: {
                                lte: endDate,
                            }
                        }
                    },
                    sales: {
                        where: {
                            sectionId,
                            date: {
                                lte: endDate,
                            }
                        }
                    },
                },
            }),
            prismadb.labor.findMany({
                where: { 
                    sectionId,
                },
                include: { 
                    payments: {
                        where: {
                            date: {
                                lte: endDate,
                            }
                        }
                    },
                    bills: {
                        where: {
                            date: {
                                lte: endDate,
                            }
                        }
                    }
                },
            }),
            prismadb.expense.findMany({
                where: { 
                    sectionId,
                },
                include: { 
                    payments: {
                        where: {
                            date: {
                                lte: endDate,
                            }
                        }
                    }
                },
            })
        ])

        // Calculate total credits
        const totalPartyPayments = parties.reduce(
            (sum, party) => sum + party.payments.reduce((pSum, payment) => pSum + payment.amount, 0),
            0
        )

        const totalLaborBills = labors.reduce(
            (sum, labor) => sum + (labor.bills?.reduce((bSum, bill) => bSum + bill.amount, 0) || 0),
            0
        )

        // Calculate total debits
        const totalCancelledPayments = parties.reduce(
            (sum, party) => sum + party.cancelledPayments.reduce((cSum, payment) => cSum + payment.amount, 0),
            0
        )

        const totalLaborPayments = labors.reduce(
            (sum, labor) => sum + labor.payments.reduce((pSum, payment) => pSum + payment.amount, 0),
            0
        )

        const totalExpensePayments = expenses.reduce(
            (sum, expense) => sum + expense.payments.reduce((pSum, payment) => pSum + payment.amount, 0),
            0
        )

        // Final calculations
        const totalCredits = totalPartyPayments + totalLaborBills
        const totalDebits = totalLaborPayments + totalExpensePayments + totalCancelledPayments
        const balance = totalCredits - totalDebits

        return NextResponse.json({
            balance,
            month: format(previousMonth, 'MMMM yyyy'),
            details: {
                credits: {
                    partyPayments: totalPartyPayments,
                    laborBills: totalLaborBills,
                    total: totalCredits
                },
                debits: {
                    laborPayments: totalLaborPayments,
                    expensePayments: totalExpensePayments,
                    cancelledPayments: totalCancelledPayments,
                    total: totalDebits
                }
            }
        })
    } catch (error) {
        console.error("[BALANCE_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}