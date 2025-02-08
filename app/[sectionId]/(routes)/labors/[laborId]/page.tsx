import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { LaborPaymentsClient } from "./client"

const LaborPage = async ({
    params
}: {
    params: { sectionId: string, laborId: string }
}) => {
    const labor = await prismadb.labor.findUnique({
        where: {
            id: params.laborId,
            sectionId: params.sectionId
        },
        include: {
            payments: {
                orderBy: { date: "asc" }
            },
            bills: {
                orderBy: { date: "asc" }
            }
        }
    })

    if (!labor) return <div>Labor not found</div>

    const formattedLabor = {
        id: labor.id,
        name: labor.name.toUpperCase(),
        sectionId: labor.sectionId,
        payments: labor.payments.map(payment => ({
            id: payment.id,
            date: format(payment.date, "yyyy-MM-dd"),
            details: payment.details,
            amount: payment.amount,
        })),
        bills: labor.bills.map(bill => ({
            id: bill.id,
            date: format(bill.date, "yyyy-MM-dd"),
            amount: bill.amount,
        }))
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <LaborPaymentsClient labor={formattedLabor} />
        </div>
    )
}

export default LaborPage