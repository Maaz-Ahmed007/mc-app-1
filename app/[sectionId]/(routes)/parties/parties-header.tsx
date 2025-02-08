import { Plus, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { MonthPicker } from "@/components/month-picker"

interface PartiesHeaderProps {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    availableMonths: string[]
    onAddParty: () => void
    onPrintMonthlyList: () => void
    onPrintCashbook: () => void
}

export const PartiesHeader: React.FC<PartiesHeaderProps> = ({
    currentDate,
    setCurrentDate,
    availableMonths,
    onAddParty,
    onPrintMonthlyList,
    onPrintCashbook
}) => (
    <div className="flex items-center justify-between">
        <Heading
            title="Parties Management"
            description="View and manage all parties and their payments"
        />

        <div className="flex items-center space-x-2">
            <MonthPicker 
                selectedDate={currentDate} 
                onChange={setCurrentDate} 
                availableMonths={availableMonths}
            />

            <Button onClick={onAddParty}>
                <Plus className="mr-2 w-4 h-4" />
                Add Party
            </Button>
            
            <Button variant="outline" onClick={onPrintCashbook}>
                <Printer className="mr-2 w-4 h-4" />
                Print Cashbook
            </Button>

            <Button variant="outline" onClick={onPrintMonthlyList}>
                <Printer className="mr-2 w-4 h-4" />
                Print Monthly List
            </Button>
        </div>
    </div>
)