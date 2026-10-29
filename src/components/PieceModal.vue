<template>
  <Transition name="modal-fade">
    <div
      v-if="cartService.selectedPiece"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      @click="cartService.closePieceModal()"
    >
      <div
        class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E6DFD5] flex flex-col md:flex-row overflow-hidden transform transition-all"
        @click.stop
      >
        <!-- Botón cerrar -->
        <button
          @click="cartService.closePieceModal()"
          class="absolute top-4 right-4 z-10 p-2 text-[#2D2A26] bg-white/80 hover:bg-white rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Imagen lateral -->
        <div class="w-full md:w-1/2 bg-[#F3EFEA] relative flex items-center justify-center min-h-[280px] md:min-h-[460px]">
          <img
            :src="cartService.resolveImage(cartService.selectedPiece.fileName, cartService.selectedPiece.imageSrc)"
            :alt="cartService.selectedPiece.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-4 left-4">
            <span class="inline-block bg-white/90 backdrop-blur-sm text-[#F28482] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {{ cartService.selectedPiece.categoryLabel }}
            </span>
          </div>
          <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-[#2E7D32]">
            ✓ En stock (Envío en 24/48h)
          </div>
        </div>

        <!-- Información de la pieza -->
        <div class="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-baseline justify-between mb-2">
              <span class="text-xs uppercase tracking-widest text-[#6B655D] font-semibold">
                Colección Artesanal
              </span>
              <span class="text-2xl font-serif font-bold text-[#1E1B18]">
                {{ cartService.selectedPiece.price }}
              </span>
            </div>

            <h3 class="font-serif text-2xl font-semibold text-[#1E1B18] mb-3">
              {{ cartService.selectedPiece.title }}
            </h3>

            <p class="text-[#5C564E] text-base leading-relaxed mb-6 font-normal">
              {{ cartService.selectedPiece.longDescription }}
            </p>

            <div class="space-y-3 border-t border-[#E6DFD5] pt-4 text-xs sm:text-sm">
              <div class="flex items-start gap-2.5 text-[#2D2A26]">
                <Ruler class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                <div>
                  <span class="font-semibold text-[#1E1B18]">Dimensiones: </span>
                  <span class="text-[#6B655D]">{{ cartService.selectedPiece.dimensions }}</span>
                </div>
              </div>

              <div class="flex items-start gap-2.5 text-[#2D2A26]">
                <Sparkles class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                <div>
                  <span class="font-semibold text-[#1E1B18]">Material y acabado: </span>
                  <span class="text-[#6B655D]">{{ cartService.selectedPiece.material }} · {{ cartService.selectedPiece.glaze }}</span>
                </div>
              </div>

              <div class="flex items-start gap-2.5 text-[#2D2A26]">
                <ShieldCheck class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                <div>
                  <span class="font-semibold text-[#1E1B18]">Cuidado: </span>
                  <span class="text-[#6B655D]">{{ cartService.selectedPiece.careGuide }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bloque de compra con selector de cantidad -->
          <div class="pt-6 mt-6 border-t border-[#E6DFD5] space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#6B655D] uppercase tracking-wider">
                Cantidad:
              </span>
              <div class="inline-flex items-center border border-[#E6DFD5] rounded-lg bg-white shadow-2xs">
                <button
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="px-3 py-1 text-sm text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] rounded-l-lg transition-colors cursor-pointer"
                >
                  -
                </button>
                <span class="px-4 py-1 text-sm font-semibold text-[#1E1B18]">
                  {{ quantity }}
                </span>
                <button
                  @click="quantity++"
                  class="px-3 py-1 text-sm text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#F3EFEA] rounded-r-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="handleBuy"
                class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white font-medium text-sm rounded-xl shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <template v-if="added">
                  <Check class="w-4 h-4" />
                  ¡Añadido a la cesta!
                </template>
                <template v-else>
                  <ShoppingBag class="w-4 h-4" />
                  Comprar pieza ({{ cartService.formatARS(cartService.selectedPiece.priceNumber * quantity) }})
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { X, ShoppingBag, ShieldCheck, Ruler, Sparkles, Check } from 'lucide-vue-next';
import { cartService } from '../services/cartService';

export default {
  name: 'PieceModal',
  components: {
    X,
    ShoppingBag,
    ShieldCheck,
    Ruler,
    Sparkles,
    Check,
  },
  data() {
    return {
      cartService,
      quantity: 1,
      added: false,
    };
  },
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado
  },
  mounted() {
    // Hook mounted ejecutado
  },
  methods: {
    handleBuy() {
      if (!this.cartService.selectedPiece) return;
      this.cartService.addToCart(this.cartService.selectedPiece, this.quantity);
      this.added = true;
      setTimeout(() => {
        this.added = false;
        this.cartService.closePieceModal();
      }, 600);
    },
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
