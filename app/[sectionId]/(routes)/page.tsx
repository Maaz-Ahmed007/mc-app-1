import { redirect } from "next/navigation"

const DashboardPage = async ({ params }: { params: { sectionId: string } }) => {
    return redirect(`/${params.sectionId}/sales`)
}

export default DashboardPage