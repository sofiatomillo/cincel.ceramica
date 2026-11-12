<template>
  <div class="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb de navegación -->
      <div class="mb-8">
        <nav class="flex items-center gap-2 text-xs text-[#8D857B]">
          <router-link
            to="/"
            class="hover:text-[#F28482] transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            Inicio
          </router-link>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="font-semibold text-[#1E1B18]">Catálogo de piezas</span>
        </nav>
      </div>

      <!-- Cabecera del catálogo -->
      <div class="mb-10">
        <div class="inline-flex items-center gap-2 mb-3">
          <span class="w-6 h-px bg-[#F28482]" />
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482]">
            TIENDA ONLINE Y REGISTROS LOCALSTORAGE
          </span>
        </div>
        <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#1E1B18] mb-4">
          Catálogo de Cerámica Artesanal
        </h1>
        <p class="text-sm sm:text-base text-[#6B655D] max-w-2xl leading-relaxed">
          Base de datos de piezas torneadas a mano y guardadas en tu navegador. Puedes crear nuevos registros, editarlos, eliminarlos, ordenarlos o comprarlos directamente.
        </p>
      </div>

      <!-- Banner de Bienvenida a Cliente (ej. Laura Russo) -->
      <div
        v-if="isCustomer"
        class="mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-white to-rose-50/70 border border-amber-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-[#1E1B18] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            {{ customerInitial }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif text-base sm:text-lg font-semibold text-[#1E1B18]">
                ¡Hola, {{ customerName }}!
              </span>
              <span class="text-[9px] bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 font-semibold px-2 py-0.2 rounded-full">
                Cliente Verificado
              </span>
            </div>
            <p class="text-xs text-[#6B655D] mt-0.5">
              Tu sesión está lista para comprar piezas artesanales con entrega a domicilio en CABA.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button
            @click="cartService.isCartOpen = true"
            type="button"
            class="px-3.5 py-2 bg-white border border-[#E6DFD5] hover:border-[#1E1B18] text-[#1E1B18] text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
          >
            <ShoppingBag class="w-3.5 h-3.5 text-[#F28482]" />
            <span>Mi Cesta ({{ cartTotalItems }})</span>
          </button>

          <button
            @click="customerOrdersService.open()"
            type="button"
            class="px-3.5 py-2 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Package class="w-3.5 h-3.5 text-[#F28482]" />
            <span>Mis Compras & Pedidos</span>
          </button>
        </div>
      </div>

      <!-- SECCIÓN DE BENEFICIOS, OFERTAS Y PROMOS -->
      <PromosBenefitsSection
        variant="catalog"
        @selectCategory="handleSelectCategory"
      />

      <!-- Componente Reutilizable: Buscador -->
      <Buscador
        v-model:searchQuery="searchQuery"
        v-model:activeCategory="activeCategory"
        v-model:sortBy="sortBy"
        :categories="categoriesWithCount"
        :filteredCount="filteredPieces.length"
        :totalCount="totalPiecesCount"
        @resetFilters="resetFilters"
        @resetDatabase="handleReset"
      />

      <!-- Estado vacío si no hay coincidencias -->
      <div v-if="filteredPieces.length === 0" class="py-20 text-center bg-white rounded-2xl border border-[#E6DFD5] p-8">
        <Package class="w-12 h-12 text-[#8D857B] mx-auto mb-3" />
        <h3 class="font-serif text-xl font-semibold text-[#1E1B18]">
          No se encontraron piezas con esos filtros
        </h3>
        <p class="text-xs text-[#6B655D] mt-1 mb-4">
          Prueba a limpiar la búsqueda o seleccionar otra categoría.
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-[#1E1B18] text-white text-xs font-medium rounded-lg cursor-pointer"
          >
            Ver todas las piezas
          </button>
          <router-link
            to="/piezas/nueva"
            class="px-4 py-2 bg-[#F28482] text-white text-xs font-medium rounded-lg cursor-pointer"
          >
            + Nueva Pieza
          </router-link>
        </div>
      </div>

      <!-- Animación con TransitionGroup: Grid de CardItem reutilizables -->
      <TransitionGroup
        v-else
        name="piece-grid"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <!-- Componente Reutilizable: CardItem -->
        <CardItem
          v-for="piece in filteredPieces"
          :key="piece.id"
          :piece="piece"
          @buy="cartService.addToCart(piece)"
          @delete="askDelete"
        />

        <!-- Tarjeta de Añadir Pieza Rápida (Exclusivo Administrador) -->
        <article
          v-if="isAdmin"
          key="add-new-card"
          class="flex flex-col justify-between p-8 bg-[#2D2A26] text-[#FAF7F2] rounded-2xl shadow-xs border border-[#3E3832] relative overflow-hidden"
        >
          <div class="relative z-10">
            <span class="text-[10px] font-semibold tracking-[0.2em] text-[#F28482] uppercase block mb-3">
              ADMINISTRACIÓN
            </span>
            <h3 class="font-serif text-3xl font-semibold text-white mb-4 leading-snug">
              ¿Quieres añadir una nueva pieza al catálogo?
            </h3>
            <p class="text-xs sm:text-sm text-[#D5CDC2] leading-relaxed mb-6">
              Completa el formulario de alta con validación de campos para registrar un nuevo modelo en la base de datos.
            </p>
          </div>

          <div class="relative z-10 pt-6 border-t border-white/10">
            <router-link
              to="/piezas/nueva"
              class="inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-xs font-semibold text-white bg-[#F28482] hover:bg-[#E06F6D] rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              <span>Nueva Pieza →</span>
            </router-link>
          </div>

          <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </article>
      </TransitionGroup>

      <!-- Tira de Garantías de compra -->
      <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 sm:p-8 bg-white rounded-2xl border border-[#E6DFD5]">
        <div class="flex items-start gap-3">
          <Truck class="w-5 h-5 text-[#F28482] shrink-0 mt-0.5" />
          <div>
            <h4 class="text-xs font-semibold text-[#1E1B18] mb-0.5">
              Envío Seguro 24/48h
            </h4>
            <p class="text-[11px] text-[#6B655D]">
              Embalaje anti-rotura con seguro total y envío gratis a partir de $ 80.000.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Sparkles class="w-5 h-5 text-[#F28482] shrink-0 mt-0.5" />
          <div>
            <h4 class="text-xs font-semibold text-[#1E1B18] mb-0.5">
              Garantía Artesanal
            </h4>
            <p class="text-[11px] text-[#6B655D]">
              Gres de alta resistencia cocido a 1260 °C, apto para uso alimentario.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <ShieldCheck class="w-5 h-5 text-[#F28482] shrink-0 mt-0.5" />
          <div>
            <h4 class="text-xs font-semibold text-[#1E1B18] mb-0.5">
              Devoluciones 14 Días
            </h4>
            <p class="text-[11px] text-[#6B655D]">
              Si no estás 100% satisfecho con tu pieza, te devolvemos el importe.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente Reutilizable: ModalConfirmacion con Transition -->
    <ModalConfirmacion
      :isOpen="isDeleteModalOpen"
      :piece="pieceToDelete"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script>
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Truck,
  Sparkles,
  ShieldCheck,
  Plus,
  ShoppingBag,
} from 'lucide-vue-next';
import { CATEGORIES } from '../data/ceramicsData';
import { ceramicsService } from '../services/ceramicsService';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { customerOrdersService } from '../services/customerOrdersService';
import Buscador from '../components/Buscador.vue';
import CardItem from '../components/CardItem.vue';
import ModalConfirmacion from '../components/ModalConfirmacion.vue';
import PromosBenefitsSection from '../components/PromosBenefitsSection.vue';

export default {
  name: 'CatalogView',
  components: {
    ArrowLeft,
    ChevronRight,
    Package,
    Truck,
    Sparkles,
    ShieldCheck,
    Plus,
    ShoppingBag,
    Buscador,
    CardItem,
    ModalConfirmacion,
    PromosBenefitsSection,
  },
  data() {
    return {
      ceramicsService,
      cartService,
      authService,
      customerOrdersService,
      activeCategory: 'todas',
      searchQuery: '',
      sortBy: 'fecha-desc',
      isDeleteModalOpen: false,
      pieceToDelete: null,
    };
  },
  // Propiedades computadas requeridas
  computed: {
    isAdmin() {
      return authService.isAdmin.value;
    },
    isCustomer() {
      return authService.isCustomer.value;
    },
    customerName() {
      return (
        authService.user.value?.user_metadata?.full_name ||
        authService.profile.value?.full_name ||
        'Cliente'
      );
    },
    customerInitial() {
      return (this.customerName || 'L').charAt(0).toUpperCase();
    },
    cartTotalItems() {
      const t = cartService.totalItems;
      return typeof t === 'number' ? t : (t?.value || 0);
    },
    totalPiecesCount() {
      const p = ceramicsService.pieces;
      const list = Array.isArray(p) ? p : (p?.value || []);
      return list.length;
    },

    categoriesWithCount() {
      const p = ceramicsService.pieces;
      const allPieces = Array.isArray(p) ? p : (p?.value || []);
      return CATEGORIES.map((cat) => {
        if (cat.id === 'todas') {
          return { ...cat, count: allPieces.length };
        }
        const count = allPieces.filter((item) => {
          if (cat.id === 'vasijas') {
            return item.category === 'vasijas' || item.category === 'vajilla';
          }
          return item.category === cat.id;
        }).length;
        return { ...cat, count };
      });
    },

    filteredPieces() {
      const p = ceramicsService.pieces;
      let list = Array.isArray(p) ? p : (p?.value || []);

      if (this.activeCategory !== 'todas') {
        list = list.filter((p) => {
          if (this.activeCategory === 'vasijas') {
            return p.category === 'vasijas' || p.category === 'vajilla';
          }
          return p.category === this.activeCategory;
        });
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.categoryLabel.toLowerCase().includes(q) ||
            (p.material && p.material.toLowerCase().includes(q))
        );
      }

      const sorted = [...list];
      if (this.sortBy === 'precio-asc') {
        sorted.sort((a, b) => a.priceNumber - b.priceNumber);
      } else if (this.sortBy === 'precio-desc') {
        sorted.sort((a, b) => b.priceNumber - a.priceNumber);
      } else if (this.sortBy === 'nombre-asc') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'nombre-desc') {
        sorted.sort((a, b) => b.title.localeCompare(a.title));
      } else if (this.sortBy === 'fecha-desc') {
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (this.sortBy === 'fecha-asc') {
        sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      } else if (this.sortBy === 'categoria') {
        sorted.sort((a, b) => a.category.localeCompare(b.category));
      }

      return sorted;
    },
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    console.log('[Ciclo de Vida] CatalogView creado (created hook)');
  },
  mounted() {
    console.log('[Ciclo de Vida] CatalogView montado (mounted hook)');
    const qCat = this.$route.query.categoria || this.$route.query.cat;
    if (qCat && CATEGORIES.some((c) => c.id === qCat)) {
      this.activeCategory = qCat;
    }
  },
  watch: {
    '$route.query'(newQuery) {
      const qCat = newQuery?.categoria || newQuery?.cat;
      if (qCat && CATEGORIES.some((c) => c.id === qCat)) {
        this.activeCategory = qCat;
      }
    },
  },
  methods: {
    resetFilters() {
      this.activeCategory = 'todas';
      this.searchQuery = '';
      this.sortBy = 'fecha-desc';
    },

    handleSelectCategory(catId) {
      this.activeCategory = catId;
      this.searchQuery = '';
    },

    askDelete(piece) {
      this.pieceToDelete = piece;
      this.isDeleteModalOpen = true;
    },

    confirmDelete() {
      if (this.pieceToDelete) {
        ceramicsService.delete(this.pieceToDelete.id);
        this.isDeleteModalOpen = false;
        this.pieceToDelete = null;
      }
    },

    handleReset() {
      if (confirm('¿Restablecer el catálogo a las 16 piezas iniciales de muestra?')) {
        ceramicsService.resetToDefaults();
      }
    },
  },
};
</script>

<style scoped>
/* Animación del TransitionGroup para el grid de piezas */
.piece-grid-enter-active,
.piece-grid-leave-active {
  transition: all 0.4s ease;
}

.piece-grid-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

.piece-grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.piece-grid-move {
  transition: transform 0.4s ease;
}
</style>
