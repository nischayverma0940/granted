import { DataTable } from "./DataTable"
import type { Column, Filter } from "./DataTable"
import { categories, subCategories, departments } from "@/models/data"

type Expenditure = {
    date: Date
    paymentOrder: string
    category: string
    subCategory: string
    department: string
    expenditure: number
    attachment?: string
}

const expenditures: Expenditure[] = Array.from({ length: 15 }, () => ({
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    paymentOrder: Math.random() > 0.5 ? (1000 + Math.floor(Math.random() * 9000)).toString() : `PO-${1000 + Math.floor(Math.random() * 9000)}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    subCategory: subCategories[Math.floor(Math.random() * subCategories.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    expenditure: parseFloat((Math.random() * 50000).toFixed(2)),
    attachment: Math.random() > 0.5 ? "https://example.com/file.pdf" : undefined,
}))

const columns: Column<Expenditure>[] = [
    { 
        key: "date", 
        label: "Date", 
        sortable: true, 
        format: d => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
    },
    { 
        key: "paymentOrder", 
        label: "Payment Order", 
        sortable: true 
    },
    { 
        key: "category", 
        label: "Category", 
        sortable: true 
    },
    { 
        key: "subCategory", 
        label: "Sub-category", 
        sortable: true 
    },
    { 
        key: "department", 
        label: "Department", 
        sortable: true 
    },
    { 
        key: "expenditure", 
        label: "Expenditure", 
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

const filters: Filter<Expenditure>[] = [
    { 
        key: "paymentOrder", 
        type: "text", 
        label: "Payment Order", 
        placeholder: "Search Payment Order" 
    },
    { 
        key: "category", 
        type: "select", 
        label: "Category", 
        options: categories 
    },
    { 
        key: "subCategory", 
        type: "select", 
        label: "Sub-category", 
        options: subCategories 
    },
    { 
        key: "department", 
        type: "select", 
        label: "Department", 
        options: departments 
    },
    { 
        key: "expenditureMin", 
        type: "number", 
        label: "Min Expenditure", 
        placeholder: "Min ₹",
        filterFn: (row, value) => row.expenditure >= +value
    },
    { 
        key: "expenditureMax", 
        type: "number", 
        label: "Max Expenditure", 
        placeholder: "Max ₹",
        filterFn: (row, value) => row.expenditure <= +value
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

export default function ExpendituresTable() {
    return <DataTable data={expenditures} columns={columns} filters={filters} defaultSort="date" title="Expenditures" />
}