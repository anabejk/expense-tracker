import { CONFIG } from "../../config.js";
import { getReadableError } from '../../utils/getReadableError.js'
import { getTodayMonthKey, getTodayMonthName, todayFullDate, getDatesInMonth } from "../../utils/date.js";
import { createId } from '../../utils/id.js'
import appModal from "../../components/AppModal.vue";
import {getTransitionRawChildren} from "vue";

const EXTRA_COLORS = ['#bc634c', '#a5292d', '#9b69b1', '#048546', '#8f2e5d', '#c38406', '#5849b2']
const FALLBACK_COLOR = '#9aa0a6'

function pickFreeColor(categoryColors) {
    const usedColors = Object.values(categoryColors)
    return EXTRA_COLORS.find(color => !usedColors.includes(color)) || FALLBACK_COLOR
}

export default {
    namespaced: true,

    state() {
        return {
            categories: {
                'еда':          '#ea6c5a',
                'продукты':     '#0f6a31',
                'алкоголь':     '#814a8d',
                'красота':      '#d365aa',
                'здоровье':     '#0c9c81',
                'спорт':        '#749c0b',
                'шоппинг':      '#b63c64',
                'транспорт':    '#0167ab',
                'байк':         '#1f99c7',
                'развлечения':  '#a77bf7',
                'мелочи':       '#957602',
                'стирка':       '#6076de',
                'быт':          '#904701'
            },
            form: {
                date: '',
                amount: 0,
                category: '',
                comment: ''
            },
            allExpenses: [],
            successMsg: '',
            selectedMonth: '',
            availableMonths: [],
            isSaving: false,
            deletingId: null,
            dayLimitGreen: 1500,
            dayLimitYellow: 3000
        }
    },

    mutations: {
        SET_ALL_EXPENSES (state, value) {
            state.allExpenses = value
        },
        SET_IS_SAVING (state, value) {
            state.isSaving = value
        },
        SET_DELETING_ID (state, id) {
            state.deletingId = id
        },
        SET_SUCCESS_MSG (state, value) {
            state.successMsg = value
        },
        SET_SELECTED_MONTH (state, value) {
            state.selectedMonth = value
        },
        SET_AVAILABLE_MONTHS (state, months) {
            state.availableMonths = months
        },
        ADD_CATEGORY(state, { category, color }) {
            state.categories[category] = color
        },
        SET_FORM_FIELD(state, { field, value }) {
            state.form[field] = value
        },
        SET_START_FORM_DATE(state) {
            state.form.date = todayFullDate()
        },
        RESET_FORM(state) {
            state.form = {
                date: state.form.date,
                amount: 0,
                category: '',
                comment: ''
            }
        },
    },

    actions: {
        // Get and Edit data from Google Sheets

        // Load data from Google Sheets
        async loadExpenses({ commit, dispatch }) {
            const loadFn = () =>
                gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: CONFIG.SHEET_ID,
                    range: `${CONFIG.SHEET_NAME}!A:E`,
                })

            const resp = await dispatch('auth/apiRequest', loadFn, { root: true })

            const rows = resp.result.values || []
            // skip the first row containing the headers
            const value = rows.slice(1).map((row, index) => ({
                rowIndex: index + 1,
                date:     row[0] || '',
                amount:   row[1] || 0,
                category: row[2] || '',
                comment:  row[3] || '',
                id:  row[4] || null
            }))
            commit('SET_ALL_EXPENSES', value)

            await dispatch('loadAvailableMonths');

            return value
        },
        // Add data to Google Sheets
        async addExpense({ commit, dispatch, state }) {
            if (!state.form.amount || !state.form.category) return

            commit('SET_IS_SAVING', true)
            commit('errors/CLEAR_ERROR', null, { root: true })
            commit('SET_SUCCESS_MSG', '')

            const id = createId()

            const addFn = () => gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.SHEET_ID,
                range: `${CONFIG.SHEET_NAME}!A:E`,  // which sheet and columns use
                valueInputOption: 'RAW',            // write without formatting
                resource: {                         // array of strings, each string is an array of cells
                    values: [[
                        state.form.date,            // A: date
                        state.form.amount,          // B: amount
                        state.form.category,        // C: category
                        state.form.comment,         // D: comment
                        id,                         // E: id
                    ]]
                },
            })

            try {
                await dispatch('auth/apiRequest', addFn, { root: true })
                commit('RESET_FORM')
                await dispatch('loadExpenses')
                commit('SET_SUCCESS_MSG', 'Сохранено ✓')
                setTimeout(() => commit('SET_SUCCESS_MSG', ''), 2000)

            } catch (e) {
                commit ('errors/SET_ERROR', getReadableError(e), { root: true })
            } finally {
                commit('SET_IS_SAVING', false)
            }
        },
        // Delete data from Google Sheets
        async deleteExpense({ dispatch, commit }, expense) {
            if (!expense.id) {
                await dispatch('modal/alert', {
                    title: 'Ошибка! У записи нет id',
                    message: 'Почему-то у этой записи нет id — нужно удалить строку вручну'
                }, { root: true })
                return
            }

            const confirmed = await dispatch('modal/confirm', {
                title: 'Удалить запись?',
                message: `${expense.category} ${expense.amount} ฿`
            } , { root: true })

            if (!confirmed) return

            commit('SET_DELETING_ID', expense.id)
            commit('errors/CLEAR_ERROR', null, { root: true })

            try {
                const fresh = await dispatch('loadExpenses')
                const matches = fresh.filter(e => e.id === expense.id)

                if (matches.length === 0) {
                    await dispatch('modal/alert', {
                        title: 'Ошибка! Запись не найдена',
                        message: 'Список обновлён, попробуй снова'
                    }, { root: true })
                    return
                }

                if (matches.length > 1) {
                    await dispatch('modal/alert', {
                        title: 'Ошибка! Дубликат id',
                        message: `Несколько записей с id ${expense.id} — нужно поправить id в таблице`
                    }, { root: true })
                    return
                }

                const current = matches[0]
                const deleteFn = () => gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: CONFIG.SHEET_ID,
                    resource: {
                        requests: [{
                            deleteDimension: {
                                range: {
                                    sheetId:  0, // gid "Все расходы" list
                                    dimension: 'ROWS',
                                    startIndex: current.rowIndex,
                                    endIndex: current.rowIndex + 1,
                                }
                            }
                        }]
                    }

                })

                await dispatch('auth/apiRequest', deleteFn, { root: true })
                await dispatch('loadExpenses')
            } catch (e) {
                const err = getReadableError(e)

                await dispatch('modal/alert', {
                    title: err.title,
                    message: err.message
                }, { root: true })
            } finally {
                commit('SET_DELETING_ID', null)
            }
        },

        // Edit data in Google Sheets

        // Load available months from Google Sheets and set the new one if needed
        async loadAvailableMonths({ state, commit }) {
            console.log('=== Начинаем loadAvailableMonths ===');
            console.log('Всего расходов в allExpenses:', state.allExpenses.length);

            let months = []

            state.allExpenses.forEach((exp, index) => {
                if (exp.date && exp.date.length >= 7) {
                    const monthKey = exp.date.substring(0, 7)

                    if (!months.includes(monthKey)) {
                        months.push(monthKey);
                        console.log(`   → Добавлен новый месяц: ${monthKey}`);
                    }
                }
            })
            console.log('Месяцы перед сортировкой:',  [...months]);
            months.sort().reverse()
            console.log('Месяцы после сортировки:', months);

            const availableMonths = months.map(value => {
                const [year, month] = value.split('-')
                const date = new Date(year, parseInt(month) - 1)

                return {
                    value: value,
                    label: date.toLocaleDateString('ru-RU', {
                        month: 'long',
                        year: 'numeric'
                    }).replace(' г.', '')
                }
            })

            console.log('Итоговый availableMonths перед проверкой на новый месяц:', availableMonths);

            const todayMonthKey = getTodayMonthKey()
            const todayMonthName = getTodayMonthName()


            if(!availableMonths.some(m => m.value === todayMonthKey )) {
                availableMonths.unshift({
                    value: todayMonthKey,
                    label: todayMonthName
                })
                console.log('Итоговый availableMonths после проверки на новый месяц который запишется в state:', availableMonths);
            }

            commit('SET_AVAILABLE_MONTHS', availableMonths)

            if (!state.selectedMonth || !availableMonths.some(m => m.value === state.selectedMonth)) {
                commit('SET_SELECTED_MONTH', availableMonths[0].value)
            }


            console.log(state.selectedMonth)
            console.log('=== loadAvailableMonths завершён ===');
        },

        // Adding the new category into the main array
        addNewCategory({ state, commit }, name) {
            const category = name.trim()

            if (!category) return false

            if (!state.categories[category]) {
                commit('ADD_CATEGORY', { category, color: pickFreeColor(state.categories) })
            }
            commit('SET_FORM_FIELD', { field: 'category', value: category })

            return true
        },

        // Update month in the home screen
        updateMonth({ commit }, selectedMonth){
            commit('SET_SELECTED_MONTH', selectedMonth)
        }
    },

    getters: {
        // Expense filter based on the selected month (current by default)
        // Result:
        // [ {amount: , date: , category: , comment: , id: , rowIndex: }, ... ]
        filteredExpenses(state) {
            if (!state.selectedMonth) return state.allExpenses;

            return state.allExpenses.filter(exp =>
                exp.date && exp.date.startsWith(state.selectedMonth)
            );
        },

        // Group all expenses by date and calculate the total amount for each day
        // Result:
        // { '2026-05-01': 1200, '2026-05-02': 3500, ... }
        dailyTotals(state, getters) {
            const map = {}

            console.log('filteredExpenses', getters.filteredExpenses)

            getters.filteredExpenses.forEach(e => {
                const date = e.date
                const amount = Number(e.amount)
                const dateAlreadyExists = map[date]

                if (!dateAlreadyExists) {
                    // Create date from scratch if see it the first time
                    map[date] = 0
                }
                // Adding the sum to the accumulated total for this day
                map[date] = map[date] + amount
            })
            return map
        },

        // Today total amount
        // Result: number
        todayTotal(state, getters) {
            return getters.dailyTotals[state.form.date] || 0
        },

        // Today total amount in details
        // Result: number
        todayExpenses(state) {
            return state.allExpenses.filter(e => e.date === state.form.date)
        },

        // Month total amount
        // Result: number
        monthTotal(state, getters) {
            return getters.filteredExpenses.reduce((acc, item) => {
                return acc + Number(item.amount || 0 );
            }, 0);
        },

        // Selected month name
        // Result: string
        selectedMonthName(state) {
            return state.availableMonths.find(m => m.value === state.selectedMonth)?.label
        },

        // Checking days without spend
        // Result: number
        getDaysWithoutSpend(state, getters) {

            const datesWithSpend = Object.keys(getters.dailyTotals)

            const datesInMonth = getDatesInMonth(state.selectedMonth)

            // compare 2 arrays
            const datesWithoutSpend = [];

            for (let i = 0; i < datesInMonth.length; i++) {
                const checkingDate = datesInMonth[i]

                const hasSpend = datesWithSpend.some(spendDate => spendDate === checkingDate)

                if (!hasSpend) {
                    datesWithoutSpend.push(checkingDate)
                }
            }

            if (datesWithoutSpend.length !== 0) {
                return datesWithoutSpend.length
            } else {
                return 0
            }
        },

        // Watching server requests
        // Result: boolean
        isBusy(state) {
            return state.isSaving || state.deletingId !== null
        },

        // Category totals
        // Result: // { 'продукты': 1200 , 'еда': 3500 , ... }
        categoryTotals(state, getters) {

            return getters.filteredExpenses.reduce((acc, element) => {
                const key = element.category
                const value = Number(element.amount)
                const keyAlreadyExist = acc[key]

                if (!keyAlreadyExist) {
                    acc[key] = value
                } else {
                    acc[key] += value
                }
                return acc
            }, {})

        },

        // Category segments for the donut, sorted by amount with cumulative angles
        // Result: [ { category: 'еда', amount: 8735, percent: 56.37, startDeg: 0, endDeg: 202.94 }, ... ]
        categorySegments(state, getters) {
            const monthTotal = getters.monthTotal
            if (!monthTotal) return []

            // Step 1. Object has no order — turn it into pairs and sort by amount, biggest first
            // Result: [ ['еда', 8735], ['алкоголь', 1255] ]
            const categoryArray = Object.entries(getters.categoryTotals)
            const sortedCategoryArray = categoryArray.sort(([, amountA ], [, amountB]) => amountB - amountA)
            console.log('Отсортированный массив:', sortedCategoryArray)

            // Step 2. Array of objects plus calculating percent for each
            // Result: // [ {category: 'еда', amount: 8735, percent: 56.3730235559858, color: '#3a6b4f'}, {category: 'алкоголь', amount: 1255, percent: 8.099386898999677, color: '#8a5fb0'} ... ]
            const withPercent = sortedCategoryArray.map(([categoryName, amount]) => {
                return {
                    category: categoryName,
                    amount: amount,
                    percent: amount / monthTotal * 100,
                    color: state.categories[categoryName] || pickFreeColor(state.categories)
                }
            })
            console.log('Добавили расчет процента:', withPercent)

            // Step 3. Array of objects plus calculating angles for each
            // Result: // [ { category: 'еда', amount: 8735, percent: 56.37, color: '#3a6b4f', startDeg: 0, endDeg: 202.94 }, ... ]
            const result = {
                currentAngle: 0,
                items: []
            }

            return withPercent.reduce((acc, element) => {
                const degree = element.percent / 100 * 360

                return {
                    currentAngle: acc.currentAngle + degree,
                    items: [
                        ...acc.items,
                        {
                            ...element,
                            startDeg: acc.currentAngle,
                            endDeg: acc.currentAngle + degree
                        }
                    ]
                }
            }, result).items
        },

        // Ready string for CSS conic-gradient
        // Result: '#3a6b4f 0deg 202.94deg, #3d8f7a 202.94deg 232.1deg, ...'
        donutGradient(state, getters) {
            const categorySegments = getters.categorySegments

            const segmentGradients = categorySegments.map(segment => {
                const segmentColor = segment.color
                const segmentStartDeg = segment.startDeg
                const segmentEndDeg = segment.endDeg

                return `${segmentColor} ${segmentStartDeg}deg ${segmentEndDeg}deg`

            })

            return segmentGradients.join(', ')
        }
    }
}
