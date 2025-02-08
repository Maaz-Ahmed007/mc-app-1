"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { format, parseISO } from "date-fns"
import { useState, useRef, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintableReportCashbook } from "@/components/prints/printable-report-cashbook"
import { PrintableReportMonthlyList } from "@/components/prints/printable-report-monthly-list"

import { PartyModal } from "./party-modal"
import { PaymentModal } from "./[partyId]/payment-modal"

import { PartiesHeader } from "./parties-header"
import { AllPartiesTab } from "./all-parties-tab" 
import { MonthlyListTab } from "./monthly-list-tab" 
import { CashbookTab } from "./cashbook-tab"
import { usePartiesData } from "./use-parties-data" 

import { Party, Payment, partyColumns } from "./columns"

interface PaymentBase {
    id: string
    date: string
    details: string
    amount: number
}

interface LaborData {
    id: string
    name: string
    payments: PaymentBase[]
    bills: {
        id: string
        date: string
        amount: number
    }[]
}

interface ExpenseData {
    id: string
    name: string
    payments: {
        id: string
        date: string
        amount: number
    }[]
}

interface SalesData {
    id: string
    date: string
    balance: number
    total: number
}

interface PartiesClientProps {
    data: Party[]
    laborsData: LaborData[]
    expensesData: ExpenseData[]
    salesData: SalesData[]
}

