import { DataTable } from "./DataTable"
import type { Column, Filter } from "./DataTable"
import { categories } from "@/models/data"

type Receipt = {
    date: Date
    sanctionOrder: string
    category: string
    amount: number
    attachment?: string
}

const receipts: Receipt[] = Array.from({ length: 10 }, () => ({
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    sanctionOrder: Math.random() > 0.5 ? (1000 + Math.floor(Math.random() * 9000)).toString() : `SO-${1000 + Math.floor(Math.random() * 9000)}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    amount: parseFloat((Math.random() * 100000).toFixed(2)),
    attachment: Math.random() > 0.5 ? "https://example.com/file.pdf" : undefined,
}))

const columns: Column<Receipt>[] = [
    { 
        key: "date", 
        label: "Date", 
        sortable: true, 
        format: d => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
    },
    { 
        key: "sanctionOrder", 
        label: "Sanction Order", 
        sortable: true 
    },
    { 
        key: "category", 
        label: "Category", 
        sortable: true 
    },
    { 
        key: "amount", 
        label: "Amount", 
        sortable: true, 
        className: "text-right", 
        format: a => `₹${a.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` 
    },
    {
        key: "attachment",
        label: "Attachment",
        format: url => url 
            ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> 
            : "-"
    }
]

const filters: Filter<Receipt>[] = [
    { 
        key: "sanctionOrder", 
        type: "text", 
        label: "Sanction Order", 
        placeholder: "Search Sanction Order" 
    },
    { 
        key: "category", 
        type: "select", 
        label: "Category", 
        options: categories 
    },
    { 
        key: "amountMin", 
        type: "number", 
        label: "Min Amount", 
        placeholder: "Min ₹",
        filterFn: (row, value) => row.amount >= +value
    },
    { 
        key: "amountMax", 
        type: "number", 
        label: "Max Amount", 
        placeholder: "Max ₹",
        filterFn: (row, value) => row.amount <= +value
    },
    { 
        key: "dateFrom", 
        type: "date", 
        label: "From Date",
        filterFn: (row, value) => row.date >= new Date(value)
    },
    { 
        key: "dateTo", 
        type: "date", 
        label: "To Date",
        filterFn: (row, value) => row.date <= new Date(value)
    },
]

export default function ReceiptsTable() {
    return <DataTable data={receipts} columns={columns} filters={filters} defaultSort="date" title="Receipts" />
}