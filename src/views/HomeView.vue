<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative pt-8 pb-16 sm:py-20 lg:py-24 overflow-hidden">
      <!-- Botón de Administrador para modificar Portada -->
      <div v-if="isAdmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div class="inline-flex items-center gap-2 p-1.5 px-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-[#F28482] animate-pulse"></span>
          <span class="font-semibold text-[#1E1B18]">Modo Administrador:</span>
          <button
            @click.stop="openContentEditor('hero')"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#FAF7F2] text-[#F28482] border border-[#F28482]/40 rounded-lg font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Modificar portada (textos, imagen y datos)</span>
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <!-- Lado izquierdo: Textos y llamadas a la acción -->
          <div class="lg:col-span-7 flex flex-col justify-center">
            <div class="inline-flex items-center gap-2 mb-4">
              <span class="w-6 h-px bg-[#F28482]" />
              <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482]">
                {{ siteContent.hero.eyebrow }}
              </span>
            </div>

            <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-[#1E1B18] mb-6 whitespace-pre-line">
              {{ siteContent.hero.title }}
            </h1>

            <p class="text-base sm:text-lg text-[#6B655D] leading-relaxed max-w-xl mb-8">
              {{ siteContent.hero.description }}
            </p>

            <div class="flex flex-wrap items-center gap-4 mb-12">
              <router-link
                to="/catalogo"
                class="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1E1B18] hover:bg-[#38342E] text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>{{ siteContent.hero.buttonCatalogText || 'Ver catálogo completo' }} ({{ totalPiecesCount }} piezas)</span>
                <ArrowRight class="w-4 h-4" />
              </router-link>
              <router-link
                to="/acerca-de"
                class="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-[#F3EFEA] text-[#2D2A26] border border-[#E6DFD5] text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                {{ siteContent.hero.buttonWorkshopText || 'Conocer el taller' }}
              </router-link>
            </div>

            <!-- Pilares de calidad -->
            <div class="grid grid-cols-3 gap-4 pt-8 border-t border-[#E6DFD5]">
              <div>
                <strong class="block font-serif text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
                  {{ siteContent.hero.stat1Number }}
                </strong>
                <span class="text-xs text-[#6B655D]">{{ siteContent.hero.stat1Label }}</span>
              </div>
              <div>
                <strong class="block font-serif text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
                  {{ siteContent.hero.stat2Number }}
                </strong>
                <span class="text-xs text-[#6B655D]">{{ siteContent.hero.stat2Label }}</span>
              </div>
              <div>
                <strong class="block font-serif text-2xl sm:text-3xl font-semibold text-[#1E1B18]">
                  {{ siteContent.hero.stat3Number }}
                </strong>
                <span class="text-xs text-[#6B655D]">{{ siteContent.hero.stat3Label }}</span>
              </div>
            </div>
          </div>

          <!-- Lado derecho: Imagen Hero -->
          <div class="lg:col-span-5">
            <div class="relative group rounded-2xl overflow-hidden bg-[#F3EFEA] shadow-xl border border-[#E6DFD5]">
              <img
                :src="siteContent.hero.imageSrc"
                :alt="siteContent.hero.imageAlt || 'Hero Cincel Cerámica'"
                class="w-full aspect-4/3 object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div class="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
              <button
                v-if="isAdmin"
                @click.stop="openContentEditor('hero')"
                type="button"
                class="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 hover:bg-white text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E6DFD5] shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform hover:scale-105 z-20"
              >
                <Edit3 class="w-3.5 h-3.5 text-[#F28482]" />
                <span>Cambiar imagen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PREVIEW DESTACADA DE COLECCIONES CON ENLACE AL CATÁLOGO COMPLETO -->
    <section class="py-20 bg-white border-y border-[#E6DFD5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
              COLECCIÓN DISPONIBLE
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1B18]">
              Piezas de Cerámica en Venta
            </h2>
          </div>

          <router-link
            to="/catalogo"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EFEA] text-[#1E1B18] text-xs font-semibold rounded-full border border-[#E6DFD5] transition-colors cursor-pointer"
          >
            Abrir listado completo ({{ totalPiecesCount }} piezas disponibles)
            <ArrowRight class="w-3.5 h-3.5 text-[#F28482]" />
          </router-link>
        </div>

        <!-- Grid con las primeras 3 piezas destacadas usando CardItem -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CardItem
            v-for="piece in featuredPieces"
            :key="piece.id"
            :piece="piece"
            @buy="cartService.addToCart(piece)"
            @delete="handlePieceDelete"
          />
        </div>

        <!-- Banner con enlace directo al catálogo -->
        <div class="mt-12 p-8 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 class="font-serif text-2xl font-semibold text-[#1E1B18] mb-1">
              Explora las {{ totalPiecesCount }} piezas del catálogo
            </h3>
            <p class="text-xs sm:text-sm text-[#6B655D]">
              Puedes filtrar por categoría, ordenar por precio, fecha o nombre, y registrar nuevas piezas.
            </p>
          </div>
          <router-link
            to="/catalogo"
            class="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1E1B18] hover:bg-[#38342E] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-102"
          >
            Ir al catálogo de piezas
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- SECCIÓN SERVICIOS -->
    <section id="servicios" class="py-20 lg:py-24 bg-[#FAF7F2]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Botón de Administrador para modificar Servicios -->
        <div v-if="isAdmin" class="mb-6 flex justify-end">
          <button
            @click.stop="openContentEditor('services')"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#F28482] border border-[#F28482]/40 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Modificar sección Servicios (textos, imagen y lista)</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-7">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
              {{ siteContent.services.eyebrow }}
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1E1B18] mb-6 leading-tight">
              {{ siteContent.services.title }}
            </h2>
            <p class="text-base text-[#6B655D] leading-relaxed mb-10 max-w-xl">
              {{ siteContent.services.description }}
            </p>

            <div class="space-y-6">
              <div
                v-for="serv in siteContent.services.items"
                :key="serv.id || serv.number"
                class="p-5 bg-white rounded-xl border border-[#E6DFD5] hover:border-[#D5CDC2] transition-colors"
              >
                <div class="flex items-start gap-4">
                  <span class="font-serif text-2xl font-semibold text-[#F28482] shrink-0">
                    {{ serv.number }}
                  </span>
                  <div>
                    <h4 class="font-serif text-xl font-semibold text-[#1E1B18] mb-1">
                      {{ serv.title }}
                    </h4>
                    <p class="text-sm text-[#6B655D] leading-relaxed mb-2">
                      {{ serv.description }}
                    </p>
                    <span class="text-xs text-[#8D857B] font-medium block">
                      {{ serv.details }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5">
            <div class="relative group rounded-2xl overflow-hidden bg-[#F3EFEA] shadow-xl border border-[#E6DFD5]">
              <img
                :src="siteContent.services.imageSrc"
                :alt="siteContent.services.imageAlt || 'Servicios Cincel Cerámica'"
                class="w-full aspect-16/10 object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div v-if="siteContent.services.imageCaption" class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-[#E6DFD5] shadow-xs">
                <p class="text-xs font-serif font-medium text-[#1E1B18]">
                  {{ siteContent.services.imageCaption }}
                </p>
              </div>
              <button
                v-if="isAdmin"
                @click.stop="openContentEditor('services')"
                type="button"
                class="absolute top-3 right-3 px-3 py-1.5 bg-white/95 hover:bg-white text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E6DFD5] shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform hover:scale-105 z-20"
              >
                <Edit3 class="w-3.5 h-3.5 text-[#F28482]" />
                <span>Cambiar imagen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN LA EMPRESA -->
    <section id="la-empresa" class="py-20 lg:py-24 bg-white border-y border-[#E6DFD5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Botón de Administrador para modificar Empresa -->
        <div v-if="isAdmin" class="mb-6 flex justify-end">
          <button
            @click.stop="openContentEditor('empresa')"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-white text-[#F28482] border border-[#F28482]/40 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Modificar sección Sobre Nosotros (textos e imagen)</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-5 order-2 lg:order-1">
            <div class="relative group rounded-2xl overflow-hidden bg-[#F3EFEA] shadow-xl border border-[#E6DFD5]">
              <img
                :src="siteContent.empresa.imageSrc"
                :alt="siteContent.empresa.imageAlt || 'Sobre Nosotros'"
                class="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div class="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
              <button
                v-if="isAdmin"
                @click.stop="openContentEditor('empresa')"
                type="button"
                class="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 hover:bg-white text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E6DFD5] shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform hover:scale-105 z-20"
              >
                <Edit3 class="w-3.5 h-3.5 text-[#F28482]" />
                <span>Cambiar imagen</span>
              </button>
            </div>
          </div>

          <div class="lg:col-span-7 order-1 lg:order-2">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
              {{ siteContent.empresa.eyebrow }}
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1E1B18] mb-6 leading-tight">
              {{ siteContent.empresa.title }}
            </h2>

            <p class="text-base sm:text-lg text-[#2D2A26] font-medium leading-relaxed mb-4">
              {{ siteContent.empresa.lead }}
            </p>

            <p class="text-sm sm:text-base text-[#6B655D] leading-relaxed mb-6">
              {{ siteContent.empresa.paragraph }}
            </p>

            <div class="mb-8">
              <router-link
                to="/acerca-de"
                class="text-xs font-semibold text-[#F28482] hover:text-[#E06F6D] inline-flex items-center gap-1.5"
              >
                <span>Leer la historia completa del taller y el proceso de cocción</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#E6DFD5]">
              <div v-for="(val, idx) in STUDIO_VALUES" :key="idx" class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-[#F28482] shrink-0 mt-0.5" />
                <div>
                  <strong class="block text-xs font-semibold text-[#1E1B18]">
                    {{ val.title }}
                  </strong>
                  <span class="text-xs text-[#6B655D]">
                    {{ val.description }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN CONTACTO -->
    <section id="contacto" class="py-20 lg:py-24 bg-[#F3EFEA]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-[#E6DFD5]">
          <div class="text-center max-w-xl mx-auto mb-10">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#F28482] block mb-2">
              CONTACTO DIRECTO
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1B18] mb-3">
              Hablemos de tu pieza o proyecto
            </h2>
            <p class="text-sm text-[#6B655D]">
              Escríbenos para consultas sobre catálogo, pedidos especiales o visitas al taller. Te responderemos en menos de 24 horas.
            </p>
          </div>

          <Transition name="fade">
            <div v-if="formSubmitted" class="p-8 bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl text-center space-y-3">
              <div class="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 class="w-6 h-6" />
              </div>
              <h3 class="font-serif text-2xl font-semibold text-[#2E7D32]">
                ¡Mensaje recibido con éxito!
              </h3>
              <p class="text-xs sm:text-sm text-[#388E3C] max-w-md mx-auto">
                Muchas gracias por contactarnos. Nuestro taller se pondrá en contacto contigo muy pronto.
              </p>
            </div>
          </Transition>

          <form v-if="!formSubmitted" @submit.prevent="handleFormSubmit" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  v-model="formData.name"
                  placeholder="Nombre y apellido"
                  class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  v-model="formData.email"
                  placeholder="tu@correo.com"
                  class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] transition-colors"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
                  Tipo de consulta
                </label>
                <select
                  v-model="formData.inquiryType"
                  class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] transition-colors cursor-pointer"
                >
                  <option value="catalogo">Consulta sobre pieza de catálogo</option>
                  <option value="a-medida">Proyecto a medida / vajilla personalizada</option>
                  <option value="restaurante">Cerámica para hostelería / interiorismo</option>
                  <option value="visita">Visita al taller artesanal</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  v-model="formData.phone"
                  placeholder="+54 11 1234 5678"
                  class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1E1B18] mb-1.5 uppercase tracking-wider">
                Mensaje *
              </label>
              <textarea
                rows="4"
                required
                v-model="formData.message"
                placeholder="Cuéntanos qué pieza buscas, qué tonalidades tienes en mente o cualquier detalle..."
                class="w-full px-4 py-3 text-sm bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#F28482] transition-colors"
              />
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span class="text-xs text-[#8D857B]">
                Al enviar aceptas nuestra política de privacidad.
              </span>
              <button
                type="submit"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#F28482] hover:bg-[#E06F6D] text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>Enviar mensaje</span>
                <Send class="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ArrowRight, CheckCircle2, ShoppingBag, Send, Edit3 } from 'lucide-vue-next';
