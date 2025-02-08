"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { Trash, Eye, EyeOff } from "lucide-react"
import { Section } from "@prisma/client"
import { toast } from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"

import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { AlertModal } from "@/components/modals/alert-modal"

const formSchema = z.object({
    sectionName: z.string().min(1),
    telephone: z.string().optional().nullable(),
    mobileWazir: z.string().optional().nullable(),
    mobileDin: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(4).optional(),
})

interface SettingFormProps {
    initialData: Section
}

type SettingsFormValues = z.infer<typeof formSchema>

export const SettingsForm: React.FC<SettingFormProps> = ({
    initialData
}) => {
    const params = useParams()
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sectionName: initialData.sectionName,
            telephone: initialData.telephone || undefined,
            mobileWazir: initialData.mobileWazir || undefined,
            mobileDin: initialData.mobileDin || undefined,
            email: initialData.email || undefined,
            currentPassword: "",
            newPassword: "",
        }
    })

    const onSubmit = async (data: SettingsFormValues) => {
        try {
            setLoading(true)
            await axios.patch(`/api/sections/${params.sectionId}`, data)

            router.refresh()
            toast.success(`Section updated!`)
        } catch (error) {
            toast.error("Something went wrong!")
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            await axios.delete(`/api/sections/${params.sectionId}`)

            router.refresh()
            router.push("/")
            toast.success("Section deleted!")
        } catch (error) {
            toast.error("Delete everything in this section before deleting this!")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }
    
    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title="Settings"
                    description="Manage section and company information"
                />
                <Button
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                    onClick={() => setOpen(true)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>

            <Separator />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-full"
                >
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="sectionName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Section Name</FormLabel>
                                    <FormControl>
                                        <Input
                                        disabled={loading}
                                        placeholder="Section Name"
                                        {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="telephone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Telephone</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Company Telephone"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="mobileWazir"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Wazir Khan Tareen Mobile</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Mobile number"
                                            {...field} 
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="mobileDin"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Din Muhammad Nasar Mobile</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Mobile number"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Company Email"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                            type={showPassword ? "text" : "password"}
                                            disabled={loading}
                                            placeholder="Current Password"
                                            {...field} />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="newPassword"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>New Password (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                            type={showPassword ? "text" : "password"}
                                            disabled={loading}
                                            placeholder="New Password"
                                            {...field} />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                    </div>
                    <Button
                        disabled={loading}
                        className="ml-auto"
                        type="submit"
                    >
                        Save changes
                    </Button>
                </form>
            </Form>
        </>
    )
}