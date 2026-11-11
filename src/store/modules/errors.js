export default {
    namespaced: true,

    state() {
        return {
            errorAlert: null,
        }
    },

    mutations: {
        SET_ERROR(state, error) {
            state.errorAlert = error
        },
        CLEAR_ERROR(state) {
            state.errorAlert = null
        },
    },

    actions: {
        clearError({ commit }) {
            commit('CLEAR_ERROR')
        }
    }
}
