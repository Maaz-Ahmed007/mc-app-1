"use client"

import * as z from "zod"
import axios from 'axios'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useSectionModal } from "@/hooks/use-section-modal"
import { Modal } from "../ui/modal"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    sectionName: z.string().min(1, "Section name is required"),
})

export const SectionModal = () => {
    const sectionModal = useSectionModal()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sectionName: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)
            const response = await axios.post('/api/sections', values)
            toast.success(`Section ${values.sectionName} created!`)
            window.location.assign(`/${response.data.id}`)
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="Create section"
            description="Add a new section to your project."
            isOpen={sectionModal.isOpen}
            onClose={sectionModal.onClose}
        >
            <div className="space-y-4 py-2 pb-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sectionName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="e.g., Site 1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                            <Button
                                type="button"
                                disabled={loading}
                                variant="outline"
                                onClick={sectionModal.onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Modal>
    )
}