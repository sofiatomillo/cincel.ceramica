<template>
  <Transition name="modal-fade">
    <div
      v-if="isOpen"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click="$emit('cancel')"
    >
      <div
        class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-[#E6DFD5] space-y-5 transform transition-all"
        @click.stop
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
              {{ title || '¿Eliminar este registro?' }}
            </h3>
            <p class="text-xs text-[#6B655D] mt-1 leading-relaxed">
              {{ message || `Estás a punto de eliminar permanentemente la pieza «${pieceTitle}» de la base de datos de LocalStorage.` }}
            </p>
          </div>
        </div>

        <div v-if="piece" class="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] flex items-center gap-3">
          <img
            :src="cartService.resolveImage(piece.fileName, piece.imageSrc)"
            :alt="pieceTitle"
            class="w-12 h-12 rounded-lg object-cover bg-[#F3EFEA] border border-[#E6DFD5]"
          />
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-semibold text-[#F28482] uppercase">{{ piece.categoryLabel }}</span>
            <h4 class="text-xs font-semibold text-[#1E1B18] truncate">{{ pieceTitle }}</h4>
            <span class="text-xs font-mono font-bold text-[#1E1B18]">{{ piecePrice }}</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2.5 text-xs font-medium text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="$emit('confirm')"
            class="px-5 py-2.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Sí, eliminar registro
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { AlertTriangle } from 'lucide-vue-next';
import { cartService } from '../services/cartService';

export default {
  name: 'ModalConfirmacion',
  components: {
    AlertTriangle,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    piece: {
      type: Object,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
  },
  emits: ['confirm', 'cancel'],
  data() {
    return {
      cartService,
    };
  },
  // Propiedades computadas
  computed: {
    pieceTitle() {
      return this.piece?.title || 'Pieza';
    },
    piecePrice() {
      return this.piece?.price || '';
    },
  },
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado
  },
  mounted() {
    // Hook mounted ejecutado
  },
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
