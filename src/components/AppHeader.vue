<template>
  <header class="app-header">
    <div class="header-left">
      <span class="logo-small">฿</span>
      <label for="month" class="month-label">Расходы: </label>
      <div class="select-wrapper">
        <select class="select" id="month" :value="selectedMonth" @change="changeMonth">
          <option v-for="m in availableMonths" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>
    </div>
    <button class="btn btn-signout" @click="signOut">Выйти</button>
  </header>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  methods: {
    ...mapActions('auth', ['signOut']),
    ...mapActions('expenses', ['updateMonth']),

    changeMonth(event) {
      this.updateMonth(event.target.value)
    }
  },
  computed: {
    ...mapState('expenses', ['availableMonths', 'selectedMonth'])
  }

}
</script>

<style lang="scss" scoped>

</style>
