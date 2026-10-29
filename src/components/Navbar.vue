<template>
  <header class="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFD5] transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Logo / Marca -->
      <router-link to="/" class="flex items-baseline gap-2.5 group text-left">
        <span class="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-[#1E1B18] group-hover:text-[#F28482] transition-colors">
          CINCEL
        </span>
        <span class="text-[10px] tracking-[0.25em] font-semibold text-[#8D857B] uppercase">
          CERÁMICA
        </span>
      </router-link>

      <!-- Enlaces de Navegación (Desktop) -->
      <nav class="hidden md:flex items-center gap-7">
        <router-link
          to="/"
          class="text-sm font-medium transition-colors"
          :class="[$route.path === '/' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26] hover:text-[#F28482]']"
        >
          Inicio
        </router-link>

        <router-link
          to="/catalogo"
          class="text-sm font-medium transition-colors"
          :class="[$route.path === '/catalogo' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26] hover:text-[#F28482]']"
        >
          Catálogo
        </router-link>

        <router-link
          to="/acerca-de"
          class="text-sm font-medium transition-colors"
          :class="[$route.path === '/acerca-de' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26] hover:text-[#F28482]']"
        >
          Acerca de
        </router-link>

        <router-link
          to="/#contacto"
          class="text-sm font-medium text-[#2D2A26] hover:text-[#F28482] transition-colors"
        >
          Contacto
        </router-link>
      </nav>

      <!-- Acciones del Header -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Botón Carrito de Compra -->
        <button
          @click="cartService.isCartOpen = true"
          class="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white hover:bg-[#F3EFEA] text-[#1E1B18] rounded-xl border border-[#E6DFD5] transition-all shadow-2xs cursor-pointer"
          aria-label="Abrir cesta de compra"
        >
          <ShoppingBag class="w-4 h-4 text-[#F28482]" />
          <span class="hidden sm:inline">Cesta</span>
          <span
            v-if="totalCartItems > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#F28482] rounded-full"
          >
            {{ totalCartItems }}
          </span>
        </button>

        <!-- Botón Alta Rápida de Pieza -->
        <router-link
          to="/piezas/nueva"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-[#F28482] hover:bg-[#E06F6D] rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Nueva Pieza</span>
        </router-link>

        <!-- Menú móvil toggle -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Menú móvil desplegable -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-[#FAF7F2] border-b border-[#E6DFD5] px-4 py-4 space-y-3 animate-fade-in">
      <router-link
        to="/"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium"
        :class="[$route.path === '/' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26]']"
      >
        Página Inicio
      </router-link>
      <router-link
        to="/catalogo"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium"
        :class="[$route.path === '/catalogo' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26]']"
      >
        Catálogo
      </router-link>
      <router-link
        to="/acerca-de"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium"
        :class="[$route.path === '/acerca-de' ? 'text-[#F28482] font-semibold' : 'text-[#2D2A26]']"
      >
        Página Acerca de
      </router-link>
      <button
        @click="mobileMenuOpen = false; cartService.isCartOpen = true"
        class="w-full text-left py-2 text-sm font-medium text-[#1E1B18] flex items-center gap-2 cursor-pointer border-t border-[#E6DFD5] pt-3"
      >
        <ShoppingBag class="w-4 h-4 text-[#F28482]" />
        <span>Ver Cesta de Compra ({{ totalCartItems }})</span>
      </button>
    </div>
  </header>
</template>

<script>
import { ShoppingBag, Menu, X, Plus } from 'lucide-vue-next';
import { cartService } from '../services/cartService';
import { ceramicsService } from '../services/ceramicsService';

export default {
  name: 'Navbar',
  components: {
    ShoppingBag,
    Menu,
    X,
    Plus,
  },
  data() {
    return {
      mobileMenuOpen: false,
      cartService,
      ceramicsService,
    };
  },
  // Propiedades computadas seguras
  computed: {
    totalCount() {
      const p = ceramicsService.pieces;
      const list = Array.isArray(p) ? p : (p?.value || []);
      return list.length;
    },
    totalCartItems() {
      const t = cartService.totalItems;
      return typeof t === 'number' ? t : (t?.value || 0);
    },
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    // Hook created ejecutado en Navbar
  },
  mounted() {
    // Hook mounted ejecutado en Navbar
  },
};
</script>
