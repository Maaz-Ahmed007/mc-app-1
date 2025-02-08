import { currencyFormat, dateFormat } from '@/lib/utils'
import { PencilRuler, Trash, Plus, ExternalLink } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

export type ExpenseColumn = {
    id: string
    name: string
    sectionId: string
    totalAmount?: number
}

export type PaymentColumn = {
    id: string
    expenseId: string
    expenseName: string
    date: string
    details: string
    amount: number
}

export const finalListColumns: ColumnDef<ExpenseColumn>[] = [
    {
        accessorKey: 'name',
        header: "Expense Name",
    },
    {
        accessorKey: 'totalAmount',
        header: "Total Amount",
        cell: ({ row }) => {
            const totalAmount = row.original.totalAmount || 0
            return (
                <div className="text-red-600">
                    {currencyFormat.format(totalAmount)} DR
                </div>
            )
        }
    },
]

export const expenseColumns = (
    onEdit: (expense: ExpenseColumn) => void,
    onDelete: (id: string) => void,
    onAddPayment: (expense: ExpenseColumn) => void,
    onOpenExpensePage: (id: string) => void
): ColumnDef<ExpenseColumn>[] => [
    {
        accessorKey: 'name',
        header: "Expense Name",
        cell: ({ row }) => <div className="pl-4">{row.getValue('name')}</div>
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-end space-x-2 pr-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                >
                    <PencilRuler className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddPayment(row.original)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenExpensePage(row.original.id)}
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(row.original.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
]

export const paymentColumns = (
    onEdit: (payment: PaymentColumn) => void,
    onDelete: (id: string) => void
): ColumnDef<PaymentColumn>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.getValue('date'))
    },
    {
        accessorKey: 'expenseName',
        header: "Expense Name",
    },
    {
        accessorKey: 'details',
        header: "Details",
    },
    {
        accessorKey: 'amount',
        header: "Amount",
        cell: ({ row }) => currencyFormat.format(row.getValue('amount'))
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                >
                    <PencilRuler className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(row.original.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
]