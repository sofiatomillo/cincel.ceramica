<template>
  <article
    class="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E6DFD5] hover:border-[#D5CDC2] shadow-xs hover:shadow-lg transition-all duration-300"
  >
    <!-- Contenedor de la imagen con enlace a Detalle -->
    <router-link
      :to="`/piezas/${piece.id}`"
      class="relative aspect-square overflow-hidden bg-[#F3EFEA] block cursor-pointer"
    >
      <img
        :src="cartService.resolveImage(piece.fileName, piece.imageSrc)"
        :alt="piece.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <span
        class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider text-[#1E1B18] uppercase px-2.5 py-1 rounded-md shadow-2xs"
      >
        {{ piece.categoryLabel }}
      </span>
      <span
        class="absolute top-3 right-3 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-medium px-2 py-0.5 rounded-full shadow-2xs"
      >
        En stock ({{ piece.stockCount }})
      </span>
    </router-link>

    <!-- Cuerpo de la tarjeta -->
    <div class="p-6 flex flex-col flex-1 justify-between">
      <div>
        <div class="flex items-baseline justify-between mb-2">
          <router-link
            :to="`/piezas/${piece.id}`"
            class="font-serif text-xl sm:text-[22px] font-semibold text-[#1E1B18] group-hover:text-[#F28482] transition-colors leading-tight"
          >
            {{ piece.title }}
          </router-link>
          <span class="text-base sm:text-lg font-serif font-bold text-[#1E1B18] shrink-0 ml-2">
            {{ formattedPrice }}
          </span>
        </div>
        <p class="text-sm text-[#5C564E] leading-relaxed mb-4 line-clamp-2 font-normal">
          {{ piece.description }}
        </p>
        <div class="text-xs text-[#8D857B] space-y-0.5 mb-5">
          <p class="truncate">• {{ piece.dimensions }}</p>
          <p class="truncate">• {{ piece.material }}</p>
        </div>
      </div>

      <div class="space-y-3 pt-4 border-t border-[#E6DFD5]">
        <!-- Botón de Compra -->
        <button
          @click="$emit('buy', piece)"
          class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ShoppingBag class="w-3.5 h-3.5" />
          <span>Comprar pieza</span>
        </button>

        <!-- Acciones CRUD (Ver Detalle, Editar, Eliminar) -->
        <div class="flex items-center justify-between text-xs pt-1">
          <router-link
            :to="`/piezas/${piece.id}`"
            class="text-[#6B655D] hover:text-[#1E1B18] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Ver detalle</span>
            <ArrowRight class="w-3 h-3" />
          </router-link>

          <div class="flex items-center gap-2">
            <router-link
              :to="`/piezas/editar/${piece.id}`"
              class="p-1.5 text-[#6B655D] hover:text-[#1E1B18] hover:bg-[#FAF7F2] rounded-lg transition-colors"
              title="Modificar registro"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </router-link>

            <button
              type="button"
              @click="$emit('delete', piece)"
              class="p-1.5 text-[#8D857B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Eliminar registro"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { ShoppingBag, ArrowRight, Edit3, Trash2 } from 'lucide-vue-next';
import { cartService } from '../services/cartService';

export default {
  name: 'CardItem',
  components: {
    ShoppingBag,
    ArrowRight,
    Edit3,
    Trash2,
  },
  props: {
    piece: {
      type: Object,
      required: true,
    },
  },
  emits: ['buy', 'delete'],
  data() {
    return {
      cartService,
    };
  },
  // Propiedad computada
  computed: {
    formattedPrice() {
      if (this.piece.price) return this.piece.price;
      return cartService.formatARS(this.piece.priceNumber || 0);
    },
  },
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado al instanciar el componente
  },
  mounted() {
    // Hook mounted ejecutado al montarse en el DOM
  },
};
</script>
