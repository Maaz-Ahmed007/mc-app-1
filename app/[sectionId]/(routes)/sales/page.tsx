import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { SaleColumn } from "./columns"
import { SaleClient } from "./client"
const SalesPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const [sales, parties, expensePayments] = await Promise.all([
        prismadb.sale.findMany({
            where: { sectionId: params.sectionId },
            orderBy: { date: "asc" },
            include: { party: true }
        }),
        prismadb.party.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true }
        }),
        prismadb.expensePayment.findMany({
            where: { expense: { sectionId: params.sectionId } },
            include: { expense: true }
        })
    ])

    const formattedSales: SaleColumn[] = sales.map((item) => ({
        id: item.id,
        date: format(item.date, "yyyy-MM-dd"),
        partyId: item.partyId,
        partyName: item.party.name,
        truckNumber: item.truckNumber,
        truckWeight: item.truckWeight,
        rate: item.rate,
        totalAmount: item.total,
        balance: item.balance
    }))

    const formattedExpensePayments = expensePayments.map((payment) => ({
        id: payment.id,
        date: format(payment.date, "yyyy-MM-dd"),
        expenseName: payment.expense.name,
        amount: payment.amount
    }))
   
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SaleClient
                    data={formattedSales}
                    parties={parties}
                    expensePayments={formattedExpensePayments}
                />
            </div>
        </div>
    )
}
export default SalesPage