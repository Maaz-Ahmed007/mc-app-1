import { ColumnDef } from "@tanstack/react-table"
import { PencilRuler, Trash } from "lucide-react"
import { currencyFormat, dateFormat, weightFormat } from '@/lib/utils'

import { Button } from "@/components/ui/button"

export interface MainSaleColumn {
    id: string
    date: string
    partyId: string
    sectionId: string
    partyName: string
    sectionName: string
    truckNumber: string
    truckWeight: number
    rate: number
    totalAmount: number
}

export const columns = (
    onEdit: (sale: MainSaleColumn) => void,
    onDelete: (id: string) => void
): ColumnDef<MainSaleColumn>[] => [
    {
        accessorKey: 'date',
        header: "Date",
        cell: ({ row }) => dateFormat(row.original.date)
    },
    {
        accessorKey: 'partyName',
        header: "Party"
    },
    {
        accessorKey: 'sectionName',
        header: "Section"
    },
    {
        accessorKey: 'truckNumber',
        header: "Truck Number"
    },
    {
        accessorKey: 'truckWeight',
        header: "Truck Weight",
        cell: ({ row }) => `${weightFormat(row.original.truckWeight)} tons`
    },
    {
        accessorKey: 'rate',
        header: "Rate",
        cell: ({ row }) => currencyFormat.format(row.original.rate)
    },
    {
        accessorKey: 'totalAmount',
        header: "Total Amount",
        cell: ({ row }) => currencyFormat.format(row.original.totalAmount)
    },
    {
        id: "actions",
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
        )
    }
]