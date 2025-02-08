"use client"

import axios from "axios"
import { toast } from "react-hot-toast"
import { format, parse } from "date-fns"
import { useState, useEffect } from "react"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { PartySelector } from "@/components/party-selector"
import { DateInput } from "@/components/date-input"
import { TextInput } from "@/components/text-input"
import { NumberInput } from "@/components/number-input"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"

interface MainSaleColumn {
    id: string
    date: string
    partyId: string
    sectionId: string
    partyName: string
    sectionName: string
    truckNumber: string
    truckWeight: number
    rate: number
    totalAmount: number
}

interface SaleModalProps {
    isOpen: boolean
    onClose: () => void
    onSaleAction: () => void
    parties: { id: string; name: string }[]
    sections: { id: string; sectionName: string }[]
    selectedSale: MainSaleColumn | null
}

export const SaleModal: React.FC<SaleModalProps> = ({
    isOpen,
    onClose,
    parties,
    sections,
    onSaleAction,
    selectedSale
}) => {
    const [loading, setLoading] = useState(false)
    const [sectionId, setSectionId] = useState("")
    const [partyId, setPartyId] = useState("")
    const [date, setDate] = useState("")
    const [truckNumber, setTruckNumber] = useState("")
    const [truckWeight, setTruckWeight] = useState("")
    const [rate, setRate] = useState("")

    useEffect(() => {
        if (selectedSale) {
            const parsedDate = parse(selectedSale.date, 'yyyy-MM-dd', new Date())
            setSectionId(selectedSale.sectionId)
            setPartyId(selectedSale.partyId)
            setDate(format(parsedDate, 'yyyy-MM-dd'))
            setTruckNumber(selectedSale.truckNumber)
            setTruckWeight(selectedSale.truckWeight.toString())
            setRate(selectedSale.rate.toString())
        } else {
            setSectionId("")
            setPartyId("")
            setDate(format(new Date(), 'yyyy-MM-dd'))
            setTruckNumber("")
            setTruckWeight("")
            setRate("")
        }
    }, [selectedSale, isOpen])

    const handleSubmit = async () => {
        if (!sectionId) {
            toast.error("Please select a section")
            return
        }
        if (!partyId) {
            toast.error("Please select a party")
            return
        }
    
        try {
            setLoading(true)
            const saleData = {
                sectionId,
                partyId,
                date,
                truckNumber,
                truckWeight: parseFloat(truckWeight),
                rate: parseInt(rate)
            }
    
            if (selectedSale) {
                await axios.patch(`/api/${sectionId}/sales`, saleData, {
                    params: {
                        id: selectedSale.id,
                        sectionId: selectedSale.sectionId
                    }
                })
            } else {
                await axios.post(`/api/${sectionId}/sales`, saleData)
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
                <div className="space-y-2">
                    <p className="text-sm font-medium">Section</p>
                    <Select
                        value={sectionId}
                        onValueChange={setSectionId}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((section) => (
                                <SelectItem
                                    key={section.id}
                                    value={section.id}
                                >
                                    {section.sectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Party</p>
                    <PartySelector
                        parties={parties}
                        onSelect={setPartyId}
                        selectedPartyId={partyId}
                    />
                </div>
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