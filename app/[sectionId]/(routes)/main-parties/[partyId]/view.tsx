"use client"

import { cn, currencyFormat } from "@/lib/utils"
import { useState, useMemo, useRef } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CalendarRange, Printer } from "lucide-react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { CardTotal } from "@/components/card-total"
import { DataTable } from "@/components/data-table"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker"
import { PrintableReportMainParty } from "@/components/prints/printable-report-main-party"

// Base type for common properties
interface BaseTransaction {
    id: string
    date: string
    sectionName: string
}

// Payment type
export interface MainPartyPayment extends BaseTransaction {
    details: string
    amount: number
}

// Sale type
export interface MainPartySale extends BaseTransaction {
    truckNumber: string
    truckWeight: number
    rate: number
    total: number
    details?: string
}

interface MainPartyViewProps {
    party: {
        id: string
        name: string
        payments: MainPartyPayment[]
        cancelledPayments: MainPartyPayment[]
        sales: MainPartySale[]
        finalValue: number
        isFinalValueCredit: boolean
    }
    sectionId: string
}

export const MainPartyView: React.FC<MainPartyViewProps> = ({ party, sectionId }) => {
    const printRef = useRef<HTMLDivElement>(null)

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [showAllMonths, setShowAllMonths] = useState(true)

    
    const {
        displayedPayments,
        displayedCancelledPayments,
        displayedSales,
        totalPayments,
        totalCancelledPayments,
        totalSales,
        finalValue,
        isFinalValueCredit
    } = useMemo(() => {
        let paymentsToShow = [...party.payments]
        let cancelledPaymentsToShow = [...party.cancelledPayments]
        let salesToShow = [...party.sales]

        if (!showAllMonths) {
            const startDate = startOfMonth(currentDate)
            const endDate = endOfMonth(currentDate)
            
            paymentsToShow = party.payments.filter(payment => {
                const paymentDate = parseISO(payment.date)
                return paymentDate >= startDate && paymentDate <= endDate
            })

            cancelledPaymentsToShow = party.cancelledPayments.filter(payment => {
                const paymentDate = parseISO(payment.date)
                return paymentDate >= startDate && paymentDate <= endDate
            })

            salesToShow = party.sales.filter(sale => {
                const saleDate = parseISO(sale.date)
                return saleDate >= startDate && saleDate <= endDate
            })
        }

        // Sort by date in descending order
        paymentsToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        cancelledPaymentsToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        salesToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

        const totalPayments = paymentsToShow.reduce((sum, payment) => sum + payment.amount, 0)
        const totalCancelledPayments = cancelledPaymentsToShow.reduce((sum, payment) => sum + payment.amount, 0)
        const totalSales = salesToShow.reduce((sum, sale) => sum + sale.total, 0)

        const netDebit = totalSales + totalCancelledPayments
        const finalValue = Math.abs(totalPayments - netDebit)
        const isFinalValueCredit = totalPayments > netDebit

        return {
            displayedPayments: paymentsToShow,
            displayedCancelledPayments: cancelledPaymentsToShow,
            displayedSales: salesToShow,
            totalPayments,
            totalCancelledPayments,
            totalSales,
            finalValue,
            isFinalValueCredit
        }
    }, [party.payments, party.cancelledPayments, party.sales, currentDate, showAllMonths])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        ;[...party.payments, ...party.cancelledPayments, ...party.sales].forEach(item => {
            const date = parseISO(item.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [party.payments, party.cancelledPayments, party.sales])

    const paymentColumns: ColumnDef<MainPartyPayment>[] = [
        { 
            accessorKey: 'date', 
            header: "Date",
            cell: ({ row }) => format(parseISO(row.original.date), 'dd-MM-yyyy')
        },
        { accessorKey: 'sectionName', header: "Section" },
        { accessorKey: 'details', header: "Details" },
        { 
            accessorKey: 'amount', 
            header: "Amount",
            cell: ({ row }) => (
                <span className="text-green-600">
                    {currencyFormat.format(row.original.amount)}
                </span>
            )
        }
    ]

    const cancelledPaymentColumns: ColumnDef<MainPartyPayment>[] = [
        { 
            accessorKey: 'date', 
            header: "Date",
            cell: ({ row }) => format(parseISO(row.original.date), 'dd-MM-yyyy')
        },
        { accessorKey: 'sectionName', header: "Section" },
        { accessorKey: 'details', header: "Details" },
        { 
            accessorKey: 'amount', 
            header: "Amount",
            cell: ({ row }) => (
                <span className="text-red-600">
                    {currencyFormat.format(row.original.amount)}
                </span>
            )
        }
    ]

    const saleColumns: ColumnDef<MainPartySale>[] = [
        { 
            accessorKey: 'date', 
            header: "Date",
            cell: ({ row }) => format(parseISO(row.original.date), 'dd-MM-yyyy')
        },
        { accessorKey: 'sectionName', header: "Section" },
        { accessorKey: 'truckNumber', header: "Truck Number" },
        { 
            accessorKey: 'truckWeight', 
            header: "Truck Weight",
            cell: ({ row }) => row.original.truckWeight.toFixed(3)
        },
        { 
            accessorKey: 'rate', 
            header: "Rate",
            cell: ({ row }) => currencyFormat.format(row.original.rate)
        },
        { 
            accessorKey: 'total', 
            header: "Total",
            cell: ({ row }) => (
                <span className="text-red-600">
                    {currencyFormat.format(row.original.total)}
                </span>
            )
        }
    ]

    const handlePrint = () => {
        if (printRef.current) {
            const content = printRef.current
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(content.innerHTML)
                printWindow.document.close()
                printWindow.focus()
                printWindow.print()
                printWindow.close()
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title={`${party.name} Transactions`}
                    description="View all transactions across sections."
                />
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowAllMonths(!showAllMonths)}
                    >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        {showAllMonths ? 'Monthly' : 'A to Z'}
                    </Button>
                    {!showAllMonths && (
                        <MonthPicker 
                            selectedDate={currentDate} 
                            onChange={setCurrentDate} 
                            availableMonths={availableMonths}
                        />
                    )}
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-4 gap-4">
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Payments`}
                    value={totalPayments}
                    type="money"
                    isDebit={false}
                />
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Sales`}
                    value={totalSales}
                    type="money"
                    isDebit={true}
                />
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Cancelled`}
                    value={totalCancelledPayments}
                    type="money"
                    isDebit={true}
                />
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Balance`}
                    value={finalValue}
                    type="money"
                    isDebit={!isFinalValueCredit}
                />
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Payments</h2>
                    <DataTable
                        columns={paymentColumns}
                        data={displayedPayments}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Sales</h2>
                    <DataTable
                        columns={saleColumns}
                        data={displayedSales}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Cancelled Payments</h2>
                    <DataTable
                        columns={cancelledPaymentColumns}
                        data={displayedCancelledPayments}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
            </div>

            <div ref={printRef} className="hidden">
                <PrintableReportMainParty
                    partyName={party.name}
                    payments={displayedPayments}
                    cancelledPayments={displayedCancelledPayments}
                    sales={displayedSales}
                    month={currentDate}
                    sectionId={sectionId}
                    isAllTime={showAllMonths}
                />
            </div>
        </div>
    )
}