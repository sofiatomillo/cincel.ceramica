<template>
  <footer class="bg-[#1E1B18] text-[#D5CDC2] pt-16 pb-12 border-t border-[#3E3832]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <p class="text-sm text-[#9E958B] max-w-sm leading-relaxed">
            Formas simples. Espacios con carácter. Cerámica contemporánea y piezas utilitarias elaboradas a mano en torno artesanal, celebrando la textura natural del barro y la belleza de lo imperfecto.
          </p>
          <div class="pt-2 text-xs text-[#9E958B] space-y-1">
            <p>Gorriti 4825, Palermo Soho · CABA, Argentina</p>
            <p>hola@cincelceramica.com.ar · +54 11 4832-6540</p>
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
            <li>
              <router-link to="/piezas/nueva" class="hover:text-white transition-colors">
                Nueva Pieza
              </router-link>
            </li>
            <li>
              <router-link to="/acerca-de" class="hover:text-white transition-colors">
                Página Acerca de
              </router-link>
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
            <li>
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
        <p>© 2026 Cincel Cerámica. Todos los derechos reservados.</p>
        <p>Piezas artesanales horneadas a alta temperatura con esmaltes minerales únicos.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { cartService } from '../services/cartService';
import { ceramicsService } from '../services/ceramicsService';

export default {
  name: 'Footer',
  data() {
    return {
      cartService,
      ceramicsService,
    };
  },
  // Propiedades computadas seguras
  computed: {
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
  // Hooks del ciclo de vida
  created() {
    // Hook created ejecutado en Footer
  },
  mounted() {
    // Hook mounted ejecutado en Footer
  },
};
</script>
