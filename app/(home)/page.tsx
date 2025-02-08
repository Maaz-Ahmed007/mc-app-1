"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'

import { useSectionModal } from "@/hooks/use-section-modal"

const SetupPage = () => {
    const router = useRouter()

    const onOpen = useSectionModal((state) => state.onOpen)
    const isOpen = useSectionModal((state) => state.isOpen)
    const [isLoading, setIsLoading] = useState(true)
   
    useEffect(() => {
        async function checkForSections() {
            try {
                const response = await fetch('/api/sections');
                const data = await response.json();

                if (data.length > 0) {
                    router.push(`/${data[0].id}/sales`);
                } else {
                    onOpen();
                }
            } catch (error) {
                console.error("SetupPage: Error checking for sections", error);
            } finally {
                setIsLoading(false);
            }
        }

        checkForSections();
    }, [onOpen, router]);
   
    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to the Application</h1>
                <p className="mb-4">It looks like you don't have any sections set up yet.</p>
                <button
                    onClick={onOpen}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create Your First Section
                </button>
            </div>
        </div>
    )
}

export default SetupPage