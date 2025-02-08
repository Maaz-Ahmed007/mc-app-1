import { ColumnDef } from "@tanstack/react-table"
import { PencilRuler, Trash, Plus, ExternalLink } from "lucide-react"
import { currencyFormat, dateFormat } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type Payment = {
    id: string
    date: string
    details: string
    amount: number
    partyName: string
}

export type CancelledPayment = {
    id: string
    date: string
    details: string
    amount: number
    partyName: string
}

export type Sale = {
    id: string
    date: string
    truckNumber: string
    truckWeight: number
    rate: number
    total: number
    partyName: string
}

export type Party = {
    id: string
    name: string
    payments: Payment[]
    cancelledPayments: CancelledPayment[]
    sales: Sale[]
    finalValue: number
    isFinalValueCredit: boolean
}

export const paymentColumns = (
    onEdit: (payment: Payment) => void,
    onDelete: (id: string) => void
): ColumnDef<Payment>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.original.date)
    },
    {
        accessorKey: 'details',
        header: "Details",
        cell: ({ row }: { row: { original: Payment } }) => row.original.details
    },
    {
        accessorKey: 'amount',
        header: "Amount",
        cell: ({ row }) => currencyFormat.format(row.original.amount)
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
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(row.original.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        )
    }
]

export const cancelledPaymentColumns = (
    onEdit: (payment: CancelledPayment) => void,
    onDelete: (id: string) => void
): ColumnDef<CancelledPayment>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.original.date)
    },
    {
        accessorKey: 'details',
        header: "Details",
        cell: ({ row }) => row.original.details
    },
    {
        accessorKey: 'amount',
        header: "Amount",
        cell: ({ row }) => currencyFormat.format(row.original.amount)
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
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(row.original.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        )
    }
]

export const saleColumns = (): ColumnDef<Sale>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.original.date)
    },
    { accessorKey: 'truckNumber', header: "Truck Number" },
    {
        accessorKey: 'truckWeight',
        header: "Truck Weight",
        cell: ({ row }) => `${row.original.truckWeight.toFixed(3)} tons`
    },
    {
        accessorKey: 'rate',
        header: "Rate",
        cell: ({ row }) => currencyFormat.format(row.original.rate)
    },
    {
        accessorKey: 'total',
        header: "Total",
        cell: ({ row }) => currencyFormat.format(row.original.total)
    }
]

export const partyColumns = (
    onAddPayment: (party: Party) => void,
    onEdit: (party: Party) => void,
    onDelete: (id: string) => void,
    onView: (id: string) => void
): ColumnDef<Party>[] => [
    { accessorKey: 'name', header: "Party Name" },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-end space-x-2 pr-4">
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
                    onClick={() => onEdit(row.original)}
                >
                    <PencilRuler className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(row.original.id)}
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
        )
    }
]