"use client"

import axios from "axios"
import { toast } from "react-hot-toast"
import { parse, format } from "date-fns"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/date-input"
import { NumberInput } from "@/components/number-input"

import { Party, Payment } from "../columns"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onPaymentAction: () => void
    party: Party | null
    payment: Payment | null
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onPaymentAction,
    party,
    payment
}) => {
    const params = useParams()
    const sectionId = params.sectionId
    
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")
    const [details, setDetails] = useState("")
    
    useEffect(() => {
        if (payment) {
            const parsedDate = parse(payment.date, 'yyyy-MM-dd', new Date())
            setDate(format(parsedDate, 'yyyy-MM-dd'))
            setAmount(payment.amount.toString())
            setDetails(payment.details)
        } else {
            setDate(format(new Date(), 'yyyy-MM-dd'))
            setAmount("")
            setDetails("")
        }
    }, [payment, isOpen])

    const handleSubmit = async () => {
        if (!party) return

        try {
            setLoading(true)
            const formattedDate = format(parse(date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy')
            const paymentData = {
                partyId: party.id,
                sectionId,
                date: formattedDate,
                amount: parseFloat(amount),
                details: details.trim()
            }

            if (payment) {
                await axios.patch(`/api/${params.sectionId}/party-payments?id=${payment.id}`, paymentData)
                toast.success("Payment updated successfully")
            } else {
                await axios.post(`/api/${params.sectionId}/party-payments`, paymentData)
                toast.success("Payment added successfully")
            }
            onPaymentAction()
            onClose()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(`Failed to process payment: ${error.response?.data?.error || error.message}`)
            } else {
                toast.error("Failed to process payment")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={payment ? "Edit Payment" : "Add Payment"}
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
                        {payment ? "Update" : "Add"} Payment
                    </Button>
                </div>
            </div>
        </Modal>
    )
}