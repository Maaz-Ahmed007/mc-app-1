import { redirect } from "next/navigation"

import { prismadb } from "@/lib/prismadb"

import { SettingsForm } from "./components/settings-form"


interface SettingsPageProps {
    params: { sectionId: string }
}

const SettingsPage: React.FC<SettingsPageProps> = async ({
    params
}) => {
    const section = await prismadb.section.findFirst({
        where: {
            id: params.sectionId
        }
    })

    if (!section) {
        redirect("/")
    }
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SettingsForm initialData={section} />
            </div>
        </div>
    )
}

export default SettingsPage