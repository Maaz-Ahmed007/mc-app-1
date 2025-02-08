import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const currencyFormat = new Intl.NumberFormat("en-PK", {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

export const weightFormat = (value: number): string => {
  return value.toFixed(3)
}

export const dateFormat = (date: Date | string): string => {
  return format(new Date(date), 'dd-MM-yyyy')
}