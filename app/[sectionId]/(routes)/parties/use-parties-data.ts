import axios from "axios"
import toast from "react-hot-toast"
import { useCallback, useEffect, useMemo, useState } from "react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

interface PaymentBase {
    id: string
    date: string
    amount: number
    details: string
}

interface Party {
    id: string
    name: string
    payments: PaymentBase[]
    cancelledPayments: PaymentBase[]
    sales: {
        id: string
        date: string
        total: number
    }[]
}

interface LaborData {
    id: string
    name: string
    payments: PaymentBase[]
    bills?: {
        id: string
        date: string
        amount: number
    }[]
}

interface ExpenseData {
    id: string
    name: string
    payments: {
        id: string
        date: string
        amount: number
    }[]
}

interface SalesData {
    id: string
    date: string
    balance: number
    total: number
}

export interface FinalValueItem {
    id: string
    name: string
    finalValue: number
    isFinalValueCredit: boolean
    type: 'party' | 'labor' | 'sales' | 'cashbook'
}

export const usePartiesData = (
    parties: Party[],
    labors: LaborData[],
    expenses: ExpenseData[],
    salesData: SalesData[],
    salesBalances: {
        previousBalance: number;
        previousBalanceMonth: Date | null;
    },
    currentDate: Date,
    sectionId: string
) => {
    const [balances, setBalances] = useState({
        previousBalance: 0,
        previousBalanceMonth: null as Date | null,
    })

    const fetchPreviousBalances = useCallback(async () => {
        if (!currentDate || !sectionId) return;

        try {
            const response = await axios.get(`/api/${sectionId}/parties/balance`, {
                params: { 
                    sectionId, 
                    date: format(currentDate, 'yyyy-MM-dd')
                }
            })

            setBalances({
                previousBalance: response.data.balance || 0,
                previousBalanceMonth: response.data.month ? new Date(response.data.month) : null,
            })
        } catch (error) {
            console.error("Error fetching previous balances:", error)
            toast.error("Failed to fetch previous balances")
        }
    }, [currentDate, sectionId])

    useEffect(() => {
        fetchPreviousBalances()
    }, [fetchPreviousBalances])

    return useMemo(() => {
        const startDate = startOfMonth(currentDate)
        const endDate = endOfMonth(currentDate)

        // Modified to check if date is less than or equal to end of selected month
        const isUpToCurrentMonth = (date: string) => {
            const parsedDate = parseISO(date)
            return parsedDate <= endDate
        }

        // For other calculations that need only current month
        const isInCurrentMonth = (date: string) => {
            const parsedDate = parseISO(date)
            return parsedDate >= startDate && parsedDate <= endDate
        }

        // 1. Monthly parties calculations - Updated to use cumulative values
        const monthlyParties = parties.map(party => {
            // Get all payments up to current month
            const cumulativePayments = party.payments.filter(p => isUpToCurrentMonth(p.date))
            const cumulativeCancelledPayments = party.cancelledPayments?.filter(p => isUpToCurrentMonth(p.date)) || []
            const cumulativeSales = party.sales.filter(s => isUpToCurrentMonth(s.date))

            const totalPayments = cumulativePayments.reduce((sum, p) => sum + p.amount, 0)
            const totalCancelled = cumulativeCancelledPayments.reduce((sum, p) => sum + p.amount, 0)
            const totalSales = cumulativeSales.reduce((sum, s) => sum + s.total, 0)

            // Debit = Sales + Cancelled Payments
            const totalDebits = totalSales + totalCancelled
            // Credit = Payments
            const totalCredits = totalPayments

            const finalValue = Math.abs(totalCredits - totalDebits)
            const isFinalValueCredit = totalCredits > totalDebits

            return {
                id: party.id,
                name: party.name,
                finalValue,
                isFinalValueCredit,
                type: 'party' as const
            }
        }).filter(party => party.finalValue > 0)

        // 2. Monthly labors calculations - Updated to use cumulative values
        const monthlyLabors = labors.map(labor => {
            // Get all payments and bills up to current month
            const cumulativePayments = labor.payments.filter(p => isUpToCurrentMonth(p.date))
            const cumulativeBills = (labor.bills || []).filter(b => isUpToCurrentMonth(b.date))

            const totalPayments = cumulativePayments.reduce((sum, p) => sum + p.amount, 0)
            const totalBills = cumulativeBills.reduce((sum, b) => sum + b.amount, 0)

            // Debit = Payments
            const totalDebits = totalPayments
            // Credit = Bills
            const totalCredits = totalBills

            const finalValue = Math.abs(totalCredits - totalDebits)
            const isFinalValueCredit = totalCredits > totalDebits

            return {
                id: labor.id,
                name: labor.name,
                finalValue,
                isFinalValueCredit,
                type: 'labor' as const
            }
        }).filter(labor => labor.finalValue > 0)

        // 3. Sales Balance calculation remains the same - only for current month
        const currentMonthSales = parties.flatMap(party =>
            party.sales
                .filter(s => isInCurrentMonth(s.date))
                .reduce((sum, s) => sum + s.total, 0)
        ).reduce((sum, amount) => sum + amount, 0)

        const currentMonthExpenses = expenses.flatMap(expense =>
            expense.payments
                .filter(p => isInCurrentMonth(p.date))
                .reduce((sum, p) => sum + p.amount, 0)
        ).reduce((sum, amount) => sum + amount, 0)

        const remainingSales = currentMonthSales - currentMonthExpenses
        const finalSalesBalance = salesBalances.previousBalance >= 0 
            ? remainingSales + salesBalances.previousBalance 
            : remainingSales - Math.abs(salesBalances.previousBalance)

        let salesFinalBalance: FinalValueItem | null = null
        
        if (currentMonthSales > 0 || currentMonthExpenses > 0) {
            salesFinalBalance = {
                id: 'sales',
                name: 'Sales',
                finalValue: Math.abs(finalSalesBalance),
                isFinalValueCredit: finalSalesBalance >= 0,
                type: 'sales' as const
            }
        }

        // 4. Cashbook calculations remain the same - only for current month
        const partyPayments = parties.flatMap(party => 
            party.payments
                .filter(p => isInCurrentMonth(p.date))
                .map(payment => ({
                    ...payment,
                    name: party.name,
                    type: 'credit' as const
                }))
        )

        const cancelledPayments = parties.flatMap(party => 
            (party.cancelledPayments || [])
                .filter(p => isInCurrentMonth(p.date))
                .map(payment => ({
                    ...payment,
                    name: party.name,
                    type: 'debit' as const,
                    isCancelled: true
                }))
        )

        const laborBills = labors.flatMap(labor => 
            (labor.bills || [])
                .filter(b => isInCurrentMonth(b.date))
                .map(bill => ({
                    date: bill.date,
                    name: labor.name,
                    amount: bill.amount,
                    details: 'Labor Bill',
                    isBill: true,
                    type: 'credit' as const
                }))
        )

        const laborAndExpensePayments = [
            ...labors.flatMap(labor => 
                labor.payments
                    .filter(p => isInCurrentMonth(p.date))
                    .map(payment => ({
                        ...payment,
                        name: labor.name,
                        type: 'debit' as const,
                        isLabor: true
                    }))
            ),
            ...expenses.flatMap(expense => 
                expense.payments
                    .filter(p => isInCurrentMonth(p.date))
                    .map(payment => ({
                        ...payment,
                        name: expense.name,
                        details: 'Expense',
                        type: 'debit' as const,
                        isExpense: true
                    }))
            )
        ]

        const totalPartyPayments = partyPayments.reduce((sum, p) => sum + p.amount, 0)
        const totalCancelledPayments = cancelledPayments.reduce((sum, p) => sum + p.amount, 0)
        const totalLaborBills = laborBills.reduce((sum, b) => sum + b.amount, 0)
        const totalLaborAndExpensePayments = laborAndExpensePayments.reduce((sum, p) => sum + p.amount, 0)

        const totalCredits = totalPartyPayments + totalLaborBills
        const totalDebits = totalLaborAndExpensePayments + totalCancelledPayments
        
        const cashbookRemainingBalance = totalCredits - totalDebits
        const cashbookFinalBalance = balances.previousBalance + cashbookRemainingBalance
        const isCashbookFinalBalanceCredit = cashbookFinalBalance >= 0

        // Sort all transactions by date later
        const sortByDate = (a: { date: string }, b: { date: string }) => 
            parseISO(b.date).getTime() - parseISO(a.date).getTime()

        return {
            monthlyParties,
            monthlyLabors,
            monthlySales: salesFinalBalance ? [salesFinalBalance] : [],
            cashbookData: {
                partyPayments,
                cancelledPayments,
                laborAndExpensePayments,
                laborBills,
                totalPartyPayments,
                totalCancelledPayments,
                totalLaborBills,
                totalLaborAndExpensePayments,
                totalCredits,
                totalDebits,
                cashbookRemainingBalance,
                cashbookFinalBalance,
                isCashbookFinalBalanceCredit
            },
            previousBalance: balances.previousBalance,
            previousBalanceMonth: balances.previousBalanceMonth,
            salesBalances: {
                previousBalance: salesBalances.previousBalance,
                previousBalanceMonth: salesBalances.previousBalanceMonth
            }
        }
    }, [parties, labors, expenses, salesData, salesBalances, currentDate, balances])
}