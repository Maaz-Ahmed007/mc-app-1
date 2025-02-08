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
    sectionName: string
}

interface Sale {
    id: string
    date: string
    truckNumber: string
    truckWeight: number
    rate: number
    total: number
    sectionName: string
}

interface CombinedSale extends Sale {
    balance: number
    type: 'sale'
}

interface CombinedPayment extends Payment {
    balance: number
    type: 'payment'
}

interface CombinedCancelledPayment extends Payment {
    balance: number
    type: 'cancelled'
}

type CombinedTransaction = CombinedSale | CombinedPayment | CombinedCancelledPayment

interface PrintableReportMainPartyProps {
    partyName: string
    payments: Payment[]
    cancelledPayments: Payment[]
    sales: Sale[]
    month: Date
    sectionId: string
    isAllTime: boolean
}

export const PrintableReportMainParty: React.FC<PrintableReportMainPartyProps> = ({ 
    partyName,
    payments,
    cancelledPayments,
    sales,
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
        .section-row {
            background-color: #f8f8f8;
            font-style: italic;
            color: #666;
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

    const sortedTransactions = [
        ...payments.map(p => ({ ...p, type: 'payment' as const })),
        ...cancelledPayments.map(p => ({ ...p, type: 'cancelled' as const })),
        ...sales.map(s => ({ ...s, type: 'sale' as const }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const calculateBalance = (): CombinedTransaction[] => {
        let balance = 0
        return sortedTransactions.map(transaction => {
            if (transaction.type === 'sale') {
                balance -= transaction.total
                return { ...transaction, balance } as CombinedSale
            } else if (transaction.type === 'payment') {
                balance += transaction.amount
                return { ...transaction, balance } as CombinedPayment
            } else { // cancelled payment
                balance -= transaction.amount
                return { ...transaction, balance } as CombinedCancelledPayment
            }
        })
    }

    const transactions = calculateBalance()

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalCancelledPayments = cancelledPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Final balance calculation including cancelled payments
    const netDebit = totalSales + totalCancelledPayments
    const finalBalance = totalPayments - netDebit
    const isFinalBalanceCredit = finalBalance >= 0

    const isSale = (transaction: CombinedTransaction): transaction is CombinedSale => {
        return transaction.type === 'sale'
    }

    const isPayment = (transaction: CombinedTransaction): transaction is CombinedPayment => {
        return transaction.type === 'payment'
    }

    const isCancelledPayment = (transaction: CombinedTransaction): transaction is CombinedCancelledPayment => {
        return transaction.type === 'cancelled'
    }

    if (!isMounted || loading) {
        return <div>Loading...</div>
    }

    if (error || !companyInfo) {
        console.error('Failed to load company information')
        return <div>Error loading company information</div>
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
                    {partyName} - All Sections {isAllTime ? "" : `- ${format(month, 'MMMM yyyy')}`}
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
                {transactions.length > 0 ? (
                    <>
                        <table className="mb-8">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Section</th>
                                    <th>Details</th>
                                    <th>Truck Number</th>
                                    <th>Truck Weight</th>
                                    <th>Rate</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, index) => (
                                    <tr key={index} className={isCancelledPayment(transaction) ? 'cancelled-row' : ''}>
                                        <td>{format(parseISO(transaction.date), 'dd-MM-yyyy')}</td>
                                        <td>{transaction.sectionName}</td>
                                        <td>
                                            {isPayment(transaction) ? transaction.details :
                                            isCancelledPayment(transaction) ? `Cancelled: ${transaction.details}` :
                                            'Sale'}
                                        </td>
                                        <td>{isSale(transaction) ? transaction.truckNumber : '-'}</td>
                                        <td>{isSale(transaction) ? `${transaction.truckWeight.toFixed(3)}` : '-'}</td>
                                        <td>{isSale(transaction) ? currencyFormat.format(transaction.rate) : '-'}</td>
                                        <td className="debit-amount">
                                            {isSale(transaction) ? currencyFormat.format(transaction.total) :
                                            isCancelledPayment(transaction) ? currencyFormat.format(transaction.amount) :
                                            '-'}
                                        </td>
                                        <td className="credit-amount">
                                            {isPayment(transaction) ? currencyFormat.format(transaction.amount) : '-'}
                                        </td>
                                        <td>
                                            {currencyFormat.format(Math.abs(transaction.balance))} {transaction.balance >= 0 ? 'CR' : 'DR'}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={6} className="text-right">Totals:</td>
                                    <td className="debit-amount">{currencyFormat.format(totalSales + totalCancelledPayments)}</td>
                                    <td className="credit-amount">{currencyFormat.format(totalPayments)}</td>
                                    <td>
                                        {currencyFormat.format(Math.abs(finalBalance))} {isFinalBalanceCredit ? 'CR' : 'DR'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>No transactions available for this period.</p>
                )}
            </div>
        </div>
    )
}