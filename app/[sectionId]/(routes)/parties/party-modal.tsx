"use client"

import axios from "axios"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Party } from "./columns"

interface PartyModalProps {
    isOpen: boolean
    onClose: () => void
    onPartyAction: () => void
    initialData?: Party | null
}

export const PartyModal: React.FC<PartyModalProps> = ({ isOpen, onClose, onPartyAction, initialData }) => {
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name.toUpperCase())
        } else {
            setName("")
        }
    }, [isOpen, initialData])
   
    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Party name is required")
            return
        }
        try {
            setLoading(true)
            const data = { name: name.toUpperCase() }
            if (initialData) {
                await axios.patch(`/api/${params.sectionId}/parties?id=${initialData.id}`, data)
                toast.success("Party updated successfully!")
            } else {
                await axios.post(`/api/${params.sectionId}/parties`, {
                    ...data,
                    sectionId: params.sectionId
                })
                toast.success("Party created successfully!")
            }
            onPartyAction()
            onClose()
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }
   
    return (
        <Modal
            title={initialData ? "Edit Party" : "Add a new Party"}
            description={initialData ? "Edit the party details" : "Enter the details for the new party"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                    <label htmlFor="name">Party Name</label>
                    <Input
                        id="name"
                        disabled={loading}
                        placeholder="Enter party name"
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {initialData ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}