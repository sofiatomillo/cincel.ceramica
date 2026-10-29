<template>
  <ModalConfirmacion
    :isOpen="isOpen"
    :piece="piece"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>

<script setup>
import ModalConfirmacion from './ModalConfirmacion.vue';

defineProps({
  isOpen: Boolean,
  piece: Object,
});

defineEmits(['confirm', 'cancel']);
</script>
