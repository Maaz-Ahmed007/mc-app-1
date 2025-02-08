import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { PartyClient } from "./client"
import { Payment, Party, Sale, CancelledPayment  } from "../columns"

const PartyPage = async ({
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
                where: {
                    sectionId: params.sectionId
                },
                orderBy: {
                    date: "desc"
                }
            },
            cancelledPayments: {
                where: {
                    sectionId: params.sectionId
                },
                orderBy: {
                    date: "desc"
                }
            },
            sales: {
                where: {
                    sectionId: params.sectionId
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

    const formattedPayments: Payment[] = party.payments.map(payment => ({
        id: payment.id,
        date: format(payment.date, "yyyy-MM-dd"),
        details: payment.details,
        amount: payment.amount,
        partyName: party.name
    }))

    const formattedCancelledPayments: CancelledPayment[] = party.cancelledPayments.map(payment => ({
        id: payment.id,
        date: format(payment.date, "yyyy-MM-dd"),
        details: payment.details,
        amount: payment.amount,
        partyName: party.name
    }))

    const formattedSales: Sale[] = party.sales.map(sale => ({
        id: sale.id,
        date: format(sale.date, "yyyy-MM-dd"),
        truckNumber: sale.truckNumber,
        truckWeight: sale.truckWeight,
        rate: sale.rate,
        total: sale.total,
        partyName: party.name
    }))

    // Calculate totals considering cancelled payments as debits
    const totalPayments = formattedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalCancelledPayments = formattedCancelledPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalSales = formattedSales.reduce((sum, sale) => sum + sale.total, 0)
    
    // Calculate final value: Credits (Payments) - Debits (Sales + Cancelled Payments)
    const netDebit = totalSales + totalCancelledPayments
    const finalValue = Math.abs(totalPayments - netDebit)
    const isFinalValueCredit = totalPayments > netDebit

    const formattedParty: Party = {
        id: party.id,
        name: party.name,
        payments: formattedPayments,
        cancelledPayments: formattedCancelledPayments,
        sales: formattedSales,
        finalValue,
        isFinalValueCredit
    }

    return (
        <div className="flex-col space-y-4 p-8 pt-6">
            <PartyClient
                party={formattedParty}
                sectionId={params.sectionId}
            />
        </div>
    )
}

export default PartyPage