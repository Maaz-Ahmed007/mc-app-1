"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useState, useMemo, useRef } from "react"
import { CalendarRange, Plus, Printer, Ban } from "lucide-react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { DataTable } from "@/components/data-table"
import { CardTotal } from "@/components/card-total"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker"
import { AlertModal } from "@/components/modals/alert-modal"
import { PrintableReportParty } from "@/components/prints/printable-report-party"

import { PaymentModal } from "./payment-modal"
import { CancelledPaymentModal } from "./cancelled-payment-modal"
import { Payment, CancelledPayment, Party, Sale, paymentColumns, cancelledPaymentColumns, saleColumns } from "../columns"

interface PartyClientProps {
    party: Party
    sectionId: string
}

export const PartyClient: React.FC<PartyClientProps> = ({ 
    party, 
    sectionId,
}) => {   
    const router = useRouter()
    const printRef = useRef<HTMLDivElement>(null)

    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [openCancelledPaymentModal, setOpenCancelledPaymentModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
    const [isDeletingCancelledPayment, setIsDeletingCancelledPayment] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [selectedCancelledPayment, setSelectedCancelledPayment] = useState<CancelledPayment | null>(null)
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
    
        // Calculate final value considering cancelled payments as debits
        // Credits (Payments) - Debits (Sales + Cancelled Payments)
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


    const handleAddPayment = () => {
        setSelectedPayment(null)
        setOpenPaymentModal(true)
    }

    const handleAddCancelledPayment = () => {
        setSelectedCancelledPayment(null)
        setOpenCancelledPaymentModal(true)
    }

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment)
        setOpenPaymentModal(true)
    }

    const handleEditCancelledPayment = (payment: CancelledPayment) => {
        setSelectedCancelledPayment(payment)
        setOpenCancelledPaymentModal(true)
    }

    const handleDeletePayment = (id: string, isCancelled: boolean = false) => {
        setDeletingPaymentId(id)
        setIsDeletingCancelledPayment(isCancelled)
        setOpenDeleteModal(true)
    }

    const onDelete = async () => {
        if (!deletingPaymentId) return
        
        try {
            setLoading(true)
            const endpoint = isDeletingCancelledPayment ? 'party-cancelled-payments' : 'party-payments'
            await axios.delete(`/api/${sectionId}/${endpoint}?id=${deletingPaymentId}`)
            toast.success("Payment deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpenDeleteModal(false)
            setDeletingPaymentId(null)
            setIsDeletingCancelledPayment(false)
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
                    title={`${party.name} Payments`}
                    description="View and manage payments for this party"
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
                    <Button onClick={handleAddPayment}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                    </Button>
                    <Button onClick={handleAddCancelledPayment} variant="secondary">
                        <Ban className="mr-2 h-4 w-4" />
                        Add Cancelled
                    </Button>
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
                    header={`${showAllMonths ? 'Final' : 'Monthly'} Balance`}
                    value={finalValue}
                    type="money"
                    isDebit={!isFinalValueCredit}
                />
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Payments</h2>
                    <DataTable
                        columns={paymentColumns(handleEditPayment, (id) => handleDeletePayment(id, false))}
                        data={displayedPayments}
                        showPagination
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Sales</h2>
                    <DataTable
                        columns={saleColumns()}
                        data={displayedSales}
                        showPagination
                        showGlobalFilter={false}
                        pageSize={20}
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Cancelled Payments</h2>
                    <DataTable
                        columns={cancelledPaymentColumns(handleEditCancelledPayment, (id) => handleDeletePayment(id, true))}
                        data={displayedCancelledPayments}
                        showPagination
                        showGlobalFilter={true}
                        pageSize={20}
                    />
                </div>
            </div>

            <AlertModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false)
                    setDeletingPaymentId(null)
                    setIsDeletingCancelledPayment(false)
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
                party={party}
                payment={selectedPayment}
            />

            <CancelledPaymentModal
                isOpen={openCancelledPaymentModal}
                onClose={() => {
                    setOpenCancelledPaymentModal(false)
                    setSelectedCancelledPayment(null)
                }}
                onPaymentAction={() => router.refresh()}
                party={party}
                payment={selectedCancelledPayment}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportParty 
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