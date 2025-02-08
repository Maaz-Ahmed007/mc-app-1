"use client"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
interface Expense {
    id: string
    name: string
}
interface ExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    onExpenseAction: () => void
    initialData: Expense | null
}
export const ExpenseModal: React.FC<ExpenseModalProps> = ({
    isOpen,
    onClose,
    onExpenseAction,
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
                await axios.patch(`/api/${params.sectionId}/expenses?id=${initialData.id}`, data)
                toast.success("Expense updated successfully!")
            } else {
                await axios.post(`/api/${params.sectionId}/expenses`, {
                    ...data,
                    sectionId: params.sectionId
                })
                toast.success("Expense created successfully!")
            }
            onExpenseAction()
            onClose()
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }
   
    return (
        <Modal
            title={initialData ? "Edit Expense" : "Add a new Expense"}
            description={initialData ? "Edit the expense details" : "Enter the details for the new expense"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                    <label htmlFor="name">Expense Name</label>
                    <Input
                        id="name"
                        disabled={loading}
                        placeholder="Enter Expense name"
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