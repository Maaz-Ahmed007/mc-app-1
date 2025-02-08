import { ColumnDef } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"
import { cn, currencyFormat } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type MainParty = {
    id: string
    name: string
    totalPayments: number
    totalCancelledPayments: number
    totalSales: number
    finalValue: number
    isFinalValueCredit: boolean
}

export const mainPartyColumns = (
    onView: (id: string) => void
): ColumnDef<MainParty>[] => [
    { 
        accessorKey: 'name', 
        header: "Party Name" 
    },
    {
        accessorKey: 'totalPayments',
        header: "Total Payments",
        cell: ({ row }) => (
            <span className="text-green-600">
                {currencyFormat.format(row.original.totalPayments)}
            </span>
        )
    },
    {
        accessorKey: 'totalCancelledPayments',
        header: "Total Cancelled",
        cell: ({ row }) => (
            <span className="text-red-600">
                {currencyFormat.format(row.original.totalCancelledPayments)}
            </span>
        )
    },
    {
        accessorKey: 'totalSales',
        header: "Total Sales",
        cell: ({ row }) => (
            <span className="text-red-600">
                {currencyFormat.format(row.original.totalSales)}
            </span>
        )
    },
    {
        accessorKey: 'finalValue',
        header: "Final Value",
        cell: ({ row }) => (
            <span className={cn(
                row.original.isFinalValueCredit ? "text-green-600" : "text-red-600"
            )}>
                {currencyFormat.format(row.original.finalValue)} {row.original.isFinalValueCredit ? 'CR' : 'DR'}
            </span>
        )
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-end space-x-2 pr-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(row.original.id)}
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        )
    }
]