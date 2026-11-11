<template>
  <AppModal
      variant="expenses"
      :title="title"
      @close="$emit('close')"
  >

    <div class="modal-expenses-list">
      <div class="modal-expenses-item" :class="{ 'has-multiple': day.expenses.length > 1 }" v-for="day in expensesByDay" :key="day.date">
        <div class="day-left">
          <span class="day-date" :style="{ color: color }">{{ day.date }}</span>
          <span class="day-total">{{ formatAmount(day.total) }} ฿</span>
        </div>
        <div class="day-right">
            <div class="expense single" v-if="day.expenses.length === 1">
<!--              <span class="category">{{ day.expenses[0].category }}</span>-->
              <span class="comment">{{ day.expenses[0].comment }}</span>
            </div>
            <div class="expense-list" v-else>
              <div class="expense" v-for="exp in day.expenses" :key="exp.id || exp.rowIndex">
<!--                <span class="category">{{ exp.category }}</span>-->
                <span class="comment">{{ exp.comment }}</span>
                <span class="amount">{{ formatAmount(exp.amount) }} ฿</span>
              </div>
            </div>
          </div>
      </div>
    </div>

    <template #actions>
      <button
          class="btn btn-confirm"
          type="button"
          @click="$emit('close')">Закрыть</button>
    </template>

  </AppModal>
</template>

<script>
import AppModal from "./AppModal.vue";
import { formatAmount } from "../utils/formatting.js";

export default {
  components: { AppModal },
  emits: ['close'],
  props: {
    expenses: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatAmount
  },
  computed: {
    expensesByDay() {
      const group = {}

      this.expenses.forEach(exp => {
        const date = exp.date

        if(!group[date]) {
          group[date] = []
        }
        group[date].push(exp)
      })

      return Object.keys(group).sort().map(date => {

        return {
          date,
          total: group[date].reduce((acc, exp) => acc + Number(exp.amount || 0), 0),
          expenses: group[date]
        }

      })

    }
  },
}
</script>
