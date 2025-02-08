"use client"

import axios from "axios"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Labor {
    id: string
    name: string
}

interface LaborModalProps {
    isOpen: boolean
    onClose: () => void
    onLaborAction: () => void
    initialData: Labor | null
}

export const LaborModal: React.FC<LaborModalProps> = ({
    isOpen,
    onClose,
    onLaborAction,
    initialData
}) => {
    const params = useParams()

    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")

    useEffect(() => {
        if (isOpen) {
            setName(initialData ? initialData.name.toUpperCase() : "")
        }
    }, [isOpen, initialData])
    
    const handleSubmit = async () => {        
        try {
            setLoading(true)
            const data = { name: name.toUpperCase() }

            if (initialData) {
                await axios.patch(`/api/${params.sectionId}/labors?id=${initialData.id}`, data)
                toast.success("Labor updated successfully!")
            } else {
                await axios.post(`/api/${params.sectionId}/labors`, {
                    ...data,
                    sectionId: params.sectionId
                })
                toast.success("Labor created successfully!")
            }
            onLaborAction()
            onClose()
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <Modal
            title={initialData ? "Edit Labor" : "Add a new Labor"}
            description={initialData ? "Edit the labor details" : "Enter the details for the new labor"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                    <label htmlFor="name">Labor Name</label>
                    <Input 
                        id="name"
                        disabled={loading} 
                        placeholder="Enter Labor name" 
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                    />
                </div>
                <div className="space-y-2">
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