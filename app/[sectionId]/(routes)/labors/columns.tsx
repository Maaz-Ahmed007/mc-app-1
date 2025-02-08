import { ColumnDef } from "@tanstack/react-table"
import { currencyFormat, dateFormat } from '@/lib/utils'
import { PencilRuler, Trash, Plus, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"

export type LaborColumn = {
    id: string
    name: string
    sectionId: string
    finalValue: number
    isFinalValueDebit: boolean
    totalPayments: number
    totalBills: number
    paymentCount: number
    billCount: number
}

export type PaymentColumn = {
    id: string
    laborId: string
    laborName: string
    date: string
    details: string
    amount: number
}

export type BillColumn = {
    id: string
    laborId: string
    laborName: string
    date: string
    amount: number
}

export const finalListColumns: ColumnDef<LaborColumn>[] = [
    {
        accessorKey: 'name',
        header: "Labor Name",
    },
    {
        accessorKey: "totalPayments",
        header: "Total Payments (DR)",
        cell: ({ row }) => currencyFormat.format(row.original.totalPayments)
    },
    {
        accessorKey: "totalBills",
        header: "Total Bills (CR)",
        cell: ({ row }) => currencyFormat.format(row.original.totalBills)
    },
    {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => {
            const balance = Math.abs(row.original.totalPayments - row.original.totalBills)
            const isDebit = row.original.totalPayments > row.original.totalBills
            return (
                <div className={isDebit ? 'text-red-600' : 'text-green-600'}>
                    {currencyFormat.format(balance)} {isDebit ? 'DR' : 'CR'}
                </div>
            )
        }
    },
]

export const laborColumns = (
    onEdit: (labor: LaborColumn) => void,
    onDelete: (id: string) => void,
    onAddPayment: (labor: LaborColumn) => void,
    onAddBill: (labor: LaborColumn) => void,
    onOpenLaborPage: (id: string) => void
): ColumnDef<LaborColumn>[] => [
    {
        accessorKey: 'name',
        header: "Labor Name",
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
                    variant="outline"
                    size="sm"
                    onClick={() => onAddPayment(row.original)}
                >
                    <Plus className="h-4 w-4" /> Payment
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddBill(row.original)}
                >
                    <Plus className="h-4 w-4" /> Bill
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenLaborPage(row.original.id)}
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
        accessorKey: 'laborName',
        header: "Labor Name",
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

export const billColumns = (
    onEdit: (bill: BillColumn) => void,
    onDelete: (id: string) => void
): ColumnDef<BillColumn>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.getValue('date'))
    },
    {
        accessorKey: 'laborName',
        header: "Labor Name",
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