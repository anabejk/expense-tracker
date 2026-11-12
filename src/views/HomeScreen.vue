<template>
  <!--Home screen -->
  <div class="app-screen app-home-screen">
    <!-- Limit progress bar -->
    <div class="app-screen-card limit-block">
      <div class="limit-row">
        <span class="limit-label">
          Потрачено в:
          <span class="limit-month">{{ selectedMonthName }}</span>
        </span>
        <span class="limit-amount">{{ formatAmount(monthTotal) }} ฿ / {{ formatAmount(monthLimit) }} ฿</span>
      </div>
      <div class="progress-track">
        <progress class="progress-fill"
                  :value="monthTotal"
                  :max="monthLimit"
                  :class="progressColor">
        </progress>
      </div>
      <div class="limit-remaining" :class="{ danger: monthTotal > monthLimit }">
        {{ monthTotal > monthLimit ? 'Лимит превышен на ' + formatAmount(monthTotal - monthLimit) + ' ฿' : 'Осталось ' + formatAmount(monthLimit - monthTotal) + ' ฿' }}
      </div>
      <div class="days-in-month" v-if="selectedMonth !== todayMonthKey()">
        Всего дней в месяце: {{ daysInMonth(selectedMonth) }}
      </div>
      <div class="days-passed" v-else>
        Всего дней: {{ daysPassed }}
      </div>
      <div class="days-average">
        В среднем за день тратим: {{ formatAmount(monthTotal / (selectedMonth !== todayMonthKey() ? daysInMonth(selectedMonth) : daysPassed)) }} ฿
      </div>
    </div>

    <!-- Statistics of days -->
    <div class="days-stats">
      <div class="day-stat grey" v-if="greyDays" @click="openedStat = 'grey'">
        <span class="stat-count">{{ greyDays }}</span>
        <span class="stat-label">0 ฿</span>
      </div>
      <div class="day-stat green" @click="openedStat = 'green'">
        <span class="stat-count">{{ greenDays }}</span>
        <span class="stat-label">≤ 1500 ฿</span>
      </div>
      <div class="day-stat yellow" @click="openedStat = 'yellow'">
        <span class="stat-count">{{ yellowDays }}</span>
        <span class="stat-label">1500–3000 ฿</span>
      </div>
      <div class="day-stat red" @click="openedStat = 'red'">
        <span class="stat-count">{{ redDays }}</span>
        <span class="stat-label">> 3000 ฿</span>
      </div>
    </div>

    <!-- Open modal screen for each color day -->
    <DayBreakdownModal
        v-if="openedStat"
        :title="`Открыли ${openedStat} дни`"
        @close="openedStat = null"
    >
    </DayBreakdownModal>
  </div>
</template>

<script>
import {mapState, mapGetters } from "vuex";
import { formatAmount } from "../utils/formatting.js";
import { today, getTodayMonthKey, getDaysInMonth } from "../utils/date.js";
import DayBreakdownModal from "../components/DayBreakdownModal.vue";


export default {
  components: { DayBreakdownModal },
  data() {
    return {
      monthLimit: 55000,
      openedStat: null
    }
  },
  methods: {
    formatAmount,
    todayMonthKey: getTodayMonthKey,
    today,
    daysInMonth: getDaysInMonth
  },
  computed: {
    ...mapState('expenses', ['selectedMonth', 'dayLimitGreen', 'dayLimitYellow']),
    ...mapGetters('expenses', ['monthTotal', 'dailyTotals', 'selectedMonthName', 'getDaysWithoutSpend', 'filteredExpenses']),

    //  Days that have already been passed in the current month
    daysPassed() {
      return today().getDate()
    },

    // Progress bar color
    progressColor() {
      // The percentage of the budget which was spent
      const spentPercent = (this.monthTotal / this.monthLimit) * 100

      if (spentPercent <= 40) {
        return 'prog-green'
      } else if (spentPercent <= 80) {
        return 'prog-yellow'
      } else {
        return 'prog-red'
      }
    },

    // Statistics of days
    greyDays() {
      return this.getDaysWithoutSpend
    },
    greenDays() {
      return Object.values(this.dailyTotals).filter(n => n <= this.dayLimitGreen).length
    },
    yellowDays() {
      return Object.values(this.dailyTotals).filter(n => n > this.dayLimitGreen && n <= this.dayLimitYellow).length
    },
    redDays() {
      return Object.values(this.dailyTotals).filter(n => n > this.dayLimitYellow).length
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
