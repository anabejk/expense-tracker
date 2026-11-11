import { createStore } from 'vuex'
import auth from './modules/auth.js'
import expenses from './modules/expenses.js'
import errors from './modules/errors.js'
import modal from './modules/modal.js'

export default createStore({
    strict: import.meta.env.DEV,
    state() {
        return {
            isLoading: false
        }
    },
    modules: {
        auth,
        expenses,
        errors,
        modal
    },
    mutations: {
        SET_IS_LOADING (state, value) {
            state.isLoading = value
        }
    }
})
