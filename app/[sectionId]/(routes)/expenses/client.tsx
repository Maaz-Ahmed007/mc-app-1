"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Printer } from "lucide-react"
import { currencyFormat } from "@/lib/utils"
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
import { PrintableReportExpense } from "@/components/prints/printable-report-expense"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ExpenseColumn, PaymentColumn, finalListColumns, expenseColumns, paymentColumns } from "./columns"
import { ExpenseModal } from "./expense-modal"
import { PaymentModal } from "./[expenseId]/payment-modal"

interface ExpenseClientProps {
    expenses: ExpenseColumn[]
    payments: PaymentColumn[]
}

export const ExpenseClient: React.FC<ExpenseClientProps> = ({ expenses, payments }) => {
    const router = useRouter()
    const params = useParams()
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deletingType, setDeletingType] = useState<'expense' | 'payment' | null>(null)
    const [openExpenseModal, setOpenExpenseModal] = useState(false)
    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<ExpenseColumn | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<PaymentColumn | null>(null)

    const {
        filteredPayments,
        totalMonthlyAmount,
        finalListData
    } = useMemo(() => {
        const startDate = startOfMonth(currentDate)
        const endDate = endOfMonth(currentDate)
        
        const filteredPayments = payments.filter(payment => {
            const paymentDate = parseISO(payment.date)
            return paymentDate >= startDate && paymentDate <= endDate
        })

        const totalMonthlyAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)

        const finalListData = expenses.map(expense => {
            const expensePayments = filteredPayments.filter(payment => payment.expenseId === expense.id)
            const totalAmount = expensePayments.reduce((sum, payment) => sum + payment.amount, 0)
            return {
                ...expense,
                totalAmount
            }
        }).filter(expense => expense.totalAmount > 0)

        return {
            filteredPayments,
            totalMonthlyAmount,
            finalListData
        }
    }, [expenses, payments, currentDate])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        payments.forEach(payment => {
            const date = parseISO(payment.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [payments])

    const handleEditExpense = (expense: ExpenseColumn) => {
        setSelectedExpense(expense)
        setOpenExpenseModal(true)
    }

    const handleDeleteExpense = (id: string) => {
        setDeletingId(id)
        setDeletingType('expense')
        setOpenDeleteModal(true)
    }

    const handleAddPayment = (expense: ExpenseColumn) => {
        setSelectedExpense(expense)
        setOpenPaymentModal(true)
    }

    const handleEditPayment = (payment: PaymentColumn) => {
        setSelectedPayment(payment)
        setOpenPaymentModal(true)
    }

    const handleDeletePayment = (id: string) => {
        setDeletingId(id)
        setDeletingType('payment')
        setOpenDeleteModal(true)
    }

    const handleOpenExpensePage = (expenseId: string) => {
        window.open(`/${params.sectionId}/expenses/${expenseId}`, '_blank')
    }

    const onDelete = async () => {
        if (!deletingId || !deletingType) return
        
        try {
            setLoading(true)
            if (deletingType === 'expense') {
                await axios.delete(`/api/${params.sectionId}/expenses?id=${deletingId}`)
                toast.success("Expense deleted successfully")
            } else {
                await axios.delete(`/api/${params.sectionId}/expense-payments?id=${deletingId}`)
                toast.success("Payment deleted successfully")
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
                    title="Expenses"
                    description="Manage expenses and view monthly totals in one place."
                />
                <div className="flex items-center space-x-2">
                    <MonthPicker 
                        selectedDate={currentDate} 
                        onChange={setCurrentDate} 
                        availableMonths={availableMonths}
                    />
                    <Button onClick={() => setOpenExpenseModal(true)}>
                        <Plus className="mr-2 w-4 h-4" />
                        Add Expense
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <Separator />

            <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expenses">All Expenses</TabsTrigger>
                    <TabsTrigger value="finalList">Final List</TabsTrigger>
                </TabsList>
                <TabsContent value="expenses">
                    <div className="bg-white rounded-lg shadow-none mt-4">
                        <DataTable
                            columns={expenseColumns(handleEditExpense, handleDeleteExpense, handleAddPayment, handleOpenExpensePage)}
                            data={expenses}
                            showPagination={true}
                            showGlobalFilter={true}
                            pageSize={20}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="finalList">
                    <div className="bg-white rounded-lg shadow-none mt-4">
                        <DataTable
                            columns={finalListColumns}
                            data={finalListData}
                            showPagination={true}
                            showGlobalFilter={false}
                            pageSize={20}
                        />
                    </div>
                    <CardTotal
                        header={`Total Expense Balance`}
                        value={totalMonthlyAmount}
                        type="money"
                        isDebit={true}
                    />
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

            <ExpenseModal
                isOpen={openExpenseModal}
                onClose={() => {
                    setOpenExpenseModal(false)
                    setSelectedExpense(null)
                }}
                onExpenseAction={() => router.refresh()}
                initialData={selectedExpense}
            />

            <PaymentModal
                isOpen={openPaymentModal}
                onClose={() => {
                    setOpenPaymentModal(false)
                    setSelectedExpense(null)
                    setSelectedPayment(null)
                }}
                onPaymentAction={() => router.refresh()}
                expense={selectedExpense}
                selectedPayment={selectedPayment}
                currentDate={currentDate}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportExpense
                    data={{
                        data: finalListData.map(expense => ({
                            name: expense.name,
                            amount: expense.totalAmount
                        })),
                        total: totalMonthlyAmount
                    }}
                    month={currentDate}
                    sectionId={sectionId}
                />
            </div>
        </div>
    )
}