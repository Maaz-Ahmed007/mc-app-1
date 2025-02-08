import { create } from "zustand"

interface useSectionModalProps {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useSectionModal = create<useSectionModalProps>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}))