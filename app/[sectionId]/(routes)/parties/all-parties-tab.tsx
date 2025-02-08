import { DataTable } from "@/components/data-table"

import { Party } from "./columns"

interface AllPartiesTabProps {
    data: Party[]
    partyColumns: any
}

export const AllPartiesTab: React.FC<AllPartiesTabProps> = ({ data, partyColumns }) => (
    <div className="bg-white rounded-lg shadow-md mt-4">
        <DataTable
            columns={partyColumns}
            data={data}
            showPagination={true}
            showGlobalFilter={true}
            pageSize={20}
        />
    </div>
)