import { prismadb } from "@/lib/prismadb"

import { MainPartyClient } from "./client"
import { MainParty } from "./columns"

const MainPartiesPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const parties = await prismadb.party.findMany({
        include: {
            payments: {
                orderBy: { date: "desc" }
            },
            cancelledPayments: {
                orderBy: { date: "desc" }
            },
            sales: {
                orderBy: { date: "desc" }
            }
        },
        orderBy: {
            name: "asc"
        }
    })
   
    const formattedParties: MainParty[] = parties.map(party => {
        const totalPayments = party.payments.reduce((sum, payment) => sum + payment.amount, 0)
        const totalCancelledPayments = party.cancelledPayments.reduce((sum, payment) => sum + payment.amount, 0)
        const totalSales = party.sales.reduce((sum, sale) => sum + sale.total, 0)
        
        // Calculate final value: Credits (Payments) - Debits (Sales + Cancelled Payments)
        const netDebit = totalSales + totalCancelledPayments
        const finalValue = Math.abs(totalPayments - netDebit)
        const isFinalValueCredit = totalPayments > netDebit
       
        return {
            id: party.id,
            name: party.name,
            totalPayments,
            totalCancelledPayments,
            totalSales,
            finalValue,
            isFinalValueCredit
        }
    })
   
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MainPartyClient data={formattedParties} />
            </div>
        </div>
    )
}

export default MainPartiesPage