"use client"

import { useEffect, useState } from "react"

import { SectionModal } from "@/components/modals/section-modal"

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) { return null }

    return (
        <>
            <SectionModal />
        </>
    )
}