import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { MainPartyView } from "./view"

const MainPartyPage = async ({
    params
}: {
    params: { sectionId: string, partyId: string }
}) => {
    const party = await prismadb.party.findUnique({
        where: {
            id: params.partyId,
        },
        include: {
            payments: {
                include: {
                    section: true
                },
                orderBy: {
                    date: "desc"
                }
            },
            cancelledPayments: {
                include: {
                    section: true
                },
                orderBy: {
                    date: "desc"
                }
            },
            sales: {
                include: {
                    section: true
                },
                orderBy: {
                    date: "desc"
                }
            }
        }
    })

    if (!party) {
        return <div>Party not found</div>
    }

    const formattedPayments = party.payments.map(payment => ({
        id: payment.id,
        date: format(payment.date, "yyyy-MM-dd"),
        details: payment.details,
        amount: payment.amount,
        sectionName: payment.section.sectionName
    }))

    const formattedCancelledPayments = party.cancelledPayments.map(payment => ({
        id: payment.id,
        date: format(payment.date, "yyyy-MM-dd"),
        details: payment.details,
        amount: payment.amount,
        sectionName: payment.section.sectionName
    }))

    const formattedSales = party.sales.map(sale => ({
        id: sale.id,
        date: format(sale.date, "yyyy-MM-dd"),
        truckNumber: sale.truckNumber,
        truckWeight: sale.truckWeight,
        rate: sale.rate,
        total: sale.total,
        sectionName: sale.section.sectionName
    }))

    const totalPayments = formattedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalCancelledPayments = formattedCancelledPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalSales = formattedSales.reduce((sum, sale) => sum + sale.total, 0)

    // Calculate final value considering cancelled payments as debits
    const netDebit = totalSales + totalCancelledPayments
    const finalValue = Math.abs(totalPayments - netDebit)
    const isFinalValueCredit = totalPayments > netDebit

    return (
        <div className="flex-col space-y-4 p-8 pt-6">
            <MainPartyView
                party={{
                    id: party.id,
                    name: party.name,
                    payments: formattedPayments,
                    cancelledPayments: formattedCancelledPayments,
                    sales: formattedSales,
                    finalValue,
                    isFinalValueCredit
                }}
                sectionId={params.sectionId}
            />
        </div>
    )
}

export default MainPartyPage