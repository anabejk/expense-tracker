import { CONFIG } from "../../config.js";
import { getReadableError } from '../../utils/getReadableError.js'

let tokenClient = null

export default {
    namespaced: true,

    state() {
        return {
            isSignedIn: false,
            isAuthReady: false,
            sessionExpired: false,
        }
    },

    mutations: {
        SET_SIGNED_IN(state, value) {
            state.isSignedIn = value
        },
        SET_AUTH_READY(state, value) {
            state.isAuthReady = value
        },
        SET_SESSION_EXPIRED(state, value) {
            state.sessionExpired = value
        }
    },

    actions: {
        initGoogleAuth({ commit, dispatch, state }) {
            tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            prompt: '',
            callback: async (resp) => {
            if (resp.error) {
                commit ('errors/SET_ERROR', getReadableError(resp.error), { root: true })
                return
            }
            // Save token in localStorage
            const token = gapi.client.getToken()
            localStorage.setItem('gapi_token', JSON.stringify(token))
            console.log('Токен для входа получен')
            commit('SET_SIGNED_IN', true)
            console.log('Значение переменной isSignedIn', state.isSignedIn)

            // Call action from another module — must have { root: true }, otherwise Vuex will looking for "loadExpenses" inside auth
            try {
                await dispatch('expenses/loadExpenses', null, { root: true })
            } catch (e) {
                commit('errors/SET_ERROR', getReadableError(e), { root: true })
            }
            console.log('Вход успешен')
        },
            error_callback: (err) => {
                console.warn('Окно входа Google не сработало:', err.type)
                commit ('errors/SET_ERROR', getReadableError({ status: err.type }), {  root: true})
            }

            })
            commit('SET_AUTH_READY', true)
            console.log('Значение переменной isAuthReady', state.isAuthReady)
        },
        signIn({ commit }) {
            tokenClient.requestAccessToken({ prompt: '' })
            commit('errors/CLEAR_ERROR', null, { root: true })
        },
        signOut({ commit }) {
            const token = gapi.client.getToken()
            if (token) google.accounts.oauth2.revoke(token.access_token)
            gapi.client.setToken(null)
            localStorage.removeItem('gapi_token')
            commit('SET_SIGNED_IN', false)
            commit('SET_SESSION_EXPIRED', false)
        },
        async apiRequest({ commit }, requestFn) {
            try {
                // Try to execute the request
                return await requestFn()
            } catch (e) {
                // If the token is expired, show the auth screen
                if (e.status === 401) {
                    commit('SET_SESSION_EXPIRED', false)
                    commit('SET_SIGNED_IN', false)
                    throw e
                }
                throw e
            }
        },
        async tryRestoreSession({ commit, dispatch, state }) {
            const savedToken = localStorage.getItem('gapi_token')
            if (!savedToken) return
            gapi.client.setToken(JSON.parse(savedToken))
            console.log('Проверяем есть ли сохранённый токен...')

            commit('SET_IS_LOADING', true, { root: true })

            try {
                commit('SET_SIGNED_IN', true)
                console.log('Сохраненный токен подходит :)', state.isSignedIn)
                await dispatch('expenses/loadExpenses', null, { root: true })
            } catch (e) {
                commit('SET_SIGNED_IN', false)
                commit('SET_SESSION_EXPIRED', true)
                console.log('Токен протух - показываем кнопку обновления')
                commit ('errors/SET_ERROR', getReadableError(e), { root: true })
            } finally {
                commit('SET_IS_LOADING', false, { root: true })
            }
        },
    }

}
