<template>
  <!-- Total screen -->
  <div class="app-screen app-total-screen">
    <!-- Expenses chart by categories -->
    <div class="expenses-chart-box app-screen-card">
      <div class="expenses-chart" v-if="categorySegments.length">
        <div class="donut" :style="{ background: `conic-gradient(${donutGradient})` }">
          <div class="donut-hole">{{ formatAmount(monthTotal) }} ฿</div>
        </div>
        <div class="legend-list">
          <div class="legend-item" v-for="cat in categorySegments" :key="cat.category" @click="openedCategory = cat">
            <span class="legend-color" :style="{ backgroundColor: cat.color }"></span>
            <div class="legend-info">
              <span class="legend-name">{{ cat.category }}</span>
              <span class="legend-percent">{{ cat.percent.toFixed(1) }} %</span>
            </div>
            <span class="legend-amount">{{ formatAmount(cat.amount) }} ฿</span>
          </div>
        </div>
      </div>
      <div class="expenses-chart-empty" v-else >В этом месяце еще не было трат</div>
    </div>

    <!-- Open modal screen for each category -->
    <ExpensesModal
        v-if="openedCategory"
        :title="openedCategory.category"
        :color="openedCategory.color"
        :expenses="categoryExpenses"
        @close="openedCategory = null"
    >
    </ExpensesModal>
  </div>
</template>

<script>
import { formatAmount } from "../utils/formatting.js";
import { mapGetters } from "vuex";
import ExpensesModal from "../components/ExpensesModal.vue";

export default {
  components: { ExpensesModal },
  data() {
    return {
      openedCategory: null
    }
  },
  methods: {
    formatAmount,
  },
  computed: {
    ...mapGetters('expenses', ['dailyTotals', 'monthTotal', 'categoryTotals', 'categorySegments', 'donutGradient', 'filteredExpenses']),
    categoryExpenses() {
      if(!this.openedCategory) return []

      return this.filteredExpenses.filter(exp => exp.category === this.openedCategory.category)
    }
  },
  mounted() {
    console.log('TotalScreen mounted, dailyTotals:', this.dailyTotals)
    console.log('categoryTotals:', this.categoryTotals)
    console.log('categorySegments для пончика:', this.categorySegments)
    console.log('donutGradient для пончика:', this.donutGradient)
  }
}
</script>

<style lang="scss" scoped>

</style>
