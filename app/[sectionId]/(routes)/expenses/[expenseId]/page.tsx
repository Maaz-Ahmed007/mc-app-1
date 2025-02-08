import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { ExpensePaymentsClient } from "./client"
const ExpensePage = async ({
    params
}: {
    params: { sectionId: string, expenseId: string }
}) => {
    const expense = await prismadb.expense.findUnique({
        where: {
            id: params.expenseId,
            sectionId: params.sectionId
        },
        include: {
            payments: {
                orderBy: { date: "desc" }
            }
        }
    })
    
    if (!expense) return <div>Expense not found</div>

    const formattedExpense = {
        id: expense.id,
        name: expense.name,
        sectionId: expense.sectionId,
        payments: expense.payments.map(payment => ({
            id: payment.id,
            date: format(payment.date, "yyyy-MM-dd"),
            details: payment.details,
            amount: payment.amount
        }))
    }
    return (
        <div className="flex-col space-y-4 p-8 pt-6">
            <ExpensePaymentsClient expense={formattedExpense} />
        </div>
    )
}
export default ExpensePage