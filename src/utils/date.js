// Settings for the current date in the Bangkok time zone
export const today = () => {
    const now = new Date()
    return new Date(now.toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok'
    }))
}

// The date in YYYY-MM-DD format, which we set by default (Bangkok time zone)
export function todayFullDate() {
    const now = new Date()
    return now.toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Bangkok'
    })
}

// Current year and month in the format month YYYY (Bangkok time zone)
export function getTodayMonthName(date = today()) {
    const raw = date.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
    })
    return raw
        .replace(' г.', '')
        .replace(/^./, c => c.toLowerCase())
}

// Current year and month in YYYY-MM format (Bangkok time zone)
export function getTodayMonthKey(date = today()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
}

// Current day, month format (Bangkok time zone)
export function currentDayName(date) {
    const [ year, month, day ] = date.split('-').map(Number)
    return new Date (year, month - 1, day).toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })
}

// Current day, month format (Bangkok time zone)
export function currentMonthName(date) {
    const [ year, month, day ] = date.split('-').map(Number)
    return new Date (year, month - 1, day).toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })
}

// Total days in the selected month
// Result: number
export function getDaysInMonth(yearMonth) {
    const [ year, month ] = yearMonth.split('-').map(Number)
    return new Date(year, month, 0).getDate()
}

// All dates in the selected month
// Result: Array [ '2026-05-01', '2026-05-02', ... ]
export function getDatesInMonth(yearMonth) {
    const [ year, month ] = yearMonth.split('-')
    const daysInMonth =  new Date(Number(year), Number(month), 0).getDate()

    let datesInMonth = []

    for (let i = 1; i <= daysInMonth; i++) {
        datesInMonth.push(`${year}-${month}-${i.toString().padStart(2, '0')}`)
    }

    return datesInMonth
}





