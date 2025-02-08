"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Printer } from "lucide-react"
import { useState, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { CardTotal } from "@/components/card-total"
import { DataTable } from "@/components/data-table"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker" 
import { AlertModal } from "@/components/modals/alert-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintableReportLabor } from "@/components/prints/printable-report-labor"

import { LaborColumn, PaymentColumn, BillColumn, finalListColumns, laborColumns } from "./columns"
import { LaborModal } from "./labor-modal"
import { PaymentModal } from "./[laborId]/payment-modal"
import { BillModal } from "./[laborId]/bill-modal"

interface LaborClientProps {
    labors: LaborColumn[]
    payments: PaymentColumn[]
    bills: BillColumn[]
}

export const LaborClient: React.FC<LaborClientProps> = ({ labors, payments, bills }) => {
    const router = useRouter()
    const params = useParams()
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const currentDate = new Date()
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deletingType, setDeletingType] = useState<'labor' | 'payment' | 'bill' | null>(null)
    const [openLaborModal, setOpenLaborModal] = useState(false)
    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [openBillModal, setOpenBillModal] = useState(false)
    const [selectedLabor, setSelectedLabor] = useState<LaborColumn | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<PaymentColumn | null>(null)
    const [selectedBill, setSelectedBill] = useState<BillColumn | null>(null)

    const {
        laborTotals,
        totalPayments,
        totalBills,
        totalBalance,
        isTotalBalanceDebit
    } = useMemo(() => {
        // Calculate totals for each labor (all time)
        const laborTotals = labors.map(labor => {
            const laborPayments = payments.filter(p => p.laborId === labor.id)
            const laborBills = bills.filter(b => b.laborId === labor.id)
            const totalPayments = laborPayments.reduce((sum, p) => sum + p.amount, 0)
            const totalBills = laborBills.reduce((sum, b) => sum + b.amount, 0)

            return {
                ...labor,
                totalPayments,
                totalBills
            }
        })

        // Calculate grand totals
        const totalPayments = laborTotals.reduce((sum, labor) => sum + labor.totalPayments, 0)
        const totalBills = laborTotals.reduce((sum, labor) => sum + labor.totalBills, 0)
        const totalBalance = Math.abs(totalPayments - totalBills)
        const isTotalBalanceDebit = totalPayments > totalBills

        return {
            laborTotals,
            totalPayments,
            totalBills,
            totalBalance,
            isTotalBalanceDebit
        }
    }, [labors, payments, bills])

    const handleEditLabor = (labor: LaborColumn) => {
        setSelectedLabor(labor)
        setOpenLaborModal(true)
    }

    const handleDeleteLabor = (id: string) => {
        setDeletingId(id)
        setDeletingType('labor')
        setOpenDeleteModal(true)
    }

    const handleAddPayment = (labor: LaborColumn) => {
        setSelectedLabor(labor)
        setOpenPaymentModal(true)
    }

    const handleAddBill = (labor: LaborColumn) => {
        setSelectedLabor(labor)
        setOpenBillModal(true)
    }

    const handleOpenLaborPage = (laborId: string) => {
        window.open(`/${params.sectionId}/labors/${laborId}`, '_blank')
    }

    const onDelete = async () => {
        if (!deletingId || !deletingType) return
        
        try {
            setLoading(true)
            if (deletingType === 'labor') {
                await axios.delete(`/api/${params.sectionId}/labors?id=${deletingId}`)
                toast.success("Labor deleted successfully")
            } else if (deletingType === 'payment') {
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
                    title="Labors"
                    description="Manage labors and view monthly totals in one place."
                />
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setOpenLaborModal(true)}>
                        <Plus className="mr-2 w-4 h-4" />
                        Add Labor
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <Separator />

            <Tabs defaultValue="allLabors" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="allLabors">All Labors</TabsTrigger>
                    <TabsTrigger value="finalList">Final List</TabsTrigger>
                </TabsList>
                <TabsContent value="allLabors">
                    <div className="bg-white rounded-lg shadow-none mt-4">
                        <DataTable
                            columns={laborColumns(handleEditLabor, handleDeleteLabor, handleAddPayment, handleAddBill, handleOpenLaborPage)}
                            data={labors}
                            showPagination={true}
                            showGlobalFilter={true}
                            pageSize={20}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="finalList">
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-none">
                            <DataTable
                                columns={finalListColumns}
                                data={laborTotals}
                                showPagination={true}
                                showGlobalFilter={true}
                                pageSize={20}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <CardTotal
                                header="Total Payments"
                                value={totalPayments}
                                type="money"
                                isDebit={true}
                            />
                            <CardTotal
                                header="Total Bills"
                                value={totalBills}
                                type="money"
                                isDebit={false}
                            />
                            <CardTotal
                                header="Final Balance"
                                value={totalBalance}
                                type="money"
                                isDebit={isTotalBalanceDebit}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

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

            <LaborModal
                isOpen={openLaborModal}
                onClose={() => {
                    setOpenLaborModal(false)
                    setSelectedLabor(null)
                }}
                onLaborAction={() => router.refresh()}
                initialData={selectedLabor}
            />

            <PaymentModal
                isOpen={openPaymentModal}
                onClose={() => {
                    setOpenPaymentModal(false)
                    setSelectedLabor(null)
                    setSelectedPayment(null)
                }}
                onPaymentAction={() => router.refresh()}
                labor={selectedLabor}
                selectedPayment={selectedPayment}
                currentDate={currentDate}
            />

            <BillModal
                isOpen={openBillModal}
                onClose={() => {
                    setOpenBillModal(false)
                    setSelectedLabor(null)
                    setSelectedBill(null)
                }}
                onBillAction={() => router.refresh()}
                labor={selectedLabor}
                selectedBill={selectedBill}
                currentDate={currentDate}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportLabor
                    labors={laborTotals}
                    totalPayments={totalPayments}
                    totalBills={totalBills}
                    totalBalance={totalBalance}
                    isTotalBalanceDebit={isTotalBalanceDebit}
                    sectionId={sectionId}
                />
            </div>
        </div>
    )
}