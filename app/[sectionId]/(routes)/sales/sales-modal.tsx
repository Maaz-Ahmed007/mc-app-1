"use client"

import axios from "axios"
import { toast } from "react-hot-toast"
import { format, parse } from "date-fns"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { PartySelector } from "@/components/party-selector"
import { DateInput } from "@/components/date-input"
import { TextInput } from "@/components/text-input"
import { NumberInput } from "@/components/number-input"

import { SaleColumn } from "./columns"

interface SalesModalProps {
    isOpen: boolean
    onClose: () => void
    onSaleAction: () => void
    parties: { id: string; name: string }[]
    selectedSale: SaleColumn | null
}

export const SalesModal: React.FC<SalesModalProps> = ({
    isOpen,
    onClose,
    parties,
    onSaleAction,
    selectedSale
}) => {
    const params = useParams()

    const [loading, setLoading] = useState(false)
    const [partyId, setPartyId] = useState("")
    const [date, setDate] = useState("")
    const [truckNumber, setTruckNumber] = useState("")
    const [truckWeight, setTruckWeight] = useState("")
    const [rate, setRate] = useState("")

    useEffect(() => {
        if (selectedSale) {
            const parsedDate = parse(selectedSale.date, 'yyyy-MM-dd', new Date())
            setPartyId(selectedSale.partyId)
            setDate(format(parsedDate, 'yyyy-MM-dd'))
            setTruckNumber(selectedSale.truckNumber)
            setTruckWeight(selectedSale.truckWeight.toString())
            setRate(selectedSale.rate.toString())
        } else {
            setPartyId("")
            setDate(format(new Date(), 'yyyy-MM-dd'))
            setTruckNumber("")
            setTruckWeight("")
            setRate("")
        }
    }, [selectedSale, isOpen])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const saleData = {
                sectionId: params.sectionId,
                partyId,
                date,
                truckNumber,
                truckWeight: parseFloat(truckWeight),
                rate: parseInt(rate)
            }
    
            if (selectedSale) {
                await axios.patch(`/api/${params.sectionId}/sales`, saleData, {
                    params: {
                        id: selectedSale.id,
                        sectionId: params.sectionId
                    }
                })
            } else {
                await axios.post(`/api/${params.sectionId}/sales`, saleData)
            }
            toast.success(selectedSale ? "Sale updated." : "Sale created.")
            onSaleAction()
        } catch (error) {
            console.error("Error saving sale:", error)
            toast.error("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={selectedSale ? "Edit Sale" : "Add Sale"}
            description={selectedSale ? "Edit the sale details" : "Enter the sale details"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <PartySelector
                    parties={parties}
                    onSelect={setPartyId}
                    selectedPartyId={partyId}
                />
                <DateInput
                    id="date-input"
                    label="Date"
                    value={date}
                    onChange={setDate}
                />
                <TextInput
                    id="truck-number-input"
                    label="Truck Number"
                    value={truckNumber}
                    onChange={setTruckNumber}
                    uppercase
                />
                <NumberInput
                    id="truck-weight-input"
                    label="Truck Weight"
                    value={truckWeight}
                    onChange={setTruckWeight}
                />
                <NumberInput
                    id="rate-input"
                    label="Rate"
                    value={rate}
                    onChange={setRate}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                    <Button disabled={loading} variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} onClick={handleSubmit}>
                        {selectedSale ? "Save changes" : "Create"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}