import { BANNER_IMAGES, SERVICES, STUDIO_VALUES } from '../data/ceramicsData';
import { ceramicsService } from '../services/ceramicsService';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { siteContentService } from '../services/siteContentService';
import CardItem from '../components/CardItem.vue';

export default {
  name: 'HomeView',
  components: {
    ArrowRight,
    CheckCircle2,
    ShoppingBag,
    Send,
    Edit3,
    CardItem,
  },
  data() {
    return {
      BANNER_IMAGES,
      SERVICES,
      STUDIO_VALUES,
      ceramicsService,
      cartService,
      authService,
      siteContentService,
      formSubmitted: false,
      formData: {
        name: '',
        email: '',
        inquiryType: 'catalogo',
        phone: '',
        message: '',
      },
    };
  },
  // Propiedades computadas requeridas
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
    featuredPieces() {
      const p = ceramicsService.pieces;
      const list = Array.isArray(p) ? p : (p?.value || []);
      return list.slice(0, 3);
    },
  },
  // Hooks del ciclo de vida requeridos: created() y mounted()
  created() {
    console.log('[Ciclo de Vida] HomeView creado (created hook)');
  },
  mounted() {
    console.log('[Ciclo de Vida] HomeView montado (mounted hook)');
  },
  methods: {
    openContentEditor(section = 'hero') {
      siteContentService.openEditor(section);
    },
    handlePieceDelete(piece) {
      if (confirm(`¿Eliminar «${piece.title}»?`)) {
        ceramicsService.delete(piece.id);
      }
    },
    handleFormSubmit() {
      this.formSubmitted = true;
      setTimeout(() => {
        this.formData = {
          name: '',
          email: '',
          inquiryType: 'catalogo',
          phone: '',
          message: '',
        };
        this.formSubmitted = false;
      }, 5000);
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
