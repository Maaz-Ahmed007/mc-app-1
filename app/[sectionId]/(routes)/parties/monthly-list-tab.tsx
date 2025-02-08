import { currencyFormat, cn } from "@/lib/utils"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinalValueItem {
    id: string;
    name: string;
    finalValue: number;
    isFinalValueCredit: boolean;
    type: 'party' | 'labor' | 'sales' | 'cashbook';
}

interface MonthlyListTabProps {
    monthlyParties: FinalValueItem[];
    monthlyLabors: FinalValueItem[];
    monthlySales: FinalValueItem[];  // New prop
    previousBalance: number;
    cashbookFinalBalance: number;
    isCashbookFinalBalanceCredit: boolean;
}

export const MonthlyListTab: React.FC<MonthlyListTabProps> = ({
    monthlyParties,
    monthlyLabors,
    monthlySales,
    previousBalance,
    cashbookFinalBalance,
    isCashbookFinalBalanceCredit,
}) => {
    const debitItems: FinalValueItem[] = []
    const creditItems: FinalValueItem[] = []

    // Helper function to add item to the correct array
    const distributeItem = (item: FinalValueItem) => {
        const absoluteValue = Math.abs(item.finalValue)
        if (absoluteValue === 0) return

        // Create a new item with absolute value
        const processedItem = {
            ...item,
            finalValue: absoluteValue
        }

        // Special handling for cashbook (opposite of its actual balance)
        if (item.type === 'cashbook') {
            if (!item.isFinalValueCredit) {
                creditItems.push(processedItem)
            } else {
                debitItems.push(processedItem)
            }
        } else {
            // Normal handling for other types
            if (item.isFinalValueCredit) {
                creditItems.push(processedItem)
            } else {
                debitItems.push(processedItem)
            }
        }
    }

    // Distribute all items
    monthlyParties.forEach(distributeItem)
    monthlyLabors.forEach(distributeItem)
    monthlySales.forEach(distributeItem)

    // Add cashbook final balance
    if (Math.abs(cashbookFinalBalance) > 0) {
        const cashbookItem = {
            id: 'cashbook',
            name: 'Cashbook Final Balance',
            finalValue: Math.abs(cashbookFinalBalance),
            isFinalValueCredit: isCashbookFinalBalanceCredit,
            type: 'cashbook' as const
        }
        distributeItem(cashbookItem)
    }

    const renderTable = (items: FinalValueItem[], title: string, isDebit: boolean) => (
        <Card>
            <CardHeader>
                <CardTitle>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="capitalize">
                                    {item.type}
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right",
                                    isDebit ? "text-red-600" : "text-green-600"
                                )}>
                                    {currencyFormat.format(item.finalValue)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold">
                            <TableCell>Total</TableCell>
                            <TableCell></TableCell>
                            <TableCell className={cn(
                                "text-right",
                                isDebit ? "text-red-600" : "text-green-600"
                            )}>
                                {currencyFormat.format(items.reduce((sum, item) => sum + item.finalValue, 0))}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {renderTable(debitItems, "Debits", true)}
            {renderTable(creditItems, "Credits", false)}
        </div>
    )
}