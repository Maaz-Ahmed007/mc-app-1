"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { useState, useMemo, useRef } from "react"
import { currencyFormat } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { PencilRuler, Plus, Trash, Printer, CalendarRange } from "lucide-react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { DataTable } from "@/components/data-table"
import { CardTotal } from "@/components/card-total"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker"
import { AlertModal } from "@/components/modals/alert-modal"
import { PrintableReportIndividualLabor } from "@/components/prints/printable-report-individual-labor"

import { PaymentModal } from "./payment-modal"
import { BillModal } from "./bill-modal"

interface Payment {
    id: string
    date: string
    details: string
    amount: number
}

interface Bill {
    id: string
    date: string
    amount: number
}

interface Labor {
    id: string
    name: string
    sectionId: string
    payments: Payment[]
    bills: Bill[]
}

interface LaborPaymentsClientProps {
    labor: Labor
}

export const LaborPaymentsClient: React.FC<LaborPaymentsClientProps> = ({ labor }) => {
    const router = useRouter()
    const params = useParams()
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [openBillModal, setOpenBillModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deletingType, setDeletingType] = useState<'payment' | 'bill' | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [showAllMonths, setShowAllMonths] = useState(true)

    const { 
        displayedPayments, 
        displayedBills, 
        totalPayments, 
        totalBills, 
        finalValue, 
        isFinalValueDebit 
    } = useMemo(() => {
        let paymentsToShow = [...labor.payments]
        let billsToShow = [...labor.bills]

        if (!showAllMonths) {
            const startDate = startOfMonth(currentDate)
            const endDate = endOfMonth(currentDate)
            
            paymentsToShow = labor.payments.filter(payment => {
                const paymentDate = parseISO(payment.date)
                return paymentDate >= startDate && paymentDate <= endDate
            })

            billsToShow = labor.bills.filter(bill => {
                const billDate = parseISO(bill.date)
                return billDate >= startDate && billDate <= endDate
            })
        }

        // Sort by date in descending order
        paymentsToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        billsToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

        const totalPayments = paymentsToShow.reduce((sum, p) => sum + p.amount, 0)
        const totalBills = billsToShow.reduce((sum, b) => sum + b.amount, 0)

        const finalValue = Math.abs(totalPayments - totalBills)
        const isFinalValueDebit = totalPayments > totalBills

        return { 
            displayedPayments: paymentsToShow, 
            displayedBills: billsToShow, 
            totalPayments, 
            totalBills, 
            finalValue, 
            isFinalValueDebit 
        }
    }, [labor.payments, labor.bills, currentDate, showAllMonths])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        ;[...labor.payments, ...labor.bills].forEach(transaction => {
            const date = parseISO(transaction.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [labor.payments, labor.bills])
    
    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment)
        setOpenPaymentModal(true)
    }

    const handleDeletePayment = (id: string) => {
        setDeletingId(id)
        setDeletingType('payment')
        setOpenDeleteModal(true)
    }

    const handleEditBill = (bill: Bill) => {
        setSelectedBill(bill)
        setOpenBillModal(true)
    }

    const handleDeleteBill = (id: string) => {
        setDeletingId(id)
        setDeletingType('bill')
        setOpenDeleteModal(true)
    }
    
    const paymentColumns = [
        {
            accessorKey: 'date',
            header: "Date",
            cell: ({ row }: { row: { original: Payment } }) => format(parseISO(row.original.date), "dd/MM/yyyy")
        },
        {
            accessorKey: 'details',
            header: "Details",
            cell: ({ row }: { row: { original: Payment } }) => row.original.details
        },
        {
            accessorKey: 'amount',
            header: "Amount",
            cell: ({ row }: { row: { original: Payment } }) => currencyFormat.format(row.original.amount)
        },
        {
            id: 'actions',
            cell: ({ row }: { row: { original: Payment } }) => (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(row.original)}
                    >
                        <PencilRuler className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePayment(row.original.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    const billColumns = [
        {
            accessorKey: 'date',
            header: "Date",
            cell: ({ row }: { row: { original: Bill } }) => format(parseISO(row.original.date), "dd/MM/yyyy")
        },
        {
            accessorKey: 'amount',
            header: "Amount",
            cell: ({ row }: { row: { original: Bill } }) => currencyFormat.format(row.original.amount)
        },
        {
            id: 'actions',
            cell: ({ row }: { row: { original: Bill } }) => (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBill(row.original)}
                    >
                        <PencilRuler className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBill(row.original.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    const onDelete = async () => {
        if (!deletingId || !deletingType) return
        
        try {
            setLoading(true)
            if (deletingType === 'payment') {
                await axios.delete(`/api/${params.sectionId}/labor-payments?id=${deletingId}`)
                toast.success("Payment deleted successfully")
            } else {
                await axios.delete(`/api/${params.sectionId}/labor-bills?id=${deletingId}`)
                toast.success("Bill deleted successfully")
            }
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpenDeleteModal(false)
            setDeletingId(null)
            setDeletingType(null)
        }
    }

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
                    title={`${labor.name} Transactions`}
                    description="Manage payments and bills for this labor"
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
                    <Button onClick={() => setOpenPaymentModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                    </Button>
                    <Button onClick={() => setOpenBillModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Bill
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Payments`}
                    value={totalPayments}
                    type="money"
                    isDebit={true}
                />
                <CardTotal
                    header={`${showAllMonths ? 'All' : 'Monthly'} Bills`}
                    value={totalBills}
                    type="money"
                    isDebit={false}
                />
                <CardTotal
                    header={`${showAllMonths ? 'Final' : 'Monthly'} Balance`}
                    value={finalValue}
                    type="money"
                    isDebit={isFinalValueDebit}
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
                    <h2 className="text-lg font-semibold mb-2">Bills</h2>
                    <DataTable
                        columns={billColumns}
                        data={displayedBills}
                        showPagination={true}
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
            </div>

            <AlertModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false)
                    setDeletingId(null)
                    setDeletingType(null)
                }}
                onConfirm={onDelete}
                loading={loading}
            />

            <PaymentModal
                isOpen={openPaymentModal}
                onClose={() => {
                    setOpenPaymentModal(false)
                    setSelectedPayment(null)
                }}
                onPaymentAction={() => router.refresh()}
                labor={labor}
                selectedPayment={selectedPayment}
                currentDate={currentDate}
            />

            <BillModal
                isOpen={openBillModal}
                onClose={() => {
                    setOpenBillModal(false)
                    setSelectedBill(null)
                }}
                onBillAction={() => router.refresh()}
                labor={labor}
                selectedBill={selectedBill}
                currentDate={currentDate}
            />


            <div ref={printRef} className="hidden">
                <PrintableReportIndividualLabor
                    laborName={labor.name}
                    payments={displayedPayments}
                    bills={displayedBills}
                    month={currentDate}
                    sectionId={sectionId}
                    isAllTime={showAllMonths}
                />
            </div>
        </div>
    )
}