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
      <nav class="hidden md:flex items-center gap-6 lg:gap-7">
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

        <!-- Enlace a Ventas (Visible solo para administradores) -->
        <router-link
          v-if="isAdmin"
          to="/ventas"
          class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#C85A54] hover:bg-[#FBE4E2]"
          :class="[$route.path === '/ventas' ? 'ring-1 ring-[#F28482] font-semibold' : '']"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span>Ventas</span>
          <span class="text-[9px] bg-[#F28482] text-white px-1.5 py-0.2 rounded-full font-bold">Admin</span>
        </router-link>
      </nav>

      <!-- Acciones del Header -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Botón Exportar SQL (Supabase) -->
        <button
          @click="isSqlModalOpen = true"
          type="button"
          class="hidden lg:inline-flex items-center justify-center gap-1.5 h-10 px-3.5 text-xs font-medium text-[#1E1B18] bg-white hover:bg-[#F3EFEA] rounded-xl border border-[#E6DFD5] transition-all cursor-pointer shadow-2xs leading-none"
          title="Exportar esquema SQL para Supabase"
        >
          <Database class="w-4 h-4 text-[#3ECF8E] shrink-0" />
          <span>Export SQL</span>
        </button>

        <!-- Botón Carrito de Compra -->
        <button
          @click="cartService.isCartOpen = true"
          class="relative inline-flex items-center justify-center gap-2 h-10 px-3.5 text-xs font-medium bg-white hover:bg-[#F3EFEA] text-[#1E1B18] rounded-xl border border-[#E6DFD5] transition-all shadow-2xs cursor-pointer leading-none"
          aria-label="Abrir cesta de compra"
        >
          <ShoppingBag class="w-4 h-4 text-[#F28482] shrink-0" />
          <span class="hidden sm:inline">Cesta</span>
          <span
            v-if="totalCartItems > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#F28482] rounded-full shrink-0"
          >
            {{ totalCartItems }}
          </span>
        </button>

        <!-- Botón Alta Rápida de Pieza (Admin) -->
        <router-link
          v-if="isAdmin"
          to="/piezas/nueva"
          class="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-3.5 sm:px-4 text-xs font-medium text-white bg-[#F28482] hover:bg-[#E06F6D] rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer leading-none"
        >
          <Plus class="w-4 h-4 shrink-0" />
          <span>Nueva Pieza</span>
        </router-link>

        <!-- Menú de Usuario / Autenticación -->
        <div class="relative flex items-center">
          <button
            v-if="currentUser"
            @click="userMenuOpen = !userMenuOpen"
            type="button"
            class="inline-flex items-center gap-2 h-10 px-2 sm:px-3 rounded-xl border border-[#E6DFD5] bg-white hover:bg-[#F3EFEA] transition-colors cursor-pointer text-xs leading-none"
          >
            <div class="w-7 h-7 rounded-full bg-[#1E1B18] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
              <img
                v-if="currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture"
                :src="currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ userInitial }}</span>
            </div>
            <div class="hidden sm:flex flex-col text-left leading-tight">
              <span class="font-medium text-[#1E1B18] truncate max-w-[100px]">
                {{ userName }}
              </span>
              <span
                v-if="isAdmin"
                class="text-[9px] font-semibold text-[#F28482] uppercase"
              >
                Admin
              </span>
              <span v-else class="text-[9px] text-[#8D857B]">
                Cliente
              </span>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-[#8D857B] hidden sm:inline shrink-0" />
          </button>

          <!-- Botón Iniciar Sesión (si no hay sesión) -->
          <button
            v-else
            @click="isAuthModalOpen = true"
            type="button"
            class="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 text-xs font-medium text-[#1E1B18] bg-white hover:bg-[#F3EFEA] rounded-xl border border-[#E6DFD5] transition-all shadow-2xs cursor-pointer leading-none"
          >
            <User class="w-4 h-4 text-[#8D857B] shrink-0" />
            <span class="hidden sm:inline">Ingresar</span>
          </button>

          <!-- Dropdown Menú de Usuario -->
          <div
            v-if="userMenuOpen && currentUser"
            class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E6DFD5] py-2 z-50 animate-fade-in"
          >
            <div class="px-4 py-3 border-b border-[#F3EFEA]">
              <p class="text-xs font-semibold text-[#1E1B18] truncate">
                {{ userName }}
              </p>
              <p class="text-[11px] text-[#8D857B] truncate">
                {{ currentUser.email }}
              </p>
              <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                :class="isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-[#FAF7F2] text-[#6B655D] border border-[#E6DFD5]'"
              >
                <Shield v-if="isAdmin" class="w-3 h-3 text-[#F28482]" />
                <span>{{ isAdmin ? 'Administrador del Catálogo' : 'Cliente Registrado' }}</span>
              </div>
            </div>

            <div class="py-1">
              <router-link
                v-if="isAdmin"
                to="/piezas/nueva"
                @click="userMenuOpen = false"
                class="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D2A26] hover:bg-[#FAF7F2] transition-colors"
              >
                <Plus class="w-3.5 h-3.5 text-[#F28482]" />
                <span>+ Crear nueva pieza</span>
              </router-link>

              <router-link
                v-if="isAdmin"
                to="/ventas"
                @click="userMenuOpen = false"
                class="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D2A26] hover:bg-[#FAF7F2] transition-colors"
              >
                <BarChart3 class="w-3.5 h-3.5 text-[#F28482]" />
                <span>Panel de ventas y pedidos</span>
              </router-link>

              <button
                @click="isSqlModalOpen = true; userMenuOpen = false"
                type="button"
                class="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D2A26] hover:bg-[#FAF7F2] transition-colors text-left cursor-pointer"
              >
                <Database class="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Exportar SQL (Supabase)</span>
              </button>
            </div>

            <div class="pt-1 border-t border-[#F3EFEA]">
              <button
                @click="handleLogout"
                type="button"
                class="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>

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

      <router-link
        v-if="isAdmin"
        to="/ventas"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-semibold text-[#C85A54] flex items-center justify-between"
      >
        <span>Panel de Ventas</span>
        <span class="text-[10px] bg-[#F28482] text-white px-2 py-0.5 rounded-full">Admin</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/piezas/nueva"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-semibold text-[#1E1B18] flex items-center gap-2"
      >
        <Plus class="w-4 h-4 text-[#F28482]" />
        <span>+ Nueva Pieza</span>
      </router-link>

      <button
        @click="mobileMenuOpen = false; isSqlModalOpen = true"
        type="button"
        class="w-full text-left py-2 text-sm font-medium text-[#2D2A26] flex items-center gap-2 cursor-pointer"
      >
        <Database class="w-4 h-4 text-[#3ECF8E]" />
        <span>Exportar Esquema SQL</span>
      </button>

      <button
        @click="mobileMenuOpen = false; cartService.isCartOpen = true"
        class="w-full text-left py-2 text-sm font-medium text-[#1E1B18] flex items-center gap-2 cursor-pointer border-t border-[#E6DFD5] pt-3"
      >
        <ShoppingBag class="w-4 h-4 text-[#F28482]" />
        <span>Ver Cesta de Compra ({{ totalCartItems }})</span>
      </button>

      <div class="border-t border-[#E6DFD5] pt-3">
        <button
          v-if="!currentUser"
          @click="mobileMenuOpen = false; isAuthModalOpen = true"
          class="w-full text-left py-2 text-sm font-medium text-[#F28482] flex items-center gap-2 cursor-pointer"
        >
          <User class="w-4 h-4" />
          <span>Iniciar sesión / Registrarse</span>
        </button>
        <div v-else class="flex items-center justify-between py-2">
          <div class="text-xs">
            <span class="font-semibold block text-[#1E1B18]">{{ userName }}</span>
            <span class="text-[#8D857B]">{{ currentUser.email }}</span>
          </div>
          <button
            @click="handleLogout"
            class="text-xs text-red-600 font-medium hover:underline cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>

    <!-- Modales de Autenticación y Exportación SQL -->
    <AuthModal
      :isOpen="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />

    <SqlExportModal
      :isOpen="isSqlModalOpen"
      @close="isSqlModalOpen = false"
    />
  </header>
</template>

<script>
import {
  ShoppingBag,
  Menu,
  X,
  Plus,
  User,
  LogOut,
  Shield,
  ChevronDown,
  Database,
  BarChart3,
} from 'lucide-vue-next';
import { cartService } from '../services/cartService';
import { ceramicsService } from '../services/ceramicsService';
import { authService } from '../services/authService';
import AuthModal from './AuthModal.vue';
import SqlExportModal from './SqlExportModal.vue';

export default {
  name: 'Navbar',
  components: {
    ShoppingBag,
    Menu,
    X,
    Plus,
    User,
    LogOut,
    Shield,
    ChevronDown,
    Database,
    BarChart3,
    AuthModal,
    SqlExportModal,
  },
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
      isAuthModalOpen: false,
      isSqlModalOpen: false,
      cartService,
      ceramicsService,
      authService,
    };
  },
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
    currentUser() {
      return authService.user.value;
    },
    isAdmin() {
      return authService.isAdmin.value;
    },
    userName() {
      const u = authService.user.value;
      if (!u) return '';
      return (
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        authService.profile.value?.full_name ||
        u.email?.split('@')[0] ||
        'Usuario'
      );
    },
    userInitial() {
      const name = this.userName || 'U';
      return name.charAt(0).toUpperCase();
    },
  },
  methods: {
    async handleLogout() {
      this.userMenuOpen = false;
      this.mobileMenuOpen = false;
      await authService.signOut();
    },
  },
  created() {
    // Hook created ejecutado en Navbar
  },
  mounted() {
    // Cerrar menú de usuario al hacer click afuera
    window.addEventListener('click', (e) => {
      if (this.userMenuOpen && !e.target.closest('.relative')) {
        this.userMenuOpen = false;
      }
    });
  },
};
</script>
