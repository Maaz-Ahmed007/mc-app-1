import { format } from "date-fns"
import { prismadb } from "@/lib/prismadb"

import { MainSaleColumn } from "./columns"
import { MainSaleClient } from "./client"

const MainSalesPage = async ({
    params
}: {
    params: { sectionId: string }
}) => {
    const [sales, sections, parties] = await Promise.all([
        prismadb.sale.findMany({
            orderBy: { date: "asc" },
            include: {
                party: true,
                section: true
            }
        }),
        prismadb.section.findMany({
            select: {
                id: true,
                sectionName: true
            }
        }),
        prismadb.party.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        })
    ])

    const formattedSales: MainSaleColumn[] = sales.map((item) => ({
        id: item.id,
        date: format(item.date, "yyyy-MM-dd"),
        partyId: item.partyId,
        sectionId: item.sectionId,
        partyName: item.party.name,
        sectionName: item.section.sectionName,
        truckNumber: item.truckNumber,
        truckWeight: item.truckWeight,
        rate: item.rate,
        totalAmount: item.total
    }))
   
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MainSaleClient 
                    data={formattedSales}
                    sections={sections}
                    parties={parties}
                />
            </div>
        </div>
    )
}
export default MainSalesPage