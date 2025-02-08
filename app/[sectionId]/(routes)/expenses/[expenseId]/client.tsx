"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { useState, useMemo, useRef } from "react"
import { currencyFormat } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { CalendarRange, PencilRuler, Plus, Printer, Trash } from "lucide-react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { DataTable } from "@/components/data-table"
import { CardTotal } from "@/components/card-total"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker"
import { AlertModal } from "@/components/modals/alert-modal"
import { PrintableReportIndividualExpense } from "@/components/prints/printable-report-individual-expense"

import { PaymentModal } from "./payment-modal"

interface Payment {
    id: string
    date: string
    details: string
    amount: number
}

interface Expense {
    id: string
    name: string
    sectionId: string
    payments: Payment[]
}

interface ExpensePaymentsClientProps {
    expense: Expense
}

export const ExpensePaymentsClient: React.FC<ExpensePaymentsClientProps> = ({ expense }) => {
    const router = useRouter()
    const params = useParams()
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [showAllMonths, setShowAllMonths] = useState(true)

    const { displayedPayments, totalAmount } = useMemo(() => {
        let paymentsToShow = [...expense.payments]

        if (!showAllMonths) {
            const startDate = startOfMonth(currentDate)
            const endDate = endOfMonth(currentDate)
            
            paymentsToShow = expense.payments.filter(payment => {
                const paymentDate = parseISO(payment.date)
                return paymentDate >= startDate && paymentDate <= endDate
            })
        }

        // Sort by date in descending order
        paymentsToShow.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

        const totalAmount = paymentsToShow.reduce((sum, payment) => sum + payment.amount, 0)

        return { displayedPayments: paymentsToShow, totalAmount }
    }, [expense.payments, currentDate, showAllMonths])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        expense.payments.forEach(payment => {
            const date = parseISO(payment.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [expense.payments])

    const columns = [
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

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment)
        setOpenPaymentModal(true)
    }

    const handleDeletePayment = (id: string) => {
        setDeletingPaymentId(id)
        setOpenDeleteModal(true)
    }

    const onDelete = async () => {
        if (!deletingPaymentId) return
        
        try {
            setLoading(true)
            await axios.delete(`/api/${params.sectionId}/expense-payments?id=${deletingPaymentId}`)
            router.refresh()
            toast.success("Payment deleted successfully")
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpenDeleteModal(false)
            setDeletingPaymentId(null)
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
                    title={`${expense.name}`}
                    description={`Manage payments for ${expense.name}`}
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
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <Separator />
            
            <CardTotal
                header={`${showAllMonths ? 'All' : 'Monthly'} Expenses`}
                value={totalAmount}
                type="money"
                isDebit={false}
            />
            
            <div className="bg-white rounded-lg shadow-none">
                <DataTable
                    columns={columns}
                    data={displayedPayments}
                    showPagination={true}
                    showGlobalFilter={true}
                    pageSize={20}
                />
            </div>

            <AlertModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false)
                    setDeletingPaymentId(null)
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
                expense={expense}
                selectedPayment={selectedPayment}
                currentDate={currentDate}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportIndividualExpense
                    expenseName={expense.name}
                    payments={displayedPayments}
                    month={currentDate}
                    sectionId={sectionId}
                    isAllTime={showAllMonths}
                />
            </div>
        </div>
    )
}