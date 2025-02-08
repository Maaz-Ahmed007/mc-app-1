"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { format, addYears, subYears, setMonth, setYear } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

interface MonthPickerProps {
  selectedDate: Date
  onChange: (date: Date) => void
  availableMonths: string[]
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ selectedDate, onChange, availableMonths = [] }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [tempYear, setTempYear] = useState(selectedDate.getFullYear())

	const availableYears = useMemo(() => {
		const years = new Set<number>()
		availableMonths.forEach(month => {
			years.add(parseInt(month.split('-')[0]))
		})
		return Array.from(years).sort((a, b) => b - a)
	}, [availableMonths])

	const handlePrevYear = () => setTempYear(prev => Math.max(...availableYears.filter(y => y < prev)))
	const handleNextYear = () => setTempYear(prev => Math.min(...availableYears.filter(y => y > prev)))
	
	const handleMonthSelect = (monthStr: string) => {
		const [year, month] = monthStr.split('-').map(Number)
		const newDate = setMonth(setYear(selectedDate, year), month - 1)
		onChange(newDate)
		setIsOpen(false)
	}

	const months = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	]

  	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button 
					variant="outline" 
					className="w-[200px] justify-start text-left font-normal"
				>
					<Calendar className="mr-2 h-4 w-4" />
					{format(selectedDate, "MMMM yyyy")}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0" align="start">
				<div className="flex items-center justify-between p-2 border-b">
					<Button 
						variant="ghost" 
						size="icon" 
						className="h-8 w-8" 
						onClick={handlePrevYear}
						disabled={tempYear === Math.min(...availableYears)}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="text-sm font-medium">
						{tempYear}
					</div>
					<Button 
						variant="ghost" 
						size="icon" 
						className="h-8 w-8" 
						onClick={handleNextYear}
						disabled={tempYear === Math.max(...availableYears)}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<div className="grid grid-cols-3 gap-2 p-2">
					{months.map((month, index) => {
						const monthStr = `${tempYear}-${String(index + 1).padStart(2, '0')}`
						const isAvailable = availableMonths.includes(monthStr)
						return (
						<Button
							key={month}
							variant="ghost"
							className={cn(
								"h-9 w-full",
								selectedDate.getMonth() === index && selectedDate.getFullYear() === tempYear
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted",
								!isAvailable && "opacity-50 cursor-not-allowed"
							)}
							onClick={() => isAvailable && handleMonthSelect(monthStr)}
							disabled={!isAvailable}
						>
							{month}
						</Button>
					)
					})}
				</div>
			</PopoverContent>
		</Popover>
    )
}