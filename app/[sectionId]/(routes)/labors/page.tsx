import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { LaborColumn, PaymentColumn, BillColumn } from "./columns"
import { LaborClient } from "./client" 

const LaborsPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const labors = await prismadb.labor.findMany({
        where: { sectionId: params.sectionId },
        include: {
            payments: true,
            bills: true
        },
        orderBy: { name: "asc" }
    })

    const formattedLabors: LaborColumn[] = labors.map((labor) => {
        const totalPayments = labor.payments.reduce((sum, payment) => sum + payment.amount, 0)
        const totalBills = labor.bills.reduce((sum, bill) => sum + bill.amount, 0)
        const finalValue = Math.abs(totalPayments - totalBills)
        const isFinalValueDebit = totalPayments > totalBills

        return {
            id: labor.id,
            name: labor.name,
            sectionId: labor.sectionId,
            finalValue,
            isFinalValueDebit,
            totalPayments,
            totalBills,
            paymentCount: labor.payments.length,
            billCount: labor.bills.length
        }
    })

    const formattedPayments: PaymentColumn[] = labors.flatMap(labor =>
        labor.payments.map(payment => ({
            id: payment.id,
            laborId: labor.id,
            laborName: labor.name,
            date: format(payment.date, "yyyy-MM-dd"),
            details: payment.details,
            amount: payment.amount
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const formattedBills: BillColumn[] = labors.flatMap(labor =>
        labor.bills.map(bill => ({
            id: bill.id,
            laborId: labor.id,
            laborName: labor.name,
            date: format(bill.date, "yyyy-MM-dd"),
            amount: bill.amount
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <LaborClient 
                    labors={formattedLabors} 
                    payments={formattedPayments}
                    bills={formattedBills}
                />
            </div>
        </div>
    )
}

export default LaborsPage