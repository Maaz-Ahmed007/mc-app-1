"use client"

import { useParams, useRouter } from "next/navigation"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/data-table"

import { MainParty, mainPartyColumns } from "./columns"

interface MainPartyClientProps {
    data: MainParty[]
}

export const MainPartyClient: React.FC<MainPartyClientProps> = ({ data }) => {
    const router = useRouter()
    const params = useParams()
    
    const handleViewParty = (id: string) => {
        window.open(`/${params.sectionId}/main-parties/${id}`, '_blank')
    }

    const columns = mainPartyColumns(handleViewParty)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title="Main Parties"
                    description="View all parties and their transactions across all sections."
                />
            </div>

            <Separator />

            <div className="bg-white rounded-lg shadow-none">
                <DataTable
                    columns={columns}
                    data={data}
                    showPagination={true}
                    showGlobalFilter={true}
                    pageSize={20}
                />
            </div>
        </div>
    )
}