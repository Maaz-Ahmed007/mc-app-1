import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { ExpenseColumn, PaymentColumn } from "./columns"
import { ExpenseClient } from "./client"

const ExpensesPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const expenses = await prismadb.expense.findMany({
        where: { sectionId: params.sectionId },
        include: {
            payments: true
        },
        orderBy: { name: "asc" }
    })
    const formattedExpenses: ExpenseColumn[] = expenses.map((expense) => ({
        id: expense.id,
        name: expense.name,
        sectionId: expense.sectionId,
        totalAmount: expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
        paymentCount: expense.payments.length
    }))
    const formattedPayments: PaymentColumn[] = expenses.flatMap(expense =>
        expense.payments.map(payment => ({
            id: payment.id,
            expenseId: expense.id,
            expenseName: expense.name,
            date: format(payment.date, "yyyy-MM-dd"),
            details: payment.details,
            amount: payment.amount
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ExpenseClient expenses={formattedExpenses} payments={formattedPayments} />
            </div>
        </div>
    )
}
export default ExpensesPage