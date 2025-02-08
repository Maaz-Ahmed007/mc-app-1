import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { PartiesClient } from "./client"
import { Party } from "./columns"

type DBParty = {
    id: string;
    name: string;
    payments: {
        id: string;
        date: Date;
        details: string;
        amount: number;
    }[];
    cancelledPayments: {
        id: string;
        date: Date;
        details: string;
        amount: number;
    }[];
    sales: {
        id: string;
        date: Date;
        truckNumber: string;
        truckWeight: number;
        rate: number;
        total: number;
    }[];
};

type DBLabor = {
    id: string;
    name: string;
    payments: {
        id: string;
        date: Date;
        details: string;
        amount: number;
    }[];
    bills: {
        id: string;
        date: Date;
        amount: number;
    }[];
};

type DBExpense = {
    id: string;
    name: string;
    payments: {
        id: string;
        date: Date;
        amount: number;
    }[];
};

type DBSale = {
    id: string;
    date: Date;
    balance: number;
    total: number
};

const PartiesPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const [parties, labors, expenses, sales] = await Promise.all([
        prismadb.party.findMany({
            include: {
                payments: {
                    where: {
                        sectionId: params.sectionId
                    }
                },
                cancelledPayments: {
                    where: {
                        sectionId: params.sectionId
                    }
                },
                sales: {
                    where: {
                        sectionId: params.sectionId
                    },
                    include: {
                        party: true
                    }
                },
            },
            orderBy: {
                name: "asc"
            }
        }),
        prismadb.labor.findMany({
            where: { sectionId: params.sectionId },
            include: { payments: true, bills: true },
            orderBy: { name: "asc" }
        }),
        prismadb.expense.findMany({
            where: { sectionId: params.sectionId },
            include: { payments: true },
            orderBy: { name: "asc" }
        }),
        prismadb.sale.findMany({
            where: { sectionId: params.sectionId },
            select: {
                id: true,
                date: true,
                balance: true,
                total: true  // Add total field
            },
            orderBy: { date: 'desc' }
        })
    ]) as [DBParty[], DBLabor[], DBExpense[], DBSale[]]
   
    const formattedParties: Party[] = parties.map(party => {
        const totalPayments = party.payments.reduce((sum, payment) => sum + payment.amount, 0)
        const totalCancelledPayments = party.cancelledPayments.reduce((sum, payment) => sum + payment.amount, 0)
        const totalSales = party.sales.reduce((sum, sale) => sum + sale.total, 0)
        
        const netDebit = totalSales + totalCancelledPayments
        const finalValue = Math.abs(totalPayments - netDebit)
        const isFinalValueCredit = totalPayments > netDebit

        return {
            id: party.id,
            name: party.name,
            payments: party.payments.map(payment => ({
                id: payment.id,
                date: format(payment.date, "yyyy-MM-dd"),
                details: payment.details,
                amount: payment.amount,
                partyName: party.name
            })),
            cancelledPayments: party.cancelledPayments.map(payment => ({
                id: payment.id,
                date: format(payment.date, "yyyy-MM-dd"),
                details: payment.details,
                amount: payment.amount,
                partyName: party.name
            })),
            sales: party.sales.map(sale => ({
                id: sale.id,
                date: format(sale.date, "yyyy-MM-dd"),
                truckNumber: sale.truckNumber,
                truckWeight: sale.truckWeight,
                rate: sale.rate,
                total: sale.total,
                partyName: party.name
            })),
            finalValue,
            isFinalValueCredit
        }
    })

    const formattedLabors = labors.map(labor => ({
        id: labor.id,
        name: labor.name,
        payments: labor.payments.map(payment => ({
            id: payment.id,
            date: format(payment.date, "yyyy-MM-dd"),
            details: payment.details,
            amount: payment.amount
        })),
        bills: labor.bills.map(bill => ({
            id: bill.id,
            date: format(bill.date, "yyyy-MM-dd"),
            amount: bill.amount
        })),
    }))

    const formattedExpenses = expenses.map(expense => ({
        id: expense.id,
        name: expense.name,
        payments: expense.payments.map(payment => ({
            id: payment.id,
            date: format(payment.date, "yyyy-MM-dd"),
            amount: payment.amount
        }))
    }))

    const formattedSales = sales.map(sale => ({
        id: sale.id,
        date: format(sale.date, "yyyy-MM-dd"),
        balance: sale.balance,
        total: sale.total
    }))
   
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PartiesClient
                    data={formattedParties}
                    laborsData={formattedLabors}
                    expensesData={formattedExpenses}
                    salesData={formattedSales}
                />
            </div>
        </div>
    )
}

export default PartiesPage