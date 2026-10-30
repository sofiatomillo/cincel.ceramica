<template>
  <footer class="bg-[#1E1B18] text-[#D5CDC2] pt-16 pb-12 border-t border-[#3E3832]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Barra de Administrador en Footer -->
      <div v-if="isAdmin" class="mb-8 p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-amber-200">
          <span class="w-2 h-2 rounded-full bg-[#F28482] animate-pulse"></span>
          <span class="font-semibold">Panel de Administración de Información:</span>
          <span class="text-white/70">Textos, dirección, contacto e imágenes del sitio</span>
        </div>
        <button
          @click.stop="openContentEditor('footer')"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F28482] hover:bg-[#E06F6D] text-white rounded-xl font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Edit3 class="w-3.5 h-3.5" />
          <span>Modificar textos del footer y contacto</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-baseline gap-2">
            <span class="font-serif text-2xl font-bold tracking-[0.18em] text-white">
              CINCEL
            </span>
            <span class="text-[10px] tracking-[0.25em] font-semibold text-[#9E958B] uppercase">
              CERÁMICA
            </span>
          </div>
          <p class="text-sm text-[#9E958B] max-w-sm leading-relaxed whitespace-pre-line">
            {{ siteContent.footer.brandDescription }}
          </p>
          <div class="pt-2 text-xs text-[#9E958B] space-y-1">
            <p>{{ siteContent.footer.address }}</p>
            <p>{{ siteContent.footer.email }} · {{ siteContent.footer.phone }}</p>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">
            Navegación
          </h4>
          <ul class="space-y-2 text-sm text-[#9E958B]">
            <li>
              <router-link to="/" class="hover:text-white transition-colors">
                Página Inicio
              </router-link>
            </li>
            <li>
              <router-link to="/catalogo" class="hover:text-white transition-colors">
                Catálogo
              </router-link>
            </li>
            <li v-if="isAdmin">
              <router-link to="/piezas/nueva" class="hover:text-white transition-colors">
                Nueva Pieza
              </router-link>
            </li>
            <li>
              <router-link to="/acerca-de" class="hover:text-white transition-colors">
                Página Acerca de
              </router-link>
            </li>
            <li v-if="isAdmin">
              <button
                @click.stop="openContentEditor('hero')"
                type="button"
                class="hover:text-[#F28482] transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-xs flex items-center gap-1 text-[#F28482]"
              >
                <Edit3 class="w-3 h-3" />
                <span>Editar contenido del sitio</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-semibold uppercase tracking-widest text-white mb-4">
            Taller y Tienda
          </h4>
          <ul class="space-y-2 text-sm text-[#9E958B]">
            <li>
              <button
                @click="cartService.isCartOpen = true"
                class="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left"
              >
                Ver Cesta ({{ totalCartItems }})
              </button>
            </li>
            <li v-if="isAdmin">
              <button
                @click="ceramicsService.resetToDefaults()"
                class="hover:text-[#F28482] transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-xs"
              >
                Restablecer catálogo inicial
              </button>
            </li>
            <li>
              <router-link to="/#contacto" class="hover:text-white transition-colors">
                Contacto y visitas
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8D857B]">
        <p>{{ siteContent.footer.copyright }}</p>
        <p>{{ siteContent.footer.bottomNote }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { Edit3 } from 'lucide-vue-next';
import { cartService } from '../services/cartService';
import { ceramicsService } from '../services/ceramicsService';
import { authService } from '../services/authService';
import { siteContentService } from '../services/siteContentService';

export default {
  name: 'Footer',
  components: {
    Edit3,
  },
  data() {
    return {
      cartService,
      ceramicsService,
      authService,
      siteContentService,
    };
  },
  computed: {
    isAdmin() {
      return authService.isAdmin.value;
    },
    siteContent() {
      return siteContentService.content.value;
    },
    totalPiecesCount() {
      const p = ceramicsService.pieces;
      const list = Array.isArray(p) ? p : (p?.value || []);
      return list.length;
    },
    totalCartItems() {
      const t = cartService.totalItems;
      return typeof t === 'number' ? t : (t?.value || 0);
    },
  },
  methods: {
    openContentEditor(section = 'footer') {
      siteContentService.openEditor(section);
    },
  },
  created() {
    // Hook created ejecutado en Footer
  },
  mounted() {
    // Hook mounted ejecutado en Footer
  },
};
</script>
