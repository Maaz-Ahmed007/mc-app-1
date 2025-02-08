"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
    title?: string
    description?: string
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title = "Are you sure?",
    description = "This action cannot be undone."
}) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <Modal
            title={title}
            description={description}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="w-full pt-6 space-y-4">
                <div className="flex items-center justify-center text-amber-500">
                    <AlertTriangle size={40} />
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <Button 
                        disabled={loading} 
                        variant="outline" 
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={loading} 
                        variant="destructive" 
                        onClick={onConfirm}
                    >
                        {loading ? "Processing..." : "Delete"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}