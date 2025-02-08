"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Printer } from "lucide-react"
import { currencyFormat } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"
import { useState, useMemo, useRef, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { CardTotal } from "@/components/card-total"
import { DataTable } from "@/components/data-table"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker" 
import { AlertModal } from "@/components/modals/alert-modal"
import { PrintableReportDispatch } from "@/components/prints/printable-report-dispatch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

import { SaleColumn, columns } from "./columns"
import { SalesModal } from "./sales-modal"

interface SaleClientProps {
    data: SaleColumn[]
    parties: { id: string; name: string }[]
    expensePayments: {
        id: string
        date: string
        expenseName: string
        amount: number
    }[]
}

export const SaleClient: React.FC<SaleClientProps> = ({ data, parties, expensePayments }) => {   
    const router = useRouter()
    const params = useParams()
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null)
    const [openSaleModal, setOpenSaleModal] = useState(false)
    const [selectedSale, setSelectedSale] = useState<SaleColumn | null>(null)
    const [previousBalance, setPreviousBalance] = useState<number>(0)
    const [previousBalanceMonth, setPreviousBalanceMonth] = useState<Date | null>(null)

    const fetchPreviousBalance = useCallback(async () => {
        try {
          const response = await axios.get(`/api/${params.sectionId}/sales/balance`, {
            params: {
              sectionId: params.sectionId,
              date: format(currentDate, 'yyyy-MM-dd')
            }
          })
          setPreviousBalance(response.data.balance || 0)
          setPreviousBalanceMonth(response.data.month ? new Date(response.data.month) : null)
        } catch (error) {
          console.error("Error fetching previous balance:", error)
          toast.error("Failed to fetch previous balance")
          setPreviousBalance(0)
          setPreviousBalanceMonth(null)
        }
      }, [currentDate, params.sectionId])

    useEffect(() => {
        fetchPreviousBalance()
    }, [fetchPreviousBalance])

    const {
        filteredData,
        totalWeight,
        totalAmount,
        finalSalesBalance,
        calculationBreakdown,
        totalExpenses
    } = useMemo(() => {
        const startDate = startOfMonth(currentDate)
        const endDate = endOfMonth(currentDate)
        
        const filteredData = data.filter((sale) => {
            const saleDate = parseISO(sale.date)
            return saleDate >= startDate && saleDate <= endDate
        })

        const totalWeight = filteredData.reduce((sum, sale) => sum + sale.truckWeight, 0)
        const totalAmount = filteredData.reduce((sum, sale) => sum + sale.totalAmount, 0)
        
        const totalExpenses = expensePayments
            .filter(payment => {
                const paymentDate = parseISO(payment.date)
                return paymentDate >= startDate && paymentDate <= endDate
            })
            .reduce((sum, payment) => sum + payment.amount, 0)

        const totalRemainingSales = totalAmount - totalExpenses
        const finalSalesBalance = totalRemainingSales + previousBalance

        const calculationBreakdown = [
            { description: "Total Sales", amount: totalAmount },
            { description: "Total Expenses", amount: -totalExpenses },
            { description: "Remaining Sales", amount: totalRemainingSales },
            { 
                description: previousBalanceMonth 
                    ? "Previous Balance" 
                    : "Previous Balance",
                amount: previousBalance 
            },
            { description: "Final Sales Balance", amount: finalSalesBalance },
        ]

        return {
            filteredData,
            totalWeight,
            totalAmount,
            finalSalesBalance,
            calculationBreakdown,
            totalExpenses
        }
    }, [data, expensePayments, currentDate, previousBalance, previousBalanceMonth])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        data.forEach(sale => {
            const date = parseISO(sale.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [data])

    const saleColumns = columns(handleEdit, handleDelete)

    function onSaleAction() {
        setOpenSaleModal(false)
        setSelectedSale(null)
        router.refresh()
    }

    function handleEdit(sale: SaleColumn) {
        setSelectedSale(sale)
        setOpenSaleModal(true)
    }

    function handleDelete(id: string) {
        setDeletingSaleId(id)
        setOpen(true)
    }

    async function onDelete() {
        if (!deletingSaleId) return
        
        try {
            setLoading(true)
            await axios.delete(`/api/${params.sectionId}/sales`, {
                params: {
                    id: deletingSaleId,
                    sectionId: params.sectionId
                }
            })
            router.refresh()
            toast.success("Sale deleted successfully")
        } catch (error) {
            console.error("Error deleting sale:", error)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpen(false)
            setDeletingSaleId(null)
        }
    }
    
    function handlePrint() {
        setTimeout(() => {
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
        }, 100)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title="Sales"
                    description="Manage sales and view monthly dispatches in one place."
                />
                <div className="flex items-center space-x-2">
                    <MonthPicker 
                        selectedDate={currentDate} 
                        onChange={setCurrentDate} 
                        availableMonths={availableMonths}
                    />
                    <Button onClick={() => setOpenSaleModal(true)}>
                        <Plus className="mr-2 w-4 h-4" />
                        Add Sale
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Dispatch
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="bg-white rounded-lg shadow-none">
                <DataTable
                    columns={saleColumns}
                    data={filteredData}
                    showPagination={true}
                    showGlobalFilter={true}
                    pageSize={20}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CardTotal 
                    header="Total Weight" 
                    value={totalWeight} 
                    type="weight" 
                    unit="tons" 
                />
                <CardTotal 
                    header="Total Sales" 
                    value={totalAmount} 
                    type="money"
                    isDebit={false}
                />
                <CardTotal 
                    header="Final Balance" 
                    value={Math.abs(finalSalesBalance)} 
                    type="money"
                    isDebit={finalSalesBalance < 0}
                />
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {calculationBreakdown.map((item, index) => (
                                <TableRow 
                                    key={index} 
                                    className={
                                        index === 2 || index === calculationBreakdown.length - 1 
                                            ? "font-bold" 
                                            : ""
                                    }
                                >
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell 
                                        className={`text-right ${
                                            item.amount >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        {currencyFormat.format(Math.abs(item.amount))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertModal
                isOpen={open}
                onClose={() => {
                    setOpen(false)
                    setDeletingSaleId(null)
                }}
                onConfirm={onDelete}
                loading={loading}
            />

            <SalesModal
                isOpen={openSaleModal}
                onClose={() => {
                    setOpenSaleModal(false)
                    setSelectedSale(null)
                }}
                onSaleAction={onSaleAction}
                parties={parties}
                selectedSale={selectedSale}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportDispatch
                    data={{
                        title: "Sales Table",
                        data: filteredData.map(sale => ({
                            date: sale.date,
                            name: sale.partyName,
                            truckNumber: sale.truckNumber,
                            truckWeight: sale.truckWeight,
                            rate: sale.rate,
                            amount: sale.totalAmount
                        })),
                        total: totalAmount,
                        additionalFields: ['truckNumber', 'truckWeight', 'rate']
                    }}
                    month={currentDate}
                    calculationBreakdown={calculationBreakdown}
                    previousBalance={previousBalance}
                    previousBalanceMonth={previousBalanceMonth}
                    totalExpenses={totalExpenses}
                    sectionId={sectionId}
                />
            </div>
        </div>
    )
}