export const PartiesClient: React.FC<PartiesClientProps> = ({
    data,
    laborsData, 
    expensesData, 
    salesData 
}) => {
    const router = useRouter()
    const params = useParams()
    const monthlyListPrintRef = useRef<HTMLDivElement>(null)
    const cashbookPrintRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [openPartyModal, setOpenPartyModal] = useState(false)
    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [selectedParty, setSelectedParty] = useState<Party | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

    const [salesBalances, setSalesBalances] = useState({
        previousBalance: 0,
        previousBalanceMonth: null as Date | null
    })

    // Separate useEffect for sales balance
    useEffect(() => {
        const fetchSalesBalance = async () => {
            try {
                const response = await axios.get(`/api/${sectionId}/sales/balance`, {
                    params: { 
                        sectionId, 
                        date: format(currentDate, 'yyyy-MM-dd')
                    }
                })
                setSalesBalances({
                    previousBalance: response.data.balance || 0,
                    previousBalanceMonth: response.data.month ? new Date(response.data.month) : null
                })
            } catch (error) {
                console.error("Error fetching sales balance:", error)
                toast.error("Failed to fetch sales balance")
            }
        }
        fetchSalesBalance()
    }, [currentDate, sectionId])

    // Pass all required arguments to usePartiesData
    const partiesData = usePartiesData(
        data,
        laborsData,
        expensesData,
        salesData,
        salesBalances,
        currentDate,
        sectionId
    )

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        
        data.forEach(party => {
            party.payments.forEach(payment => months.add(format(parseISO(payment.date), 'yyyy-MM')))
            party.cancelledPayments?.forEach(payment => months.add(format(parseISO(payment.date), 'yyyy-MM')))
            party.sales.forEach(sale => months.add(format(parseISO(sale.date), 'yyyy-MM')))
        })
        
        laborsData.forEach(labor => {
            labor.payments.forEach(payment => months.add(format(parseISO(payment.date), 'yyyy-MM')))
            labor.bills.forEach(bill => months.add(format(parseISO(bill.date), 'yyyy-MM')))
        })
        
        expensesData.forEach(expense => {
            expense.payments.forEach(payment => months.add(format(parseISO(payment.date), 'yyyy-MM')))
        })
        
        return Array.from(months).sort()
    }, [data, laborsData, expensesData])

    const handleAddPayment = (party: Party) => {
        setSelectedParty(party)
        setOpenPaymentModal(true)
    }

    const handleEditParty = (party: Party) => {
        setSelectedParty(party)
        setOpenPartyModal(true)
    }

    const handleDeleteParty = (id: string) => {
        setDeletingId(id)
        setOpenDeleteModal(true)
    }

    const handleViewParty = (id: string) => {
        window.open(`/${sectionId}/parties/${id}`, '_blank')
    }

    const onDelete = async () => {
        if (!deletingId) return
        
        try {
            setLoading(true)
            await axios.delete(`/api/${sectionId}/parties?id=${deletingId}`)
            toast.success("Party deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpenDeleteModal(false)
            setDeletingId(null)
        }
    }

    const handlePrint = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            const content = ref.current
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

    const partyColumnsWithActions = partyColumns(
        handleAddPayment,
        handleEditParty,
        handleDeleteParty,
        handleViewParty
    )

    return (
        <div className="space-y-6">
            <PartiesHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                availableMonths={availableMonths}
                onAddParty={() => setOpenPartyModal(true)}
                onPrintMonthlyList={() => handlePrint(monthlyListPrintRef)}
                onPrintCashbook={() => handlePrint(cashbookPrintRef)}
            />

            <Separator />

            <Tabs defaultValue="allParties" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="allParties">All Parties</TabsTrigger>
                    <TabsTrigger value="cashbook">Cashbook</TabsTrigger>
                    <TabsTrigger value="monthlyList">Monthly List</TabsTrigger>
                </TabsList>
                
                <TabsContent value="allParties">
                    <AllPartiesTab
                        data={data}
                        partyColumns={partyColumnsWithActions}
                    />
                </TabsContent>

                <TabsContent value="cashbook">
                    <CashbookTab
                        partyPayments={partiesData.cashbookData.partyPayments}
                        cancelledPayments={partiesData.cashbookData.cancelledPayments}
                        laborAndExpensePayments={partiesData.cashbookData.laborAndExpensePayments}
                        laborBills={partiesData.cashbookData.laborBills}
                        totalPartyPayments={partiesData.cashbookData.totalPartyPayments}
                        totalCancelledPayments={partiesData.cashbookData.totalCancelledPayments}
                        totalLaborAndExpensePayments={partiesData.cashbookData.totalLaborAndExpensePayments}
                        totalLaborBills={partiesData.cashbookData.totalLaborBills}
                        previousBalance={partiesData.previousBalance}
                        previousBalanceMonth={partiesData.previousBalanceMonth}
                        cashbookRemainingBalance={partiesData.cashbookData.cashbookRemainingBalance}
                        cashbookFinalBalance={partiesData.cashbookData.cashbookFinalBalance}
                        isCashbookFinalBalanceCredit={partiesData.cashbookData.isCashbookFinalBalanceCredit}
                    />
                </TabsContent>

                <TabsContent value="monthlyList">
                    <MonthlyListTab
                        monthlyParties={partiesData.monthlyParties}
                        monthlyLabors={partiesData.monthlyLabors}
                        monthlySales={partiesData.monthlySales}
                        previousBalance={partiesData.previousBalance}
                        cashbookFinalBalance={partiesData.cashbookData.cashbookFinalBalance}
                        isCashbookFinalBalanceCredit={partiesData.cashbookData.isCashbookFinalBalanceCredit}
                    />
                </TabsContent>
            </Tabs>

            <AlertModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false)
                    setDeletingId(null)
                }}
                onConfirm={onDelete}
                loading={loading}
            />

            <PartyModal
                isOpen={openPartyModal}
                onClose={() => {
                    setOpenPartyModal(false)
                    setSelectedParty(null)
                }}
                onPartyAction={() => router.refresh()}
                initialData={selectedParty}
            />

            <PaymentModal
                isOpen={openPaymentModal}
                onClose={() => {
                    setOpenPaymentModal(false)
                    setSelectedParty(null)
                    setSelectedPayment(null)
                }}
                onPaymentAction={() => router.refresh()}
                party={selectedParty}
                payment={selectedPayment}
            />

            <div ref={cashbookPrintRef} className="hidden">
                <PrintableReportCashbook
                    month={currentDate}
                    partyPayments={partiesData.cashbookData.partyPayments}
                    cancelledPayments={partiesData.cashbookData.cancelledPayments}
                    laborBills={partiesData.cashbookData.laborBills}
                    laborAndExpensePayments={partiesData.cashbookData.laborAndExpensePayments}
                    previousBalance={partiesData.previousBalance}
                    previousBalanceMonth={partiesData.previousBalanceMonth}
                    totalPartyPayments={partiesData.cashbookData.totalPartyPayments}
                    totalCancelledPayments={partiesData.cashbookData.totalCancelledPayments}
                    totalLaborBills={partiesData.cashbookData.totalLaborBills}
                    totalLaborAndExpensePayments={partiesData.cashbookData.totalLaborAndExpensePayments}
                    sectionId={sectionId}
                />
            </div>

            <div ref={monthlyListPrintRef} className="hidden">
                <PrintableReportMonthlyList
                    month={currentDate}
                    monthlyParties={partiesData.monthlyParties}
                    monthlyLabors={partiesData.monthlyLabors}
                    monthlySales={partiesData.monthlySales}  // Added this prop
                    previousBalance={partiesData.previousBalance}
                    cashbookFinalBalance={partiesData.cashbookData.cashbookFinalBalance}
                    isCashbookFinalBalanceCredit={partiesData.cashbookData.isCashbookFinalBalanceCredit}
                    sectionId={sectionId}
                />
            </div>
        </div>
    )
}