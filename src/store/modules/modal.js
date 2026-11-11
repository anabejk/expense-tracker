let resolver = null

export default {
    namespaced: true,

    state() {
        return {
            modal: null // { variant, title, message, confirmText, cancelText }
        }
    },
    mutations: {
        SET_MODAL(state, value) {
            state.modal = value
        }
    },
    actions: {
        confirm({ commit, dispatch }, { variant= 'confirm', title = '', message = '', confirmText = 'Удалить', cancelText = 'Отмена'})  {
            dispatch('close', false)
            commit('SET_MODAL', { variant, title, message, confirmText, cancelText })
            return new Promise(resolve => { resolver = resolve })
        },
        alert({ commit, dispatch }, { variant= 'error', title = '', message = '', confirmText = 'Понятно' }) {
            dispatch('close', false)
            commit('SET_MODAL', { variant, title, message, confirmText })
            return new Promise(resolve => { resolver = resolve })

        },
        close({ commit }, result = false) {
            commit('SET_MODAL', null)
            if (resolver) {
                resolver(result)
                resolver = null
            }
        }
    }
}
