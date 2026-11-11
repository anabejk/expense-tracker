<template>
  <AppModal
      v-if="modal"
      :title="modal.title"
      :variant="modal.variant"
      @close="close(false)"
  >
    {{ modal.message }}

    <template #actions>
      <button
          v-if="modal.variant === 'confirm'"
          class="btn btn-reject"
          type="button"
          @click="close(false)"
      >{{ modal.cancelText }}</button>

      <button class="btn btn-confirm" type="button" @click="close(true)">
        {{ modal.confirmText }}
      </button>
    </template>
  </AppModal>
</template>


<script>
import { mapState, mapActions } from 'vuex'
import AppModal from './AppModal.vue'

export default {
  components: { AppModal },
  computed: {
    ...mapState('modal', ['modal'])
  },
  methods: {
    ...mapActions('modal', ['close'])
  }
}
</script>


<style lang="scss" scoped>

</style>
