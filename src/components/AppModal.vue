<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal" :class="`modal-${variant}`" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h3 v-if="title" class="modal-title">{{ title }}</h3>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    title: { type: String, default: '' },
    variant: { type: String, default: 'confirm' } // confirm | error | success | expenses
  },
  emits: ['close'],
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  unmounted() {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Escape') this.$emit('close')
    }
  }
}
</script>


<style lang="scss" scoped>

</style>
