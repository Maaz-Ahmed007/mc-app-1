import { cn, currencyFormat } from "@/lib/utils"
import { format, parseISO } from 'date-fns'

import { DataTable } from "@/components/data-table"
import { CardTotal } from "@/components/card-total"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
    date: string
    name: string
    amount: number
    details: string
    isExpense?: boolean
    isBill?: boolean
    isCancelled?: boolean
}

interface CashbookTabProps {
    partyPayments: Payment[]
    laborBills: Payment[]
    laborAndExpensePayments: Payment[]
    cancelledPayments: Payment[]
    totalPartyPayments: number
    totalLaborBills: number
    totalLaborAndExpensePayments: number
    totalCancelledPayments: number
    previousBalance: number
    previousBalanceMonth: Date | null
    cashbookRemainingBalance: number
    cashbookFinalBalance: number
    isCashbookFinalBalanceCredit: boolean
}

export const CashbookTab: React.FC<CashbookTabProps> = ({
    partyPayments,
    laborBills,
    laborAndExpensePayments,
    cancelledPayments,
    totalPartyPayments,
    totalLaborBills,
    totalLaborAndExpensePayments,
    totalCancelledPayments,
    previousBalance,
    previousBalanceMonth,
    cashbookRemainingBalance,
    cashbookFinalBalance,
    isCashbookFinalBalanceCredit
}) => {
    const EXPENSE_SYMBOL = 'ε'
    const BILL_SYMBOL = 'β'
    const CANCELLED_SYMBOL = '✕'

    const creditsColumns = [
        { 
            accessorKey: 'date', 
            header: "Date",
            cell: ({ row }: { row: { original: Payment } }) => format(parseISO(row.original.date), 'dd-MM-yyyy')
        },
        { 
            accessorKey: 'name', 
            header: "Name",
            cell: ({ row }: { row: { original: Payment } }) => (
                <div className="flex items-center">
                    {row.original.name}
                    {row.original.isBill && <span className="ml-1 text-blue-500">{BILL_SYMBOL}</span>}
                </div>
            )
        },
        {
            accessorKey: 'details',
            header: "Details",
        },
        { 
            accessorKey: 'amount', 
            header: "Amount",
            cell: ({ row }: { row: { original: Payment } }) => (
                <span className="text-green-600">
                    {currencyFormat.format(row.original.amount)}
                </span>
            )
        },
    ]

    const debitsColumns = [
        { 
            accessorKey: 'date', 
            header: "Date",
            cell: ({ row }: { row: { original: Payment } }) => format(parseISO(row.original.date), 'dd-MM-yyyy')
        },
        { 
            accessorKey: 'name', 
            header: "Name",
            cell: ({ row }: { row: { original: Payment } }) => (
                <div className="flex items-center">
                    {row.original.name}
                    {row.original.isExpense && <span className="ml-1 text-yellow-500">{EXPENSE_SYMBOL}</span>}
                    {row.original.isCancelled && <span className="ml-1 text-red-500">{CANCELLED_SYMBOL}</span>}
                </div>
            )
        },
        {
            accessorKey: 'details',
            header: "Details",
        },
        { 
            accessorKey: 'amount', 
            header: "Amount",
            cell: ({ row }: { row: { original: Payment } }) => (
                <span className="text-red-600">
                    {currencyFormat.format(row.original.amount)}
                </span>
            )
        },
    ]

    // Calculate totals
    const totalCredits = totalPartyPayments + totalLaborBills
    const totalDebits = totalLaborAndExpensePayments + totalCancelledPayments

    // Prepare data
    const allCredits = [...partyPayments, ...laborBills]
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

    const allDebits = [...laborAndExpensePayments, ...cancelledPayments]
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

    // Calculation breakdown
    const calculationBreakdown = [
        { 
            description: "Total Credits", 
            amount: totalCredits,
            type: 'CR',
            isTotal: true
        },
        { 
            description: "Total Debits", 
            amount: -totalDebits,
            type: 'DR',
            isTotal: true
        },
        { 
            description: "Remaining Balance", 
            amount: cashbookRemainingBalance,
            type: cashbookRemainingBalance >= 0 ? 'CR' : 'DR'
        },
        { 
            description: "Previous Balance",
            amount: previousBalance,
            type: previousBalance >= 0 ? 'CR' : 'DR'
        },
        { 
            description: "Final Balance", 
            amount: cashbookFinalBalance,
            type: isCashbookFinalBalanceCredit ? 'CR' : 'DR',
            isFinal: true
        },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Credits Section */}
                <div className="space-y-4">
                    <h2 className="text-lg flex justify-center font-semibold">Credits</h2>
                    <DataTable
                        columns={creditsColumns}
                        data={allCredits}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>

                {/* Debits Section */}
                <div className="space-y-4">
                    <h2 className="text-lg flex justify-center font-semibold">Debits</h2>
                    <DataTable
                        columns={debitsColumns}
                        data={allDebits}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CardTotal
                    header="Total Credits"
                    value={totalCredits}
                    type="money"
                    isDebit={false}
                />
                <CardTotal
                    header="Total Debits"
                    value={totalDebits}
                    type="money"
                    isDebit={true}
                />
            </div>

            {/* Calculations Summary */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {calculationBreakdown.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className={cn(
                                        "transition-colors",
                                        item.isTotal && "font-semibold border-t border-b",
                                        item.isFinal && "font-bold text-lg"
                                    )}
                                >
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className={cn(
                                        "text-right",
                                        item.amount >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {currencyFormat.format(Math.abs(item.amount))} {item.type}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}