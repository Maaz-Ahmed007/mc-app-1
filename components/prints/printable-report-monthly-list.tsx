"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { cn, currencyFormat } from '@/lib/utils'

import { useCompanyInfo } from '@/hooks/use-company-info'

const COMPANY_NAME = "ITTIFAQ MINING COMPANY"

interface FinalValueItem {
    id: string;
    name: string;
    finalValue: number;
    isFinalValueCredit: boolean;
    type: 'party' | 'labor' | 'sales' | 'cashbook';
}

interface PrintableReportMonthlyListProps {
    month: Date
    monthlyParties: FinalValueItem[]
    monthlyLabors: FinalValueItem[]
    monthlySales: FinalValueItem[]  // Added this prop
    previousBalance: number
    cashbookFinalBalance: number
    isCashbookFinalBalanceCredit: boolean
    sectionId: string
}

export const PrintableReportMonthlyList: React.FC<PrintableReportMonthlyListProps> = ({ 
    month,
    monthlyParties,
    monthlyLabors,
    monthlySales,  // Added this prop
    previousBalance,
    cashbookFinalBalance,
    isCashbookFinalBalanceCredit,
    sectionId
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const { companyInfo, loading, error } = useCompanyInfo(sectionId)
    
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const issueDate = format(new Date(), 'dd-MM-yyyy')

    const printStyles = `
        @page { 
            size: portrait; 
            margin: 1.5cm; 
        }
        body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #fff;
        }
        .print-content { 
            display: block !important; 
        }
        .header-content {
            text-align: center;
            width: 100%;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f8f8;
            border-bottom: 2px solid #ddd;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .company-info {
            font-size: 0.8em;
            color: #666;
        }
        .tables-container {
            display: flex;
            justify-content: space-between;
            gap: 2rem;
        }
        .table-section {
            flex: 1;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            page-break-inside: auto;
            margin-bottom: 20px;
            font-size: 0.9em;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        tr { 
            page-break-inside: avoid; 
            page-break-after: auto;
        }
        thead { 
            display: table-header-group; 
        }
        tfoot { 
            display: table-footer-group; 
        }
        th, td { 
            border: 1px solid #e0e0e0; 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background-color: #f4f4f4; 
            font-weight: bold;
            color: #333;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 4em;
            color: rgba(200, 200, 200, 0.1);
            z-index: -1;
        }
        .total-row {
            font-weight: bold;
            background-color: #f0f0f0;
        }
        .debit-amount {
            color: #dc2626;
        }
        .credit-amount {
            color: #16a34a;
        }
        @media print {
            body { margin: 0; }
            .print-content {
                page-break-after: always;
            }
            .print-content:last-child {
                page-break-after: avoid;
            }
        }
    `

    if (!isMounted || loading) {
        return <div>Loading...</div>; // Or any loading indicator you prefer
    }

    if (error || !companyInfo) {
        console.error('Failed to load company information');
        return <div>Error loading company information</div>;
    }

    const debitItems: FinalValueItem[] = []
    const creditItems: FinalValueItem[] = []

     // Distribute parties (now showing cumulative balances)
     monthlyParties.forEach(party => {
        if (party.isFinalValueCredit) {
            creditItems.push({...party, finalValue: Math.abs(party.finalValue)})
        } else {
            debitItems.push({...party, finalValue: Math.abs(party.finalValue)})
        }
    })

    // Distribute labors (now showing cumulative balances)
    monthlyLabors.forEach(labor => {
        if (labor.isFinalValueCredit) {
            creditItems.push({...labor, finalValue: Math.abs(labor.finalValue)})
        } else {
            debitItems.push({...labor, finalValue: Math.abs(labor.finalValue)})
        }
    })

    // Distribute sales (showing current month balance)
    monthlySales.forEach(sale => {
        if (sale.isFinalValueCredit) {
            creditItems.push({...sale, finalValue: Math.abs(sale.finalValue)})
        } else {
            debitItems.push({...sale, finalValue: Math.abs(sale.finalValue)})
        }
    })

    // Add cashbook final balance (opposite of its actual balance)
    if (Math.abs(cashbookFinalBalance) > 0) {
        if (isCashbookFinalBalanceCredit) {
            debitItems.push({
                id: 'cashbook',
                name: 'Cashbook Final Balance',
                finalValue: Math.abs(cashbookFinalBalance),
                isFinalValueCredit: false,
                type: 'cashbook'
            })
        } else {
            creditItems.push({
                id: 'cashbook',
                name: 'Cashbook Final Balance',
                finalValue: Math.abs(cashbookFinalBalance),
                isFinalValueCredit: true,
                type: 'cashbook'
            })
        }
    }

    const renderTable = (items: FinalValueItem[], title: string, isDebit: boolean) => (
        <div className="table-section">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th className="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td className="capitalize">{item.type}</td>
                            <td className="text-right">
                                {currencyFormat.format(item.finalValue)}
                            </td>
                        </tr>
                    ))}
                    <tr className="total-row">
                        <td colSpan={2}>Total</td>
                        <td className="text-right font-bold">
                            {currencyFormat.format(items.reduce((sum, item) => sum + item.finalValue, 0))}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="print-content p-8 max-w-7xl mx-auto bg-white">
            <style type="text/css" media="print">{printStyles}</style>
            <div className="watermark">{COMPANY_NAME}</div>
            <div className="header-content">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{COMPANY_NAME}</h1>
                <div className="company-info mb-4">
                    <p>
                        {companyInfo.telephone && `Tel: ${companyInfo.telephone}`}
                        {companyInfo.telephone && companyInfo.email && " | "}
                        {companyInfo.email && `Email: ${companyInfo.email}`}
                    </p>
                    <p>
                        {companyInfo.mobileWazir && `Wazir Khan Tareen: ${companyInfo.mobileWazir}`}
                        {companyInfo.mobileWazir && companyInfo.mobileDin && " | "}
                        {companyInfo.mobileDin && `Din Muhammad Nasar: ${companyInfo.mobileDin}`}
                    </p>
                </div>
                <p className="text-2xl font-semibold text-gray-700 mb-2">
                    Section: {companyInfo.sectionName} | Monthly List - {format(month, 'MMMM yyyy')}
                </p>
                <p className="text-sm text-gray-500">Issue Date: {issueDate}</p>
            </div>
            
            <div className="tables-container">
                {renderTable(debitItems, "Debits", true)}
                {renderTable(creditItems, "Credits", false)}
            </div>
        </div>
    )
}