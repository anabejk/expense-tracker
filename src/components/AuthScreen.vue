<template>
  <div class="app-auth">
    <div class="auth-card">
      <div class="logo">฿</div>
      <h1 class="title">Расходы</h1>
      <p class="subtitle" v-if="!sessionExpired || !errorAlert">Войди через Google чтобы начать</p>
      <Transition name="status">
        <div v-if="errorAlert" class="status-collapse">
          <div class="status-collapse-inner">
            <div class="error-alert-msg" role="alert">
              <button class="btn error-alert-close" type="button" @click="clearError" aria-label="Закрыть"></button>
              <span>{{ errorAlert.title }}</span>
              <span>{{ errorAlert.message }}</span>
            </div>
          </div>
        </div>
      </Transition>
      <button class="btn btn-primary" @click="signIn" :disabled="!isAuthReady">{{ sessionExpired ? 'Обновить авторизацию' : 'Войти через Google' }}</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState('auth', ['sessionExpired', 'isAuthReady']),
    ...mapState('errors', ['errorAlert'])
  },
  methods: {
    ...mapActions('auth', ['signIn']),
    ...mapActions('errors', ['clearError'])
  }
}
</script>

<style lang="scss" scoped>
.success-msg,
.error-alert-msg {
  margin: 0.5rem auto;
}
</style>
