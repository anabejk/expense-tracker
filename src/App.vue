<template>
  <div class="app-container">

    <!-- Authorization -->
    <AuthScreen v-if="!isSignedIn"></AuthScreen>

    <!-- Main app -->
    <div class="app-layout" v-else>

      <!-- Header -->
      <AppHeader></AppHeader>

      <!-- Screens -->
      <router-view v-slot="{ Component }">
        <keep-alive include="FormScreen">
          <component :is="Component"/>
        </keep-alive>
      </router-view>

      <!-- Navigation -->
      <AppNavigation></AppNavigation>
    </div>

    <!--  Loader -->
    <AppLoader v-if="isLoading"></AppLoader>
    <!--  Modal -->
    <AppDialog></AppDialog>

  </div>
</template>

<script>
import { CONFIG } from "./config.js";
import AppHeader from "./components/AppHeader.vue";
import AppNavigation  from "./components/AppNavigation.vue";
import HomeScreen from "./views/HomeScreen.vue";
import FormScreen from "./views/FormScreen.vue";
import TotalScreen from "./views/TotalScreen.vue";
import {mapActions, mapGetters, mapState} from 'vuex'
import AuthScreen from "./components/AuthScreen.vue";
import { todayFullDate, getTodayMonthKey } from "./utils/date.js";
import AppDialog from "./components/AppDialog.vue";
import AppLoader from "./components/AppLoader.vue";

export default {
  props: ['monthDetails'],
  methods: {
    ...mapActions('auth', ['initGoogleAuth', 'tryRestoreSession']),

    todayFullDate,
    todayMonthKey: getTodayMonthKey,
  },
  computed: {
    ...mapState('auth', ['isSignedIn']),
    ...mapState('expenses', ['selectedMonth', 'form']),
    ...mapState(['isLoading']),
    ...mapGetters('expenses', ['todayTotal'])
  },
  async mounted() {
    // Загружаем клиент Google API

    await new Promise (function (resolve, reject){
      gapi.load('client', resolve)
    })

    // Инициализируем его с нашим API ключом
    await gapi.client.init({
      apiKey: CONFIG.API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    })

    // Запускаем авторизацию
    this.initGoogleAuth()

    // Проверяем есть ли сохранённый токен
    await this.tryRestoreSession()

    // Когда computed уже доступны — устанавливаем дату
    this.$store.commit('expenses/SET_START_FORM_DATE', null, { root: true })

    //Отладка
    console.log('Дата в формате YYYY-MM-DD которую мы устанавливаем по умолчанию: ', this.todayFullDate())
    console.log('Текущий год и месяц в формате YYYY-MM: ', this.todayMonthKey())
    // this.loadAvailableMonths()
    console.log('Стартовый месяц для подсчета: ', this.selectedMonth)
    console.log('Сумма за день', this.todayTotal)
  },
  components: {
    AppDialog,
    AuthScreen,
    AppHeader,
    AppNavigation,
    AppLoader,
    HomeScreen,
    FormScreen,
    TotalScreen,
  }
}
</script>

<style lang="scss" scoped>

</style>
