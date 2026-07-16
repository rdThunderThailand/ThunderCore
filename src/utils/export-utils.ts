/**
 * Generates and triggers a browser download for a CSV file.
 * @param data Array of objects to export
 * @param filename Desired filename (e.g., assets-export.csv)
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (!data || data.length === 0) return

    // Extract headers
    const headers = Object.keys(data[0])

    // Create rows
    const rows = data.map(obj =>
        headers.map(header => {
            let val = obj[header]
            // Format arrays or objects to string if needed
            if (val === null || val === undefined) val = ''
            if (Array.isArray(val)) val = val.join('; ')
            if (typeof val === 'object') val = JSON.stringify(val)

            // Escape quotes and wrap in quotes
            const stringVal = String(val).replace(/"/g, '""')
            return `"${stringVal}"`
        }).join(',')
    )

    // Join with newlines
    const csvContent = [headers.join(','), ...rows].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
