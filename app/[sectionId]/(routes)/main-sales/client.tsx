"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Printer } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo, useRef } from "react"
import { parseISO, startOfMonth, endOfMonth, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { CardTotal } from "@/components/card-total"
import { DataTable } from "@/components/data-table"
import { Separator } from "@/components/ui/separator"
import { MonthPicker } from "@/components/month-picker"
import { AlertModal } from "@/components/modals/alert-modal"
import { PrintableReportMainSales } from "@/components/prints/printable-report-main-sales"

import { MainSaleColumn, columns } from "./columns"
import { SaleModal } from "./sales-modal"

interface MainSaleClientProps {
    data: MainSaleColumn[]
    sections: { id: string; sectionName: string }[]
    parties: { id: string; name: string }[]
}

export const MainSaleClient: React.FC<MainSaleClientProps> = ({ data, sections, parties }) => {   
    const params = useParams()
    const router = useRouter()
    
    const printRef = useRef<HTMLDivElement>(null)

    const sectionId = Array.isArray(params.sectionId) ? params.sectionId[0] : params.sectionId

    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [openSaleModal, setOpenSaleModal] = useState(false)

    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedSale, setSelectedSale] = useState<MainSaleColumn | null>(null)
    const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null)

    const {
        filteredData,
        totalWeight,
        totalAmount,
    } = useMemo(() => {
        const startDate = startOfMonth(currentDate)
        const endDate = endOfMonth(currentDate)
        
        const filteredData = data.filter((sale) => {
            const saleDate = parseISO(sale.date)
            return saleDate >= startDate && saleDate <= endDate
        })

        const totalWeight = filteredData.reduce((sum, sale) => sum + sale.truckWeight, 0)
        const totalAmount = filteredData.reduce((sum, sale) => sum + sale.totalAmount, 0)

        return {
            filteredData,
            totalWeight,
            totalAmount,
        }
    }, [data, currentDate])

    const availableMonths = useMemo(() => {
        const months = new Set<string>()
        data.forEach(sale => {
            const date = parseISO(sale.date)
            months.add(format(date, 'yyyy-MM'))
        })
        return Array.from(months).sort()
    }, [data])

    const handleEdit = (sale: MainSaleColumn) => {
        setSelectedSale(sale)
        setOpenSaleModal(true)
    }

    const handleDelete = (id: string) => {
        setDeletingSaleId(id)
        setOpenDeleteModal(true)
    }

    const onConfirmDelete = async () => {
        if (!deletingSaleId) return

        try {
            setLoading(true)
            await axios.delete(`/api/${params.sectionId}/sales`, {
                params: {
                    id: deletingSaleId,
                    sectionId: params.sectionId
                }
            })
            toast.success("Sale deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
            setOpenDeleteModal(false)
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
                    <Button onClick={() => {
                        setSelectedSale(null)
                        setOpenSaleModal(true)
                    }}>
                        <Plus className="mr-2 w-4 h-4" />
                        Add Sale
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 w-4 h-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="bg-white rounded-lg shadow-none">
                <DataTable
                    columns={columns(handleEdit, handleDelete)}
                    data={filteredData}
                    showPagination={true}
                    showGlobalFilter={true}
                    pageSize={20}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            </div>

            <AlertModal
                isOpen={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false)
                    setDeletingSaleId(null)
                }}
                onConfirm={onConfirmDelete}
                loading={loading}
            />

            <SaleModal
                isOpen={openSaleModal}
                onClose={() => {
                    setOpenSaleModal(false)
                    setSelectedSale(null)
                }}
                onSaleAction={() => {
                    setOpenSaleModal(false)
                    setSelectedSale(null)
                    router.refresh()
                }}
                parties={parties}
                sections={sections}
                selectedSale={selectedSale}
            />

            <div ref={printRef} className="hidden">
                <PrintableReportMainSales
                    data={{
                        title: "Main Sales Table",
                        data: filteredData.map(sale => ({
                            date: sale.date,
                            name: sale.partyName,
                            section: sale.sectionName,
                            truckNumber: sale.truckNumber,
                            truckWeight: sale.truckWeight,
                            rate: sale.rate,
                            amount: sale.totalAmount
                        })),
                        total: totalAmount,
                        additionalFields: ['section', 'truckNumber', 'truckWeight', 'rate']
                    }}
                    month={currentDate}
                    totalWeight={totalWeight}
                    sectionId={sectionId}
                />
            </div>
        </div>
    )
}