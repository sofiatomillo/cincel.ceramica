<template>
  <div class="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#8D857B] mb-8">
        <router-link to="/" class="hover:text-[#F28482] transition-colors flex items-center gap-1">
          <ArrowLeft class="w-3.5 h-3.5" />
          Inicio
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <router-link to="/catalogo" class="hover:text-[#F28482] transition-colors">
          Catálogo
        </router-link>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="font-semibold text-[#1E1B18] truncate max-w-xs">
          {{ piece?.title || 'Detalle de pieza' }}
        </span>
      </nav>

      <!-- Pieza no encontrada -->
      <div v-if="!piece" class="p-12 bg-white rounded-3xl border border-[#E6DFD5] text-center space-y-4 shadow-sm">
        <Package class="w-16 h-16 text-[#8D857B] mx-auto" />
        <h2 class="font-serif text-3xl font-semibold text-[#1E1B18]">
          Pieza no encontrada
        </h2>
        <p class="text-xs sm:text-sm text-[#6B655D] max-w-md mx-auto">
          El registro solicitado no existe o fue eliminado de la base de datos de LocalStorage.
        </p>
        <router-link
          to="/catalogo"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B18] text-white text-xs font-semibold rounded-xl hover:bg-[#38342E] transition-colors"
        >
          Volver al catálogo
        </router-link>
      </div>

      <!-- Ficha de Detalle Completa -->
      <div v-else class="bg-white rounded-3xl border border-[#E6DFD5] shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <!-- Columna Imagen (5 cols) -->
          <div class="lg:col-span-5 bg-[#F3EFEA] relative flex items-center justify-center min-h-[380px] lg:min-h-[560px]">
            <img
              :src="cartService.resolveImage(piece.fileName, piece.imageSrc)"
              :alt="piece.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-4 left-4">
              <span class="inline-block bg-white/90 backdrop-blur-sm text-[#F28482] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {{ piece.categoryLabel }}
              </span>
            </div>
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#2E7D32]">
              ✓ En stock ({{ piece.stockCount }} unid.)
            </div>
          </div>

          <!-- Columna Información y Acciones (7 cols) -->
          <div class="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8">
            <div>
              <div class="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
                <span class="text-xs uppercase tracking-widest text-[#8D857B] font-semibold">
                  Registro ID: <code class="text-[#1E1B18]">{{ piece.id }}</code>
                </span>
                <span class="text-3xl font-serif font-bold text-[#1E1B18]">
                  {{ piece.price }}
                </span>
              </div>

              <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1E1B18] mb-4">
                {{ piece.title }}
              </h1>

              <p class="text-sm sm:text-base text-[#6B655D] leading-relaxed mb-6">
                {{ piece.longDescription || piece.description }}
              </p>

              <!-- Especificaciones técnicas -->
              <div class="space-y-3.5 border-t border-[#E6DFD5] pt-6 text-xs sm:text-sm">
                <div class="flex items-start gap-3 text-[#2D2A26]">
                  <Ruler class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                  <div>
                    <span class="font-semibold text-[#1E1B18]">Dimensiones: </span>
                    <span class="text-[#6B655D]">{{ piece.dimensions || 'Consultar con taller' }}</span>
                  </div>
                </div>

                <div class="flex items-start gap-3 text-[#2D2A26]">
                  <Sparkles class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                  <div>
                    <span class="font-semibold text-[#1E1B18]">Material y acabado: </span>
                    <span class="text-[#6B655D]">{{ piece.material }} · {{ piece.glaze }}</span>
                  </div>
                </div>

                <div class="flex items-start gap-3 text-[#2D2A26]">
                  <ShieldCheck class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                  <div>
                    <span class="font-semibold text-[#1E1B18]">Cuidados recomendados: </span>
                    <span class="text-[#6B655D]">{{ piece.careGuide || 'Limpieza suave con paño húmedo' }}</span>
                  </div>
                </div>

                <div class="flex items-start gap-3 text-[#2D2A26]">
                  <Calendar class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                  <div>
                    <span class="font-semibold text-[#1E1B18]">Fecha de registro: </span>
                    <span class="text-[#6B655D]">{{ formatDate(piece.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones de compra y gestión (CRUD) -->
            <div class="pt-6 border-t border-[#E6DFD5] space-y-4">
              <!-- Selector de cantidad y compra -->
              <div class="flex items-center gap-3">
                <div class="inline-flex items-center border border-[#E6DFD5] rounded-xl bg-[#FAF7F2] shadow-2xs">
                  <button
                    @click="quantity = Math.max(1, quantity - 1)"
                    class="px-3 py-2 text-sm text-[#6B655D] hover:text-[#1E1B18] hover:bg-white rounded-l-xl transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span class="px-4 py-2 text-sm font-semibold text-[#1E1B18]">
                    {{ quantity }}
                  </span>
                  <button
                    @click="quantity++"
                    class="px-3 py-2 text-sm text-[#6B655D] hover:text-[#1E1B18] hover:bg-white rounded-r-xl transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  @click="handleBuy"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white font-medium text-sm rounded-xl shadow-sm transition-all hover:gap-3 cursor-pointer"
                >
                  <Check v-if="added" class="w-4 h-4" />
                  <ShoppingBag v-else class="w-4 h-4" />
                  <span>
                    {{ added ? '¡Añadido a la cesta!' : `Comprar pieza (${cartService.formatARS(piece.priceNumber * quantity)})` }}
                  </span>
                </button>
              </div>

              <!-- Botones de administración: Editar y Eliminar registro -->
              <div class="flex items-center gap-3 pt-2">
                <router-link
                  :to="`/piezas/editar/${piece.id}`"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EFEA] text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E6DFD5] transition-colors"
                >
                  <Edit3 class="w-4 h-4 text-[#F28482]" />
                  <span>Modificar registro</span>
                </router-link>

                <button
                  type="button"
                  @click="isDeleteModalOpen = true"
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <ModalConfirmacion
      :isOpen="isDeleteModalOpen"
      :piece="piece"
      @confirm="handleConfirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script>
import {
  ArrowLeft,
  ChevronRight,
  Ruler,
  Sparkles,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  Check,
  Edit3,
  Trash2,
  Package,
} from 'lucide-vue-next';
import { ceramicsService } from '../services/ceramicsService';
import { cartService } from '../services/cartService';
import ModalConfirmacion from '../components/ModalConfirmacion.vue';

export default {
  name: 'DetailView',
  components: {
    ArrowLeft,
    ChevronRight,
    Ruler,
    Sparkles,
    ShieldCheck,
    Calendar,
    ShoppingBag,
    Check,
    Edit3,
    Trash2,
    Package,
    ModalConfirmacion,
  },
  data() {
    return {
      cartService,
      quantity: 1,
      added: false,
      isDeleteModalOpen: false,
    };
  },
  // Propiedades computadas requeridas
  computed: {
    piece() {
      return ceramicsService.getById(this.$route.params.id);
    },
    formattedPrice() {
      if (!this.piece) return '';
      return this.piece.price || cartService.formatARS(this.piece.priceNumber);
    },
    totalPurchaseAmount() {
      if (!this.piece) return '';
      return cartService.formatARS(this.piece.priceNumber * this.quantity);
    },
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    console.log('[Ciclo de Vida] DetailView creado (created hook)');
  },
  mounted() {
    console.log('[Ciclo de Vida] DetailView montado (mounted hook)');
  },
  methods: {
    formatDate(isoStr) {
      if (!isoStr) return 'Reciente';
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    },

    handleBuy() {
      if (!this.piece) return;
      cartService.addToCart(this.piece, this.quantity);
      this.added = true;
      setTimeout(() => {
        this.added = false;
      }, 1500);
    },

    handleConfirmDelete() {
      if (!this.piece) return;
      ceramicsService.delete(this.piece.id);
      this.isDeleteModalOpen = false;
      this.$router.push('/catalogo');
    },
  },
};
</script>
