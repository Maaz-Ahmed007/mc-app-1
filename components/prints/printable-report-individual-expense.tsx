"use client"

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { currencyFormat } from '@/lib/utils'

import { useCompanyInfo } from '@/hooks/use-company-info'

const COMPANY_NAME = "ITTIFAQ MINING COMPANY"

interface Payment {
    id: string
    date: string
    details: string
    amount: number
}

interface PrintableReportIndividualExpenseProps {
    expenseName: string
    payments: Payment[]
    month: Date
    sectionId: string
    isAllTime: boolean
}

export const PrintableReportIndividualExpense: React.FC<PrintableReportIndividualExpenseProps> = ({ 
    expenseName,
    payments,
    month,
    sectionId,
    isAllTime
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

    const calculateBalance = () => {
        let balance = 0
        return payments.map(payment => {
            balance += payment.amount
            return { ...payment, balance }
        })
    }

    const transactionsWithBalance = calculateBalance()
    const totalExpenses = payments.reduce((sum, payment) => sum + payment.amount, 0)

    if (!isMounted || loading) {
        return <div>Loading...</div>; // Or any loading indicator you prefer
    }

    if (error || !companyInfo) {
        console.error('Failed to load company information');
        return <div>Error loading company information</div>;
    }

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
                    Section: {companyInfo.sectionName} | {expenseName} - Expense {isAllTime ? "" : `- ${format(month, 'MMMM yyyy')}`}
                </p>
                <p className="period-info">
                    {isAllTime 
                        ? "Complete Transaction History" 
                        : ``
                    }
                </p>
                <p className="text-sm text-gray-500">Issue Date: {issueDate}</p>
            </div>
            
            <div className="mb-8">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Details</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsWithBalance.map((transaction, index) => (
                            <tr key={index}>
                                <td>{format(parseISO(transaction.date), 'dd-MM-yyyy')}</td>
                                <td>{transaction.details}</td>
                                <td className="text-right">{currencyFormat.format(transaction.amount)}</td>
                                <td className="text-right">-</td>
                                <td className="text-right">{currencyFormat.format(transaction.balance)} DR</td>
                            </tr>
                        ))}
                        <tr className="total-row">
                            <td colSpan={2} className="text-right">Total:</td>
                            <td className="text-right">{currencyFormat.format(totalExpenses)}</td>
                            <td className="text-right">-</td>
                            <td className="text-right">{currencyFormat.format(totalExpenses)} DR</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}