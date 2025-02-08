"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { format, isValid, parse } from "date-fns"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/date-input"
import { NumberInput } from "@/components/number-input"

type Payment = {
    id: string
    date: string
    details: string
    amount: number
}

type Expense = {
    id: string
    name: string
    sectionId: string
    payments: Payment[]
}

type ExpenseColumn = {
    id: string
    name: string
    sectionId: string
}

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onPaymentAction: () => void
    expense: Expense | ExpenseColumn | null
    selectedPayment: Payment | null
    currentDate: Date
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onPaymentAction,
    expense,
    selectedPayment,
    currentDate
}) => {
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")
    const [details, setDetails] = useState("")

    useEffect(() => {
        if (selectedPayment) {
            let parsedDate = parse(selectedPayment.date, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedDate)) {
                parsedDate = parse(selectedPayment.date, 'dd-MM-yyyy', new Date());
            }
            
            if (isValid(parsedDate)) {
                setDate(format(parsedDate, 'yyyy-MM-dd'))
            } else {
                console.error("Invalid date format:", selectedPayment.date);
                setDate(format(new Date(), 'yyyy-MM-dd'))
            }
            setAmount(selectedPayment.amount.toString())
            setDetails(selectedPayment.details)
        } else {
            setDate(format(currentDate, 'yyyy-MM-dd'))
            setAmount("")
            setDetails("")
        }
    }, [selectedPayment, isOpen, currentDate])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedDate)) {
                throw new Error("Invalid date");
            }
            const formattedDate = format(parsedDate, 'yyyy-MM-dd')
            const paymentData = {
                expenseId: expense?.id,
                date: formattedDate,
                amount: parseFloat(amount),
                details: details.trim()
            }
            if (selectedPayment) {
                await axios.patch(`/api/${params.sectionId}/expense-payments?id=${selectedPayment.id}`, paymentData)
                toast.success("Payment updated successfully")
            } else {
                await axios.post(`/api/${params.sectionId}/expense-payments`, paymentData)
                toast.success("Payment added successfully")
            }
            onPaymentAction()
            onClose()
        } catch (error) {
            console.error("Error processing payment:", error)
            toast.error("Failed to process payment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={selectedPayment ? "Edit Payment" : "Add Payment"}
            description="Enter the payment details"
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
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Details</Label>
                    <Input
                        id="details-input"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Enter payment details"
                        required
                    />
                </div>
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
                        {selectedPayment ? "Save changes" : "Create"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}