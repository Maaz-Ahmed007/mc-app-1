"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { format, isValid, parse } from "date-fns"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/date-input"
import { NumberInput } from "@/components/number-input"

type Bill = {
    id: string
    date: string
    amount: number
}

type Labor = {
    id: string
    name: string
    sectionId: string
}

interface BillModalProps {
    isOpen: boolean
    onClose: () => void
    onBillAction: () => void
    labor: Labor | null
    selectedBill: Bill | null
    currentDate: Date
}

export const BillModal: React.FC<BillModalProps> = ({
    isOpen,
    onClose,
    onBillAction,
    labor,
    selectedBill,
    currentDate
}) => {
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")

    useEffect(() => {
        if (selectedBill) {
            let parsedDate = parse(selectedBill.date, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedDate)) {
                parsedDate = parse(selectedBill.date, 'dd-MM-yyyy', new Date());
            }
            
            if (isValid(parsedDate)) {
                setDate(format(parsedDate, 'yyyy-MM-dd'))
            } else {
                console.error("Invalid date format:", selectedBill.date);
                setDate(format(new Date(), 'yyyy-MM-dd'))
            }
            setAmount(selectedBill.amount.toString())
        } else {
            setDate(format(currentDate, 'yyyy-MM-dd'))
            setAmount("")
        }
    }, [selectedBill, isOpen, currentDate])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedDate)) {
                throw new Error("Invalid date");
            }
            const formattedDate = format(parsedDate, 'yyyy-MM-dd')
            const billData = {
                laborId: labor?.id,
                date: formattedDate,
                amount: parseFloat(amount),
            }
            if (selectedBill) {
                await axios.patch(`/api/${params.sectionId}/labor-bills?id=${selectedBill.id}`, billData)
                toast.success("Bill updated successfully")
            } else {
                await axios.post(`/api/${params.sectionId}/labor-bills`, billData)
                toast.success("Bill added successfully")
            }
            onBillAction()
            onClose()
        } catch (error) {
            console.error("Error processing bill:", error)
            toast.error("Failed to process bill")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={selectedBill ? "Edit Bill" : "Add Bill"}
            description="Enter the bill details"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <DateInput
                    id="date-input"
                    label="Date"
                    value={date}
                    onChange={setDate}
                />
                <NumberInput
                    id="amount-input"
                    label="Amount"
                    value={amount}
                    onChange={setAmount}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                    <Button disabled={loading} variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} onClick={handleSubmit}>
                        {selectedBill ? "Save changes" : "Create"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}