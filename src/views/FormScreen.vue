<template>
  <!--Form screen -->
  <div class="app-screen app-form-screen">
    <!-- add form -->
    <form class="app-screen-card form-card" @submit.prevent="addExpense">

      <div class="form-row">
        <div class="form-field">
          <label>{{ currentDayName(formDate) }}</label>
          <input type="date" v-model="formDate"/>
        </div>
        <div class="form-field">
          <label for="amount">Сумма</label>
          <input id="amount"
                 type="number"
                 inputmode="numeric"
                 v-model.number="formAmount"
                 @input="inputValidation"/>
          <span v-if="amountError" class="warn-message">Необходимо ввести цифры</span>
        </div>
      </div>

      <div class="form-field category">
        <label for="category">Категория</label>
        <div class="select-wrapper">
          <select class="select" id="category" v-model="formCategory">
            <option value="" disabled>выбрать</option>
            <option v-for="category in sortedCategories" :value="category" :key="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- add new category -->
        <button class="btn btn-link" type="button" @click="openTabCategory">{{ openNewCategory ? '- закрыть' : '+ добавить категорию' }}</button>
        <div v-if="openNewCategory" class="new-category-row">
          <input type="text" v-model="newCategory"/>
          <button class="btn btn-minor" type="button" @click="createCategory">Создать</button>
        </div>
      </div>

      <div class="form-field comment">
        <label for="comment">Комментарий</label>
        <input id="comment"
               type="text"
               v-model.trim="formComment"/>
      </div>

      <button class="btn btn-primary btn-add" type="submit" :disabled="isBusy || !formAmount || !formCategory">
        <span v-if="isSaving">Сохраняю...</span>
        <span v-else>Добавить в таблицу</span>
      </button>
      <Transition name="status">
        <div v-if="successMsg" class="status-collapse">
          <div class="status-collapse-inner">
            <div class="success-msg">{{ successMsg }}</div>
          </div>
        </div>
      </Transition>
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

    </form>

    <!-- today's expenses -->
    <div class="app-screen-card today-block-wrap">
      <div v-if="todayExpenses.length === 0" class="today-empty-block">
        В этот день трат нет
      </div>
      <div v-else class="today-block">
        <div class="today-header">
          <span class="today-title">{{ formDate === todayFullDate() ? 'Сегодня:' : currentDayName(formDate) }}</span>
          <span class="today-total" :class="todayColorClass">{{ formatAmount(selectedDateTotal) }} ฿</span>
        </div>
        <div class="expense-list">
          <div class="expense-item" v-for="(exp, i) in todayExpenses" :key="exp.id">
            <div class="exp-left">
              <span class="exp-cat">{{ exp.category }}</span>
              <span class="exp-comment">{{ exp.comment }}</span>
            </div>
            <span class="exp-amount">{{ formatAmount(exp.amount) }} ฿</span>
            <button class="btn btn-edit" type="button" @click="console.log('Click the edit button')" title="Редактировать трату" :disabled="isBusy">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button class="btn btn-delete" type="button" @click="deleteExpense(exp)" title="Удалить трату" :disabled="isBusy">
              <span v-if="deletingId === exp.id" class="btn-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2">
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatAmount } from "../utils/formatting.js";
import { todayFullDate, currentDayName } from "../utils/date.js";
import { mapState, mapActions, mapGetters } from "vuex";

// Form field, connected to the store: read from state, write mutations
function formField(field) {
  return {
    get() {
      return this.$store.state.expenses.form[field]
    },
    set(value) {
      this.$store.commit('expenses/SET_FORM_FIELD', { field, value })
    }
  }
}


export default {
  name: 'FormScreen',
  data() {
    return {
      amountError: false,
      newCategory: '',
      openNewCategory: false
    }
  },
  methods: {
    ...mapActions('expenses', ['addExpense', 'addNewCategory', 'deleteExpense']),
    ...mapActions('errors', ['clearError']),

    formatAmount,
    todayFullDate,
    currentDayName,
    inputValidation() {
      if (typeof this.formAmount !== 'number') {
        this.amountError = true
      } else {
        this.amountError = false
      }
    },
    openTabCategory() {
      this.openNewCategory = !this.openNewCategory
    },
    async createCategory() {
      const added = await this.addNewCategory(this.newCategory)
      if (!added) return

      this.newCategory = ''
      this.openNewCategory = false
    }
  },
  computed: {
    ...mapState('expenses', ['categories', 'dayLimitGreen', 'dayLimitYellow', 'isSaving', 'successMsg', 'deletingId']),
    ...mapState('errors', ['errorAlert']),
    ...mapGetters('expenses', ['selectedDateTotal', 'todayExpenses', 'isBusy']),

    // Form fields
    formDate: formField('date'),
    formAmount: formField('amount'),
    formCategory: formField('category'),
    formComment: formField('comment'),

    // Form field for new category
    formNewCategory: {
        get() {
          return this.$store.state.expenses.newCategory
        },
        set(value) {
          this.$store.commit('expenses/SET_NEW_CATEGORY', value)
        }
    },

    // Sort the list of categories alphabetically
    sortedCategories() {
      return Object.keys(this.categories).sort((a, b) =>
          a.localeCompare(b, 'ru')
      );
    },

    // Color for the today total amount
    todayColorClass() {
      if (this.selectedDateTotal <= this.dayLimitGreen) return 'color-green'
      if (this.selectedDateTotal <= this.dayLimitYellow) return 'color-yellow'
      return 'color-red'
    },
  }
}
</script>

<style lang="scss" scoped>
.success-msg,
.error-alert-msg {
  margin-top: 1rem;
}
</style>
