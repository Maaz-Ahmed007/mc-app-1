import { currencyFormat, weightFormat } from '@/lib/utils'
import { CreditCard, Scale, DollarSign, ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

interface CardTotalProps {
    header: string
    value: number | string
    type: 'money' | 'weight' | 'other'
    unit?: string
    isDebit?: boolean
}

export const CardTotal: React.FC<CardTotalProps> = ({
    header,
    value,
    type,
    unit,
    isDebit = false
}) => {
    const getIcon = () => {
        switch (type) {
            case 'money':
                return <DollarSign className="h-4 w-4 text-primary" />
            case 'weight':
                return <Scale className="h-4 w-4 text-primary" />
            default:
                return <CreditCard className="h-4 w-4 text-primary" />
        }
    }

    const formatValue = () => {
        if (type === 'money' && typeof value === 'number') {
            return currencyFormat.format(value)
        } else if (type === 'weight' && typeof value === 'number') {
            return `${weightFormat(value)} ${unit || 'tons'}`
        } else if (typeof value === 'number') {
            return value.toFixed(2)
        } else {
            return value.toString()
        }
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {header}
                </CardTitle>
                {getIcon()}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold flex items-center ${
                    type === 'money'
                        ? (isDebit ? 'text-destructive' : 'text-green-500')
                        : ''
                }`}>
                    {type === 'money' && (
                        isDebit
                            ? <ArrowDownIcon className="mr-1 text-destructive" size={24} />
                            : <ArrowUpIcon className="mr-1 text-green-500" size={24} />
                    )}
                    {formatValue()}
                </div>
            </CardContent>
        </Card>
    )
}